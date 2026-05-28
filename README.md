<div align="center">

<img src="https://img.shields.io/badge/EduShield_AI-Full--Stack_Early_Dropout_Prevention-FF6B35?style=for-the-badge&logo=graduation-cap&logoColor=white" alt="EduShield AI Header"/>

# 🎓 EduShield AI
### *Silent Dropout Prevention System for Indian Schools*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-Ready-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

<br/>

> **EduShield AI** is a state-of-the-art, full-stack decision-support system designed to identify students who are silently disengaging or drifting toward dropping out — *before it becomes irreversible.* 

**🧠 Detect  →  🚦 Triage  →  🎙️ Observe  →  💡 Intervene  →  📊 Analyse**

</div>

---

## 📖 Table of Contents

- [✨ About EduShield AI](#-about-edushield-ai)
- [🌟 Key Core Capabilities](#-key-core-capabilities)
- [🏗️ System Architecture & Data Flow](#️-system-architecture--data-flow)
- [🗂️ Monorepo Folder Structure](#️-monorepo-folder-structure)
- [🧰 Tech Stack Overview](#-tech-stack-overview)
- [🚀 Quick Start (Local Setup)](#-quick-start-local-setup)
  - [1. Backend Setup (FastAPI)](#1-backend-setup-fastapi)
  - [2. Frontend Setup (Next.js)](#2-frontend-setup-nextjs)
- [🚦 Hospital-Style Triage System](#-hospital-style-triage-system)
- [🧠 Under the Hood: AI Engine](#-under-the-hood-ai-engine)
- [🔒 Privacy & Responsible AI Safeguards](#-privacy--responsible-ai-safeguards)
- [🤝 Contributors & Hackathon Team](#-contributors--hackathon-team)

---

## ✨ About EduShield AI

Every year, thousands of students in large school classrooms drift away silently, eventually dropping out due to academic struggle, attendance decline, or socio-emotional challenges. 

**EduShield AI** acts as a guardian layer for schools by processing multi-modal student signals:
* **Academic Signals:** Progression curves, failing trends, missed homework.
* **Engagement Signals:** Real-time attendance drops, classroom participation levels.
* **Direct Observations:** Qualitative Hindi/English voice notes recorded by teachers.
* **AI Explanations:** Real-time explainable AI metrics explaining exactly *why* a student is flagged, helping educators make informed, personalized interventions.

---

## 🌟 Key Core Capabilities

<table>
<tr>
<td width="50%">

### 🔮 AI-Powered Dropout Risk Detection
Leverages a multi-signal risk categorizer to flag students based on attendance decline, grade regression, behavioral indicators, and previous intervention histories.

</td>
<td width="50%">

### 🕵️ Hidden & Silent Student Detector
Identifies quiet, compliant, but highly disengaged students who are often overlooked in large classrooms because they do not display disruptive behaviors.

</td>
</tr>
<tr>
<td width="50%">

### 🎙️ Multilingual Voice Observations
Allows teachers to record observations naturally using voice notes (in mixed Hindi-English / Hinglish or clean English) which are parsed using AI to create structured observation data.

</td>
<td width="50%">

### 🔍 Explainable AI (XAI)
Ensures full transparency by providing clear, human-readable explanations (e.g., *“Attendance dropped 25% in 30 days”*) and suggesting practical, actionable interventions.

</td>
</tr>
<tr>
<td width="50%">

### 🧑‍🏫 Teacher Burnout Monitoring
Analyzes teacher workload metrics, intervention burdens, and high-risk classroom density to protect educators and balance support across staff.

</td>
<td width="50%">

### 📊 Comprehensive Insights & Metrics
Provides interactive dashboards presenting school health indices, risk distributions, grade-wise trends, and intervention efficacy charts.

</td>
</tr>
</table>

---

## 🏗️ System Architecture & Data Flow

EduShield AI combines a reactive, micro-animation-rich web dashboard with a fast, heavy-duty machine learning and NLP FastAPI backend:

```
                  ┌──────────────────────────────────────────────┐
                  │                 USER CLIENT                  │
                  │   Next.js 15 Web App (Tailwind CSS, Charts)  │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼ (REST / JSON / Multipart Audio)
                  ┌──────────────────────────────────────────────┐
                  │               FASTAPI BACKEND                │
                  │        REST API endpoints, JWT Auth          │
                  └──────┬──────────────────────┬─────────┬──────┘
                         │                      │         │
                         ▼                      ▼         ▼
                ┌────────────────┐     ┌───────────┐  ┌────────────────┐
                │   PostgreSQL   │     │Redis Cache│  │  Local Files   │
                │(SQLAlchemy DB) │     │ & Queues  │  │(Voice Uploads) │
                └────────┬───────┘     └─────┬─────┘  └───────┬────────┘
                         │                   │                │
                         └───────────┬───────┴────────────────┘
                                     ▼
                ┌──────────────────────────────────────────────┐
                │                  AI ENGINE                   │
                ├──────────────────────────────────────────────┤
                │ - Dropout risk classifier                    │
                │ - Hidden/Withdrawn student detector          │
                │ - Explainable AI (XAI) formatter             │
                │ - Speech-to-text observer (Whisper API)      │
                │ - Teacher Burnout and load balancer          │
                └──────────────────────────────────────────────┘
```

---

## 🗂️ Monorepo Folder Structure

```
edushield-ai-monorepo/
│
├── 📂 EduShield-AI-Frontend/    # Next.js 15 Web Client
│   ├── 📂 src/
│   │   ├── 📂 app/              # Dashboard, Students, Analytics, & Voice routes
│   │   ├── 📂 components/       # UI, Charts, and Explainable AI cards
│   │   └── 📂 lib/              # API clients and data stores
│   ├── 📋 package.json          # Frontend dependencies
│   └── ⚙️  next.config.ts        # Next.js configurations
│
├── 📂 Edushield-AI-Backend/     # FastAPI Python Server
│   ├── 📂 app/
│   │   ├── 📂 api/              # Route handlers (Auth, Students, Voice, Analytics)
│   │   ├── 📂 models/           # SQLAlchemy Database Models
│   │   ├── 📂 schemas/          # Pydantic Schemas
│   │   ├── 📂 ai_engine/        # Risk categorization, XAI, & Voice observation parsing
│   │   └── 📂 ml_models/        # Dropout risk predictors & trainers
│   ├── 📋 requirements.txt      # Python dependencies
│   └── ⚙️  alembic.ini           # Database migration settings
│
├── 🔒 .gitignore                # Global monorepo gitignore
└── 📖 README.md                 # Main root repository documentation (This File)
```

---

## 🧰 Tech Stack Overview

| Tier | Component | Technology Used |
|------|-----------|-----------------|
| **Frontend** | Framework | Next.js 15 (React 19) |
| | Styling | Tailwind CSS |
| | Visuals & Charts | Custom Responsive SVG Rings, Sparklines, & Lucide Icons |
| **Backend** | API Engine | FastAPI (Python 3.11+) |
| | Database | PostgreSQL (SQLAlchemy ORM + Alembic Migrations) |
| | Cache & Session | Redis |
| **AI/ML Engine** | Risk Predictor | Scikit-learn (RandomForest / GradientBoosting) |
| | Natural Language | OpenAI Whisper + Chat Completion APIs |
| | Custom Modules | Hidden Student Detector, Workload Burnout Analyzer |

---

## 🚀 Quick Start (Local Setup)

To run the entire system locally, follow these steps. You will need two separate terminal windows.

### 1. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd Edushield-AI-Backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows PowerShell
   python -m venv venv
   venv\Scripts\activate

   # Linux/macOS
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create your local environment file:
   ```bash
   cp .env.example .env
   ```
   *(Configure your `DATABASE_URL`, `REDIS_URL`, and optionally your `GEMINI_API_KEY` or `OPENAI_API_KEY` for voice processing).*
5. Initialize the database and run seed data:
   ```bash
   # Make sure local Postgres/SQLite is configured, then run:
   python seed_db.py
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   * The backend will start on **`http://localhost:8000`**
   * View the interactive API documentation at **`http://localhost:8000/docs`**

---

### 2. Frontend Setup (Next.js)

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd EduShield-AI-Frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The web dashboard will launch on **`http://localhost:3000`**

---

## 🚦 Hospital-Style Triage System

Students are automatically prioritized by urgency using a triage tier indicator:

| Level | Badge | Meaning | Immediate Intervention |
|-------|-------|---------|-------------------------|
| **Critical** | 🔴 | Severe risk of dropping out | Direct Counselor / Guardian escalation |
| **High** | 🟠 | High risk; clear academic & attendance decline | Targeted academic & personal check-in |
| **Medium** | 🟡 | Early warning signs detected | Class Teacher informal mentorship |
| **Low** | 🟢 | Stable academic & engagement parameters | Ongoing routine observation |

---

## 🧠 Under the Hood: AI Engine

EduShield AI doesn’t just output a number; it runs a modular pipeline to give teachers context:
1. **`dropout_detector.py`**: Computes weighted risk profiles utilizing a mixture of absolute attendance, grade velocity (direction of marks over time), and participation scores.
2. **`hidden_student_detector.py`**: Monitors standard deviations in classroom engagement. If a student's marks are stable but their social participation and verbal observation inputs drop below a threshold, they are flagged as "silently disengaged".
3. **`voice_processor.py`**: Leverages natural language models to extract student names, sentiment scores, and specific behavioral flags from voice inputs.

---

## 🔒 Privacy & Responsible AI Safeguards

> 🛡️ **EduShield AI is designed as a support system, not an arbiter.**
* **Human-in-the-Loop:** All AI evaluations and suggested interventions must be manually reviewed and approved by certified educators before action is taken.
* **Bias Protection:** Algorithms are strictly isolated from demographic parameters (gender, caste, religion, language background) to avoid compounding systemic educational biases.
* **Data Ethics:** Student phone numbers, parent records, and performance metrics should be stored with tight role-based access restrictions and full encryption in transit.

---

## 🤝 Contributors & Hackathon Team

Developed with ❤️ for the **Wadhwani AI Hackathon** by **Govind Jangid & Team**.

* **GitHub:** [@GovindJangid75](https://github.com/GovindJangid75)
* **Backend:** [Edushield-AI-Backend](https://github.com/GovindJangid75/Edushield-AI-Backend)
* **Frontend:** [EduShield-AI-Frontend](https://github.com/gouravnagori/EduShield-AI)
