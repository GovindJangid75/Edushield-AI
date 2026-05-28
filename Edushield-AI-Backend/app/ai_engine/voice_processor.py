# app/ai_engine/voice_processor.py
"""
Voice Processor — Transcribes teacher voice notes (Hindi/English) and extracts
student risk signals using OpenAI Whisper + GPT-4o-mini.

Updated for openai >= 1.0 (new client-based API).
Falls back gracefully to keyword-based extraction when no API key is set.
"""
import json
import re
import logging
from typing import Dict, List, Optional

logger = logging.getLogger("edushield_ai.voice")


def _get_openai_client():
    """Return an openai.OpenAI client, or None if the key is missing."""
    try:
        import openai as _openai
        from app.config import get_settings
        key = get_settings().OPENAI_API_KEY
        if not key:
            return None
        return _openai.OpenAI(api_key=key)
    except Exception:
        return None


class VoiceProcessor:
    """
    Process teacher voice observations.

    Pipeline
    --------
    1. Transcribe audio via Whisper (whisper-1)
    2. Detect concern level from keyword matching (Hindi + English)
    3. Detect sentiment
    4. Extract structured insights via GPT-4o-mini (falls back to regex on error)
    5. Return unified dict ready for DB insertion
    """

    # ── Keyword dictionaries (Hindi transliteration included) ──────────

    CONCERN_KEYWORDS: Dict[str, List[str]] = {
        'critical': [
            'not coming', 'stopped attending', 'never participates',
            'very worried', 'completely disengaged', 'family problem',
            'suicidal', 'run away',
            # Hindi
            'nahi aa raha', 'bilkul nahi bolta', 'bahut chinta', 'ghar mein samasya',
            'नहीं आ रहा', 'बिल्कुल नहीं बोलता', 'बहुत चिंता', 'घर में समस्या',
        ],
        'high': [
            'absent frequently', 'marks dropping', 'not submitting',
            'behavior changed', 'seems upset', 'avoiding',
            # Hindi
            'aksar gairhazir', 'number gir rahe', 'homework nahi', 'udas lagta',
            'अक्सर गैरहाजिर', 'नंबर गिर रहे', 'होमवर्क नहीं', 'उदास लगता',
        ],
        'medium': [
            'quiet', 'not asking questions', 'low confidence',
            'needs attention', 'struggling', 'distracted',
            # Hindi
            'chup rehta', 'sawaal nahi puchta', 'dhyan nahi', 'kamzor',
            'चुप रहता', 'सवाल नहीं पूछता', 'ध्यान नहीं', 'कमजोर',
        ],
    }

    SENTIMENT_KEYWORDS: Dict[str, List[str]] = {
        'concerning': [
            'worried', 'concerned', 'problem', 'issue', 'trouble', 'fear',
            'chintit', 'pareshan', 'samasya', 'mushkil',
            'चिंतित', 'परेशान', 'समस्या', 'मुश्किल',
        ],
        'positive': [
            'good', 'improving', 'better', 'active', 'interested', 'progress',
            'accha', 'sudhar', 'behtar', 'mehanti',
            'अच्छा', 'सुधार', 'बेहतर', 'मेहनती',
        ],
        'neutral': ['okay', 'average', 'normal', 'fine', 'theek', 'samanya', 'ठीक', 'सामान्य'],
    }

    # ── Transcription ──────────────────────────────────────────────────

    async def process_audio(self, audio_file_path: str, language: str = 'hi') -> Dict:
        """
        Transcribe an audio file and extract insights.

        Parameters
        ----------
        audio_file_path : str   Path to uploaded audio file (mp3/wav/m4a/webm)
        language        : str   'hi' (Hindi) or 'en' (English) hint for Whisper

        Returns
        -------
        Full processed dict (same structure as process_text)
        """
        client = _get_openai_client()
        transcribed_text = ''
        detected_language = language

        if client:
            try:
                with open(audio_file_path, 'rb') as audio_file:
                    transcript = client.audio.transcriptions.create(
                        model='whisper-1',
                        file=audio_file,
                        language=language if language != 'auto' else None,
                        response_format='verbose_json',
                    )
                transcribed_text   = transcript.text or ''
                detected_language  = getattr(transcript, 'language', language)
            except Exception as exc:
                logger.warning(f"Whisper transcription failed: {exc}")
                transcribed_text = ''
        else:
            logger.info("OpenAI key not set — skipping Whisper transcription.")

        result = self.process_text(transcribed_text or '[Audio could not be transcribed]', language)
        result['language_detected'] = detected_language
        return result

    # ── Text processing ────────────────────────────────────────────────

    def process_text(self, text: str, language: str = 'hi') -> Dict:
        """
        Process a (typed or transcribed) observation.

        Returns
        -------
        {
          transcribed_text    : str
          language_detected   : str
          sentiment           : str     ('concerning' | 'positive' | 'neutral')
          concern_level       : str     ('critical' | 'high' | 'medium' | 'low')
          extracted_insights  : dict    (structured AI output)
          key_points          : list[str]
          confidence          : float
        }
        """
        text_lower = text.lower()

        concern_level = self._detect_concern_level(text_lower)
        sentiment     = self._detect_sentiment(text_lower)
        insights      = self._extract_insights(text, language)
        key_points    = self._extract_key_points(text)
        confidence    = self._estimate_confidence(text, insights)

        return {
            'transcribed_text':   text,
            'language_detected':  language,
            'sentiment':          sentiment,
            'concern_level':      concern_level,
            'extracted_insights': insights,
            'key_points':         key_points,
            'confidence':         confidence,
        }

    # ── Keyword matchers ───────────────────────────────────────────────

    def _detect_concern_level(self, text: str) -> str:
        for level in ('critical', 'high', 'medium'):
            for kw in self.CONCERN_KEYWORDS[level]:
                if kw.lower() in text:
                    return level
        return 'low'

    def _detect_sentiment(self, text: str) -> str:
        scores = {s: 0 for s in self.SENTIMENT_KEYWORDS}
        for sentiment, kws in self.SENTIMENT_KEYWORDS.items():
            for kw in kws:
                if kw.lower() in text:
                    scores[sentiment] += 1
        best = max(scores, key=scores.get)
        return best if scores[best] > 0 else 'neutral'

    # ── AI insight extraction ──────────────────────────────────────────

    def _extract_insights(self, text: str, language: str) -> Dict:
        """Try GPT extraction; fall back to regex-based heuristics."""
        client = _get_openai_client()
        if client and text and '[Audio could not be transcribed]' not in text:
            return self._gpt_extract(client, text, language)
        return self._heuristic_extract(text)

    def _gpt_extract(self, client, text: str, language: str) -> Dict:
        lang_label = 'Hindi/English (mixed)' if language == 'hi' else 'English'
        prompt = f"""You are an AI assistant helping Indian school teachers flag student concerns.

Teacher observation ({lang_label}):
"{text}"

Extract the following in JSON (respond ONLY with valid JSON, no extra text):
{{
  "student_behavior": "brief behavioral observation",
  "academic_concerns": "academic issues mentioned or empty string",
  "attendance_issues": "attendance problems mentioned or empty string",
  "social_concerns": "social/emotional concerns or empty string",
  "parent_involvement_needed": true,
  "urgency": "low|medium|high|critical",
  "suggested_action": "one concrete next step for the teacher",
  "language_of_concern": "english|hindi|mixed"
}}"""
        try:
            response = client.chat.completions.create(
                model='gpt-4o-mini',
                messages=[
                    {'role': 'system', 'content': 'Extract structured data from teacher observations. Always respond with valid JSON only.'},
                    {'role': 'user',   'content': prompt},
                ],
                temperature=0.2,
                max_tokens=400,
            )
            raw = response.choices[0].message.content.strip()
            # Strip markdown code fences if present
            raw = re.sub(r'^```(?:json)?\s*', '', raw)
            raw = re.sub(r'\s*```$', '', raw)
            return json.loads(raw)
        except Exception as exc:
            logger.warning(f"GPT insight extraction failed: {exc}. Using heuristic fallback.")
            return self._heuristic_extract(text)

    def _heuristic_extract(self, text: str) -> Dict:
        """Regex/keyword-based extraction without an LLM."""
        t = text.lower()

        attendance_issue = any(kw in t for kw in [
            'absent', 'missing', 'not coming', 'skip', 'gairhazir', 'nahi aata'
        ])
        academic_issue = any(kw in t for kw in [
            'marks', 'fail', 'score', 'test', 'exam', 'nahi samjha', 'kuch nahi aata'
        ])
        social_issue = any(kw in t for kw in [
            'alone', 'isolated', 'no friend', 'silent', 'akela', 'chup'
        ])
        parent_needed = any(kw in t for kw in [
            'parent', 'family', 'home', 'ghar', 'maa', 'papa', 'father', 'mother'
        ])

        urgency = self._detect_concern_level(t)
        if urgency == 'medium':
            urgency = 'medium'
        elif urgency not in ('high', 'critical'):
            urgency = 'low'

        return {
            'student_behavior':        text[:200] if text else '',
            'academic_concerns':       'Academic concerns noted.' if academic_issue else '',
            'attendance_issues':       'Attendance issues noted.' if attendance_issue else '',
            'social_concerns':         'Social/isolation concerns noted.' if social_issue else '',
            'parent_involvement_needed': parent_needed,
            'urgency':                 urgency,
            'suggested_action':        'Schedule one-on-one conversation with student.',
            'language_of_concern':     'mixed',
            'extraction_method':       'heuristic',
        }

    # ── Misc helpers ───────────────────────────────────────────────────

    def _extract_key_points(self, text: str) -> List[str]:
        """Split observation into up to 3 meaningful sentences."""
        sentences = [s.strip() for s in re.split(r'[.!?।]', text) if len(s.strip()) > 15]
        return sentences[:3]

    def _estimate_confidence(self, text: str, insights: Dict) -> float:
        """Estimate extraction confidence (0-1)."""
        confidence = 0.40
        if len(text) > 40:
            confidence += 0.20
        if len(text) > 100:
            confidence += 0.15
        if insights and not insights.get('extraction_error'):
            confidence += 0.20
        if insights.get('extraction_method') != 'heuristic':
            confidence += 0.05
        return round(min(1.0, confidence), 2)