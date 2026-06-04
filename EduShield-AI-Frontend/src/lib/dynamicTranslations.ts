import { Language } from './translations';

const dynamicTranslations: Record<string, string> = {
  // Risk Factor Names
  'Attendance Decline': 'उपस्थिति में गिरावट',
  'Academic Performance Drop': 'शैक्षणिक प्रदर्शन में गिरावट',
  'Low Classroom Participation': 'कक्षा में कम भागीदारी',
  'Homework Inconsistency': 'गृहकार्य में अनियमितता',
  'Emotional Disengagement': 'भावनात्मक अलगाव',
  'Social Disconnection': 'सामाजिक अलगाव',
  'Invisible Pattern': 'अदृश्य पैटर्न',
  'Social Disconnection / Invisible Pattern': 'सामाजिक अलगाव / अदृश्य पैटर्न',

  // Intervention Catalog Names
  'Parent Communication': 'अभिभावक संचार',
  'Mentor Support': 'मेंटॉर सहायता',
  'Peer Buddy Allocation': 'सहपाठी आवंटन (Peer Buddy)',
  'Bilingual Learning Material': 'द्विभाषी शिक्षण सामग्री',
  'Counseling Session': 'परामर्श सत्र (Counseling)',
  'Reduced Homework Load': 'गृहकार्य का बोझ कम करना',
  'Personalized Revision Plan': 'व्यक्तिगत पुनरीक्षण योजना',
  'Teacher Follow-up': 'शिक्षक अनुवर्ती कार्रवाई',
  'Extra Coaching': 'अतिरिक्त कोचिंग',
  'Emotional Support Group': 'भावनात्मक सहायता समूह',
  'Attendance Monitoring': 'उपस्थिति निगरानी',
  'Home Visit': 'गृह भ्रमण',

  // Intervention Catalog Descriptions
  'Schedule a parent-teacher meeting to discuss student progress and home environment factors.': 'छात्र की प्रगति और पारिवारिक वातावरण पर चर्चा करने के लिए अभिभावक-शिक्षक बैठक निर्धारित करें।',
  'Assign a senior student or teacher mentor for regular one-on-one guidance sessions.': 'नियमित रूप से व्यक्तिगत मार्गदर्शन सत्रों के लिए एक वरिष्ठ छात्र या शिक्षक मेंटॉर नियुक्त करें।',
  'Pair the student with a supportive classmate for academic and social support.': 'शैक्षणिक और सामाजिक सहायता के लिए छात्र को एक मददगार सहपाठी के साथ जोड़ें।',
  'Provide study materials in the student\'s mother tongue alongside the medium of instruction.': 'शिक्षण के माध्यम के साथ-साथ छात्र की मातृभाषा में अध्ययन सामग्री प्रदान करें।',
  'Arrange professional counseling to address emotional or psychological concerns.': 'भावनात्मक या मनोवैज्ञानिक चिंताओं को दूर करने के लिए पेशेवर परामर्श की व्यवस्था करें।',
  'Temporarily reduce homework assignments to prevent overwhelm and rebuild confidence.': 'तनाव को रोकने और आत्मविश्वास के पुनर्निर्माण के लिए अस्थायी रूप से गृहकार्य असाइनमेंट कम करें।',
  'Create a customized revision schedule focusing on weak areas with gradual difficulty increase.': 'कठिनाई के क्रमिक स्तरों के साथ कमजोर क्षेत्रों पर ध्यान केंद्रित करते हुए एक अनुकूलित पुनरीक्षण कार्यक्रम बनाएं।',
  'Schedule regular check-ins (daily/weekly) to monitor progress and provide encouragement.': 'प्रगति की निगरानी करने और प्रोत्साहन प्रदान करने के लिए नियमित चेक-इन (दैनिक/साप्ताहिक) निर्धारित करें।',
  'Arrange additional tutoring sessions after school hours for academic support.': 'शैक्षणिक सहायता के लिए स्कूल के घंटों के बाद अतिरिक्त शिक्षण सत्र आयोजित करें।',
  'Include the student in a peer support group for social-emotional learning.': 'सामाजिक-भावनात्मक सीखने के लिए छात्र को एक सहकर्मी सहायता समूह में शामिल करें।',
  'Implement daily attendance tracking with immediate parent notification for absences.': 'अनुपस्थिति के लिए तत्काल अभिभावक अधिसूचना के साथ दैनिक उपस्थिति ट्रैकिंग लागू करें।',
  'Conduct a home visit to understand the student\'s home environment and family situation.': 'छात्र के पारिवारिक वातावरण और स्थिति को समझने के लिए गृह भ्रमण करें।',

  // Intervention Roles
  'Class Teacher': 'कक्षा शिक्षक',
  'School Counselor': 'स्कूल काउंसलर',
  'Subject Teacher': 'विषय शिक्षक',
  'Class Teacher / Admin': 'कक्षा शिक्षक / व्यवस्थापक',
  'Admin User (You)': 'प्रशासक उपयोगकर्ता (आप)',

  // Priorities
  'urgent': 'तत्काल',
  'high': 'उच्च',
  'medium': 'मध्यम',
  'low': 'कम',

  // Durations
  '1-2 days': '1-2 दिन',
  'Ongoing (4-8 weeks)': 'सतत (4-8 सप्ताह)',
  '2-4 weeks': '2-4 सप्ताह',
  '1 week to prepare': 'तैयारी के लिए 1 सप्ताह',
  '1-3 sessions': '1-3 सत्र',
  '2-3 weeks': '2-3 सप्ताह',
  '4-6 weeks': '4-6 सप्ताह',
  'Ongoing': 'सतत',
  '4-8 weeks': '4-8 सप्ताह',
  'Ongoing (term-long)': 'सतत (सत्र भर)',

  // Intervention Status
  'assigned': 'असाइन किया गया',
  'in-progress': 'प्रगति पर',
  'follow-up': 'अनुवर्ती कार्रवाई',
  'resolved': 'सुलझाया गया',
  'completed': 'पूर्ण',
  'attendance': 'उपस्थिति',
  'assessments': 'मूल्यांकन',
  'students': 'छात्र',

  // Observation Types
  'academic': 'शैक्षणिक',
  'emotional': 'भावनात्मक',
  'behavioral': 'व्यवहार संबंधी',
  'positive': 'सकारात्मक',

  // Observation Templates
  'Has been struggling with mathematics concepts lately.': 'हाल ही में गणित की अवधारणाओं से जूझ रहा है।',
  'Submitted incomplete assignments for the third consecutive week.': 'लगातार तीसरे सप्ताह अधूरे असाइनमेंट जमा किए।',
  'Shows improved understanding in science after extra coaching.': 'अतिरिक्त कोचिंग के बाद विज्ञान में बेहतर समझ दिखाता है।',
  'Unable to follow classroom instructions in English medium.': 'अंग्रेजी माध्यम में कक्षा के निर्देशों का पालन करने में असमर्थ।',
  'Needs additional support in reading comprehension.': 'पठन समझ में अतिरिक्त सहायता की आवश्यकता है।',
  'Performance dropped significantly in recent unit test.': 'हाल ही के यूनिट टेस्ट में प्रदर्शन में भारी गिरावट आई है।',
  'Appeared withdrawn and avoided eye contact during class.': 'कक्षा के दौरान अलग-थलग दिखाई दिया और आँखें मिलाने से बचा।',
  'Was seen sitting alone during lunch break consistently.': 'लगातार लंच ब्रेक के दौरान अकेले बैठा देखा गया।',
  'Seemed anxious before the examination, hands trembling.': 'परीक्षा से पहले चिंतित लग रहा था, हाथ कांप रहे थे।',
  'Cried during class when asked about homework.': 'गृहकार्य के बारे में पूछने पर कक्षा में रोने लगा।',
  'Appears more cheerful after counseling sessions began.': 'परामर्श सत्र शुरू होने के बाद अधिक खुश दिखाई देता है।',
  'Shows signs of low self-confidence when called upon.': 'बुलाए जाने पर कम आत्मविश्वास के संकेत दिखाता है।',
  'Has been frequently absent on Mondays and Fridays.': 'सोमवार और शुक्रवार को अक्सर अनुपस्थित रहता है।',
  'Gets into arguments with classmates during group activities.': 'समूह गतिविधियों के दौरान सहपाठियों के साथ बहस करता है।',
  'Refuses to participate in any extracurricular activities.': 'किसी भी पाठ्येतर गतिविधियों में भाग लेने से इंकार करता है।',
  'Often comes to school without proper uniform or supplies.': 'अक्सर बिना उचित वर्दी या स्कूल की सामग्री के स्कूल आता है।',
  'Falls asleep during afternoon classes regularly.': 'नियमित रूप से दोपहर की कक्षाओं के दौरान सो जाता है।',
  'Shows restless behavior and difficulty concentrating.': 'अशांत व्यवहार और ध्यान केंद्रित करने में कठिनाई दिखाता है।',
  'Helped a younger student with their homework voluntarily.': 'स्वेच्छा से एक छोटे छात्र की उसके गृहकार्य में मदद की।',
  'Showed remarkable improvement in class participation this week.': 'इस सप्ताह कक्षा में भागीदारी में उल्लेखनीय सुधार दिखाया।',
  'Volunteered to lead the group project presentation.': 'समूह परियोजना प्रस्तुति का नेतृत्व करने के लिए स्वेच्छा से आगे आया।',
  'Attendance has been consistent for the past month.': 'पिछले महीने से उपस्थिति सुसंगत रही है।',
  'Scored highest in the surprise quiz - great improvement!': 'सरप्राइज क्विज में सबसे ज्यादा स्कोर किया - बड़ा सुधार!',
  'Has been actively asking questions in class.': 'कक्षा में सक्रिय रूप से प्रश्न पूछ रहा है।',
  'Positive improvement observed': 'सकारात्मक सुधार देखा गया',
  'Offline Profile: High local stability and active attendance tracks.': 'ऑफ़लाइन प्रोफ़ाइल: उच्च स्थानीय स्थिरता और सक्रिय उपस्थिति ट्रैक।',

  // Voice NLP Simulation
  'Academic decline': 'शैक्षणिक गिरावट',
  'Social disengagement / withdrawal': 'सामाजिक अलगाव / वापसी',
  'Teacher direct follow-up': 'शिक्षक द्वारा प्रत्यक्ष अनुवर्ती कार्रवाई',
  'Peer buddy allocation': 'सहपाठी आवंटन (Peer Buddy)',
  'Emotional fatigue / Anxiety': 'भावनात्मक थकान / चिंता',
  'Academic performance pressure': 'शैक्षणिक प्रदर्शन का दबाव',
  'Counseling session': 'परामर्श सत्र (Counseling)',
  'Reduce homework load temporarily': 'गृहकार्य का बोझ अस्थायी रूप से कम करना',
  'Attendance drop (Critical)': 'उपस्थिति में गिरावट (गंभीर)',
  'Lack of guardian communication': 'अभिभावक संपर्क का अभाव',
  'Home Visit planning': 'गृह भ्रमण की योजना',
  'General disengagement alert': 'सामान्य अलगाव की चेतावनी',
  'Class teacher standard check-in': 'कक्षा शिक्षक की सामान्य जांच',

  // Teacher Subjects
  'Mathematics': 'गणित',
  'Science': 'विज्ञान',
  'Social Science': 'सामाजिक विज्ञान',
  'English': 'अंग्रेजी',
  'Hindi': 'हिंदी',
  'Physical Education': 'शारीरिक शिक्षा',
  'Urdu': 'उर्दू',
  'Computer Science': 'कंप्यूटर विज्ञान',
  'Telugu': 'तेलुगु',
  'Music': 'संगीत',
  'Art & Craft': 'कला और शिल्प',
  'Sanskrit': 'संस्कृत',

  // Teacher Wellness Alerts
  'Workload exceeds recommended limit by 30%': 'कार्यभार अनुशंसित सीमा से 30% अधिक है',
  'Burnout score trending upward for 6 consecutive weeks': 'बर्नआउट स्कोर लगातार 6 सप्ताह से बढ़ रहा है',
  'CRITICAL: Burnout score at 89% — immediate workload reduction needed': 'गंभीर: बर्नआउट स्कोर 89% पर — तत्काल कार्यभार कम करने की आवश्यकता है',
  'Teaching 5 classes exceeds recommended maximum of 4': '5 कक्षाओं को पढ़ाना 4 की अनुशंसित अधिकतम सीमा से अधिक है',
  'Emotional fatigue critically high — counseling recommended': 'भावनात्मक थकान गंभीर रूप से उच्च — परामर्श की सिफारिश की जाती है',
  'Moderate workload — monitor intervention case count': 'मध्यम कार्यभार — हस्तक्षेप के मामलों की संख्या की निगरानी करें',
  'Teaching 6 classes — exceeds maximum': '6 कक्षाओं को पढ़ाना — अधिकतम सीमा से अधिक है',
  'Burnout trending upward consistently': 'बर्नआउट लगातार ऊपर की ओर बढ़ रहा है',
  'Burnout approaching high threshold': 'बर्नआउट उच्च सीमा के करीब पहुंच रहा है',
  'High intervention caseload — 8 active cases': 'उच्च हस्तक्षेप कार्यभार — 8 सक्रिय मामले',
  'Emotional fatigue elevated': 'भावनात्मक थकान बढ़ी हुई है',
  'Board exam preparation pressure — stress elevated': 'बोर्ड परीक्षा की तैयारी का दबाव — तनाव बढ़ा हुआ है',
  'Newer teacher with high-stakes classes': 'उच्च जिम्मेदारी वाली कक्षाओं के साथ नए शिक्षक',
  'Managing classes across 3 different grade levels': '3 अलग-अलग ग्रेड स्तरों में कक्षाओं का प्रबंधन',
};

// Regex replacements for dynamic strings containing numbers/names
const regexRules: Array<{ pattern: RegExp; hi: string }> = [
  {
    // Attendance dropped to 52% from 85% over 3 months
    pattern: /Attendance dropped to (\d+)% from 85% over 3 months/i,
    hi: '3 महीनों में उपस्थिति 85% से घटकर $1% हो गई',
  },
  {
    // Average score declined by 20 points in recent assessments
    pattern: /Average score declined by (\d+) points in recent assessments/i,
    hi: 'हाल के मूल्यांकनों में औसत स्कोर में $1 अंकों की गिरावट आई है',
  },
  {
    // Only 45% homework completion rate in last month
    pattern: /Only (\d+)% homework completion rate in last month/i,
    hi: 'पिछले महीने में केवल $1% गृहकार्य पूरा करने की दर',
  },
  {
    // Teacher [Name]
    pattern: /Teacher (\d+)/i,
    hi: 'शिक्षक $1',
  },
  {
    // [Intervention Type] recommended based on [Risk Factor]
    pattern: /(.*) recommended based on (.*)/i,
    hi: 'समग्र जोखिम विश्लेषण के आधार पर $1 की सिफारिश की गई',
  },
  {
    // Explainable AI predictions
    // [Name] shows a convergence of declining attendance ([X]%), dropping academic performance, and reduced classroom participation...
    pattern: /(.*) shows a convergence of declining attendance \((\d+)%\), dropping academic performance, and reduced classroom participation\. The AI model detected a pattern consistent with pre-dropout behavior observed in similar profiles\. Immediate intervention is strongly recommended\./i,
    hi: '$1 उपस्थिति में गिरावट ($2%), गिरते शैक्षणिक प्रदर्शन और कक्षा में कम भागीदारी का संयोजन दिखाता है। एआई मॉडल ने समान प्रोफाइल में देखे गए ड्रॉपआउट-पूर्व व्यवहार के अनुरूप पैटर्न का पता लगाया। तत्काल हस्तक्षेप की दृढ़ता से सिफारिश की जाती है।',
  },
  {
    pattern: /Multiple risk indicators are simultaneously active: attendance has fallen below 60%, homework submissions are irregular, and teacher observations report emotional withdrawal\. The confidence score reflects strong signal alignment across 4 independent data streams\./i,
    hi: 'एक साथ कई जोखिम संकेतक सक्रिय हैं: उपस्थिति 60% से कम हो गई है, गृहकार्य जमा करना अनियमित है, और शिक्षक अवलोकन भावनात्मक अलगाव की रिपोर्ट करते हैं। आत्मविश्वास स्कोर 4 स्वतंत्र डेटा धाराओं में मजबूत संकेत संरेखण को दर्शाता है।',
  },
  {
    pattern: /(.*)'s engagement pattern matches the "silent disengagement" profile — gradual withdrawal across all measurable dimensions over the past 8 weeks\. Without intervention, the model predicts complete disengagement within (\d+) days\./i,
    hi: '$1 का सहभागिता पैटर्न "मौन अलगाव" प्रोफ़ाइल से मेल खाता है — पिछले 8 सप्ताह में सभी मापने योग्य आयामों में क्रमिक वापसी। हस्तक्षेप के बिना, मॉडल $2 दिनों के भीतर पूर्ण विघटन की भविष्यवाणी करता है।',
  },
  {
    pattern: /(.*) shows early warning signs across attendance and participation metrics\. While academic scores remain borderline, the declining trend is consistent with students who later disengage\. Proactive monitoring and teacher check-ins are recommended\./i,
    hi: '$1 उपस्थिति और भागीदारी मेट्रिक्स में शुरुआती चेतावनी के संकेत दिखाता है। जबकि शैक्षणिक स्कोर सीमा पर बने हुए हैं, गिरावट की प्रवृत्ति उन छात्रों के अनुरूप है जो बाद में अलग हो जाते हैं। सक्रिय निगरानी और शिक्षक चेक-इन की सिफारिश की जाती है।',
  },
  {
    pattern: /The AI detected a behavioral change pattern: reduced interaction frequency combined with homework inconsistency\. These early indicators, while individually minor, combine to create a meaningful risk signal\./i,
    hi: 'एआई ने एक व्यवहार परिवर्तन पैटर्न का पता लगाया: कम बातचीत की आवृत्ति के साथ गृहकार्य में अनियमितता। ये शुरुआती संकेतक, व्यक्तिगत रूप से मामूली होने पर भी, एक महत्वपूर्ण जोखिम संकेत बनाने के लिए संयोजित होते हैं।',
  },
  {
    pattern: /(.*) shows mixed signals — some metrics are stable while others show minor decline\. The moderate risk classification reflects uncertainty; continued monitoring will improve prediction accuracy\./i,
    hi: '$1 मिश्रित संकेत दिखाता है — कुछ मेट्रिक्स स्थिर हैं जबकि अन्य मामूली गिरावट दिखाते हैं। मध्यम जोखिम वर्गीकरण अनिश्चितता को दर्शाता है; निरंतर निगरानी से भविष्यवाणी की सटीकता में सुधार होगा।',
  },
  {
    pattern: /Participation levels have decreased slightly, but attendance and academic performance remain acceptable\. This student may benefit from preventive engagement strategies\./i,
    hi: 'भागीदारी के स्तर में थोड़ी कमी आई है, लेकिन उपस्थिति और शैक्षणिक प्रदर्शन स्वीकार्य बने हुए हैं। इस छात्र को निवारक सहभागिता रणनीतियों से लाभ हो सकता है।',
  },
  {
    pattern: /(.*) shows healthy engagement across all tracked dimensions\. No significant risk factors detected\. Continue standard monitoring\./i,
    hi: '$1 सभी ट्रैक किए गए आयामों में स्वस्थ भागीदारी दिखाता है। कोई महत्वपूर्ण जोखिम कारक नहीं पाया गया। सामान्य निगरानी जारी रखें।',
  },
  {
    pattern: /All indicators are within normal ranges\. (.*) demonstrates consistent attendance, active participation, and stable academic performance\./i,
    hi: 'सभी संकेतक सामान्य सीमा के भीतर हैं। $1 निरंतर उपस्थिति, सक्रिय भागीदारी और स्थिर शैक्षणिक प्रदर्शन प्रदर्शित करता है।',
  },
  {
    // User added profiles AI rationale
    pattern: /(.*) shows a critical dropout threat pattern driven by high absence rates \((\d+)%\) and low classroom academic scores \((\d+)%\)\. Immediate counselor meeting is flagged\./i,
    hi: '$1 उच्च अनुपस्थिति दर ($2%) और कम कक्षा शैक्षणिक स्कोर ($3%) द्वारा संचालित एक गंभीर ड्रॉपआउट खतरे का पैटर्न दिखाता है। तत्काल परामर्शदाता बैठक को चिह्नित किया गया है।',
  },
  {
    pattern: /Multiple warning indicators flagged for (.*)\. High disengagement probability detected from declining attendance trends and incomplete assignments\. Proactive review advised\./i,
    hi: '$1 के लिए कई चेतावनी संकेतक चिह्नित किए गए हैं। गिरती उपस्थिति के रुझान और अधूरे असाइनमेंट से उच्च विघटन की संभावना का पता चला है। सक्रिय समीक्षा की सलाह दी जाती है।',
  },
  {
    pattern: /(.*) is currently flagged with moderate risk signals\. Mild disengagement observed in homework submissions\. Monitor and assign revision support\./i,
    hi: '$1 वर्तमान में मध्यम जोखिम संकेतों के साथ चिह्नित है। गृहकार्य जमा करने में हल्का अलगाव देखा गया। निगरानी करें और पुनरीक्षण सहायता सौंपें।',
  },
  {
    pattern: /Student (.*) is performing strongly across all indicators\. Highly consistent attendance \((\d+)%\) and stable academic performance\. Standard observation active\./i,
    hi: 'छात्र $1 सभी संकेतकों में शानदार प्रदर्शन कर रहा है। अत्यधिक सुसंगत उपस्थिति ($2%) और स्थिर शैक्षणिक प्रदर्शन। मानक अवलोकन सक्रिय है।',
  }
];

export function tDynamic(text: string | undefined | null, language: Language): string {
  if (!text) return '';
  if (language !== 'hi') return text;

  // Exact Match Check
  const trimmed = text.trim();
  if (dynamicTranslations[trimmed]) {
    return dynamicTranslations[trimmed];
  }

  // Regex Match Check
  for (const rule of regexRules) {
    if (rule.pattern.test(trimmed)) {
      return trimmed.replace(rule.pattern, rule.hi);
    }
  }

  return text;
}
