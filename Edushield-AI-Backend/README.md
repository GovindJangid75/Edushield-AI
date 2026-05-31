<div align="center">

<img src="https://img.shields.io/badge/EduShield_AI-Silent_Dropout_Prevention-FF6B35?style=for-the-badge&logo=graduation-cap&logoColor=white" alt="EduShield AI"/>

# 🎓 EduShield AI
### *Silent Dropout Prevention System for Indian Schools*

<br/>

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7+-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)

[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)

<br/>

> **EduShield AI** is an AI-powered backend platform that helps schools identify students silently disengaging or drifting toward dropout — *before it becomes irreversible.*

<br/>

```
🧠 Detect  →  🚦 Triage  →  🎙️ Observe  →  💡 Intervene  →  📊 Analyse
```

</div>

---

## 📖 Table of Contents

- [✨ About](#-about)
- [🌟 Key Features](#-key-features)
- [🏗️ Architecture](#️-architecture)
- [🧰 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)

- [🔐 Authentication](#-authentication)
- [📌 API Endpoints](#-api-endpoints)
- [🧪 Example Usage](#-example-usage)
- [🧠 AI Engine](#-ai-engine)
- [📊 Risk Scoring](#-risk-scoring)
- [💡 Intervention Lifecycle](#-intervention-lifecycle)
- [🧹 Code Quality](#-code-quality)
- [🔒 Privacy & Responsible AI](#-privacy--responsible-ai)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)
- [❤️ Mission](#️-mission)

---

## ✨ About

**EduShield AI** combines attendance trends, academic performance, teacher observations, behavioural signals, intervention history, and explainable AI to support early action by teachers, school leaders, and counsellors.

> 🛡️ **EduShield AI is a decision-support system.** It does not replace teachers, counsellors, or school administrators — it helps them *prioritise attention* and *take timely action.*

---

## 🌟 Key Features

<table>
<tr>
<td width="50%">

### 🧠 AI Dropout Risk Detection
Predicts students at risk using multiple signals:
- 📉 Attendance decline
- 📚 Academic performance drop
- 🤐 Reduced classroom participation
- 😶 Behavioural changes
- ❌ Missed assessments
- 👁️ Teacher observations
- 🔁 Previous intervention history

</td>
<td width="50%">

### 🕵️ Hidden Student Detection
Identifies students who may **not** be visibly disruptive but show signs of:
- Withdrawal and silence
- Low participation
- Emotional disengagement

> Helps schools support students often overlooked because they're quiet, compliant, or invisible in large classrooms.

</td>
</tr>
<tr>
<td width="50%">

### 🎙️ Multilingual Voice Observations
Teachers can record observations in **Hindi or English:**

```
"Ravi pichhle do hafton se class mein
 bilkul participate nahi kar raha hai."
```

Voice notes are automatically converted into structured AI-ready observations.

</td>
<td width="50%">

### 🔍 Explainable AI (XAI)
Every prediction includes human-readable reasoning:

```json
{
  "risk_level": "High",
  "risk_score": 82,
  "top_reasons": [
    "Attendance dropped 28% in 30 days",
    "Maths score declined 3 tests in a row",
    "Teacher reported social withdrawal"
  ]
}
```

</td>
</tr>
<tr>
<td width="50%">

### 🧑‍🏫 Teacher Burnout Monitoring
Supports teachers by analysing:
- Number of at-risk students handled
- Intervention workload
- Observation frequency
- High-risk classroom concentration
- Response pressure

</td>
<td width="50%">

### 📊 Analytics Dashboard API
Backend APIs for school dashboards:
- 🏫 Overall school health score
- 📊 Risk distribution charts
- 📅 Attendance trend analysis
- 🎯 Intervention effectiveness
- 📋 Grade & class-wise risk patterns

</td>
</tr>
</table>

---

## 🚦 Hospital-Style Triage System

Students are prioritised based on urgency — just like a hospital emergency room:

| Level | Badge | Meaning | Suggested Action |
|-------|-------|---------|-----------------|
| Low | 🟢 | Stable student | Continue monitoring |
| Medium | 🟡 | Early warning signs | Teacher check-in |
| High | 🟠 | Serious disengagement | Counsellor / parent involvement |
| Critical | 🔴 | Immediate dropout risk | Urgent intervention plan |

---

## 🏗️ Architecture

```
                    ┌─────────────────────┐
                    │   Teacher/Admin UI   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     FastAPI API      │
                    └──────────┬──────────┘
                               │
       ┌───────────────────────┼───────────────────────┐
       ▼                       ▼                       ▼
┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ PostgreSQL   │     │  Redis Cache    │     │  File Uploads   │
│ Student Data │     │  Queues/Sess.   │     │  Voice Notes    │
└──────────────┘     └─────────────────┘     └─────────────────┘
       │                       │                       │
       └───────────────────────┼───────────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │      AI Engine      │
                    ├─────────────────────┤
                    │  Dropout Detector   │
                    │  Hidden Student AI  │
                    │  Risk Categorizer   │
                    │  XAI Explanations   │
                    │  Intervention AI    │
                    │  Voice Processor    │
                    └─────────────────────┘
```

---

## 🧰 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| 🌐 Backend Framework | ![FastAPI](https://img.shields.io/badge/-FastAPI-009688?logo=fastapi&logoColor=white) | High-performance REST API |
| 🐍 Language | ![Python](https://img.shields.io/badge/-Python_3.11+-3776AB?logo=python&logoColor=white) | Core language |
| 🗄️ Database | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL_15+-336791?logo=postgresql&logoColor=white) | Primary data store |
| 🔗 ORM | SQLAlchemy | Database abstraction |
| 🔄 Migrations | Alembic | Schema version control |
| ⚡ Cache / Queue | ![Redis](https://img.shields.io/badge/-Redis_7+-DC382D?logo=redis&logoColor=white) | Caching & task queues |
| 🔑 Auth | JWT | Token-based authentication |
| ✅ Validation | Pydantic | Schema validation |
| 🤖 AI / ML | Scikit-learn + OpenAI APIs | Risk prediction & LLM |
| 🎙️ Voice | OpenAI Whisper | Speech-to-text |

| 🧪 Testing | Pytest | Automated testing |

---

## 📁 Project Structure

```
edushield-ai/
│
├── 📂 app/
│   ├── 🐍 main.py
│   ├── ⚙️  config.py
│   ├── 🗄️  database.py
│   │
│   ├── 📂 models/           # Database models
│   │   ├── user.py
│   │   ├── student.py
│   │   ├── attendance.py
│   │   ├── performance.py
│   │   ├── intervention.py
│   │   └── observation.py
│   │
│   ├── 📂 schemas/          # Pydantic schemas
│   │   ├── auth.py
│   │   ├── student.py
│   │   ├── teacher.py
│   │   ├── intervention.py
│   │   └── analytics.py
│   │
│   ├── 📂 api/              # Route handlers
│   │   ├── auth.py
│   │   ├── students.py
│   │   ├── teachers.py
│   │   ├── interventions.py
│   │   ├── analytics.py
│   │   └── voice.py
│   │
│   ├── 🧠 ai_engine/        # Core AI modules
│   │   ├── dropout_detector.py
│   │   ├── hidden_student_detector.py
│   │   ├── risk_categorizer.py
│   │   ├── intervention_recommender.py
│   │   ├── explainable_ai.py
│   │   ├── teacher_burnout_analyzer.py
│   │   └── voice_processor.py
│   │
│   ├── 📂 ml_models/        # ML pipeline
│   │   ├── feature_engineering.py
│   │   ├── model_trainer.py
│   │   └── risk_predictor.py
│   │
│   ├── 📂 services/         # Business services
│   │   ├── alert_service.py
│   │   ├── analytics_service.py
│   │   └── realtime_monitor.py
│   │
│   └── 📂 utils/
│       ├── logger.py
│       └── validators.py
│
├── 📂 migrations/
├── 🧪 tests/
│   ├── test_api.py
│   └── test_ai_engine.py
│
├── 📂 uploads/voice_observations/
├── 📂 logs/
├── 📂 models/

├── 📋 requirements.txt
├── ⚙️  alembic.ini
├── 🔒 .env.example
└── 📖 README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed before you begin:

| Tool | Version | Required |
|------|---------|----------|
| 🐍 Python | 3.11+ | ✅ Yes |
| 🗄️ PostgreSQL | 15+ | ✅ Yes |
| ⚡ Redis | 7+ | ✅ Yes |
| 🔧 Git | Any | ✅ Yes |

| 🤖 OpenAI API Key | — | ⚪ Optional (voice/LLM features) |

---

### ⚙️ Local Development Setup

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/edushield-ai.git
cd edushield-ai
```

#### 2️⃣ Create Virtual Environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux / macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4️⃣ Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

```env
APP_NAME=EduShield AI
ENVIRONMENT=development
DEBUG=True

DATABASE_URL=postgresql://postgres:password@localhost:5432/edushield_db
REDIS_URL=redis://localhost:6379/0

SECRET_KEY=replace-this-with-a-secure-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

OPENAI_API_KEY=your-openai-api-key

UPLOAD_DIR=uploads/voice_observations
MODEL_DIR=models
LOG_LEVEL=INFO

CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### 5️⃣ Create Required Directories

```bash
# Linux / macOS
mkdir -p uploads/voice_observations logs models

# Windows PowerShell
mkdir uploads\voice_observations; mkdir logs; mkdir models
```

#### 6️⃣ Create PostgreSQL Database

```bash
createdb edushield_db
# OR via psql:
# CREATE DATABASE edushield_db;
```

#### 7️⃣ Run Database Migrations

```bash
alembic upgrade head
```

#### 8️⃣ Start Redis

```bash
# Local install
redis-server

```

#### 9️⃣ Start the Server

```bash
uvicorn app.main:app --reload
```

| URL | Description |
|-----|-------------|
| `http://localhost:8000` | 🌐 API base URL |
| `http://localhost:8000/docs` | 📘 Swagger UI |
| `http://localhost:8000/redoc` | 📗 ReDoc |

---


## 🔐 Authentication

EduShield AI uses **JWT-based authentication.**

```
1. Register teacher/admin
2. Login with credentials
3. Receive access token
4. Send token in Authorization header
```

```http
Authorization: Bearer your_jwt_token
```

---

## 📌 API Endpoints

<details>
<summary><b>🔑 Authentication</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a teacher or admin |
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET`  | `/api/auth/me` | Get current authenticated user |

</details>

<details>
<summary><b>👨‍🎓 Students</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/students/` | Create a new student |
| `GET` | `/api/students/` | List all students |
| `GET` | `/api/students/{id}` | Get student profile |
| `PATCH` | `/api/students/{id}` | Update student details |
| `DELETE` | `/api/students/{id}` | Delete or archive student |

</details>

<details>
<summary><b>📅 Attendance</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/students/{id}/attendance` | Add attendance record |
| `GET` | `/api/students/{id}/attendance` | Get attendance history |
| `GET` | `/api/students/{id}/attendance/summary` | Get attendance summary |

</details>

<details>
<summary><b>📚 Academic Performance</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/students/{id}/performance` | Add performance record |
| `GET` | `/api/students/{id}/performance` | Get performance history |
| `GET` | `/api/students/{id}/performance/trends` | Get academic trend analysis |

</details>

<details>
<summary><b>🤖 Risk Assessment</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/students/{id}/assess-risk` | Run AI dropout risk assessment |
| `GET` | `/api/students/{id}/risk-history` | Get previous risk assessments |
| `GET` | `/api/students/at-risk/list` | List at-risk students |
| `GET` | `/api/students/hidden/list` | List hidden or withdrawn students |

</details>

<details>
<summary><b>🧑‍🏫 Teachers</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/teachers/{id}/dashboard` | Teacher dashboard |
| `GET` | `/api/teachers/{id}/students` | Students assigned to teacher |
| `GET` | `/api/teachers/{id}/burnout-analysis` | Teacher burnout analysis |

</details>

<details>
<summary><b>💡 Interventions</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/interventions/` | Create intervention |
| `GET` | `/api/interventions/` | List interventions |
| `GET` | `/api/interventions/{id}` | Get intervention details |
| `PATCH` | `/api/interventions/{id}` | Update intervention |
| `DELETE` | `/api/interventions/{id}` | Delete intervention |
| `GET` | `/api/students/{id}/interventions` | Student's interventions |

</details>

<details>
<summary><b>🎙️ Voice Observations</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/voice/observe` | Upload teacher voice observation |
| `GET` | `/api/voice/observations` | List voice observations |
| `GET` | `/api/voice/observations/{id}` | Get processed observation |

</details>

<details>
<summary><b>📊 Analytics</b></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/dashboard/overview` | School overview |
| `GET` | `/api/analytics/risk-distribution` | Risk distribution by class/grade |
| `GET` | `/api/analytics/attendance-trends` | Attendance trends |
| `GET` | `/api/analytics/intervention-effectiveness` | Intervention effectiveness |
| `GET` | `/api/analytics/school-health-score` | Overall school health score |

</details>

---

## 🧪 Example Usage

### Register a Teacher

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anita Sharma",
    "email": "anita@example.com",
    "password": "securepassword",
    "role": "teacher"
  }'
```

### Create a Student

```bash
curl -X POST http://localhost:8000/api/students/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ravi Kumar",
    "grade": "8",
    "section": "B",
    "roll_number": "23",
    "guardian_name": "Suresh Kumar",
    "guardian_phone": "9876543210"
  }'
```

### Run AI Risk Assessment

```bash
curl -X POST http://localhost:8000/api/students/1/assess-risk \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Example Response:**

```json
{
  "student_id": 1,
  "risk_score": 82,
  "risk_level": "High",
  "triage_priority": "Urgent",
  "is_hidden_student": true,
  "explanation": {
    "top_factors": [
      "Attendance dropped significantly in the last month",
      "Recent test scores show continuous decline",
      "Teacher observation indicates social withdrawal"
    ],
    "protective_factors": [
      "Student has previously responded well to mentoring"
    ]
  },
  "recommended_interventions": [
    {
      "type": "teacher_check_in",
      "priority": "high",
      "description": "Schedule a private 10-minute conversation with the student."
    },
    {
      "type": "guardian_contact",
      "priority": "high",
      "description": "Contact guardian to understand home-related challenges."
    }
  ]
}
```

---

## 🧠 AI Engine

| Module | Description |
|--------|-------------|
| `dropout_detector.py` | Detects dropout risk using academic, attendance, behavioural, and historical signals |
| `hidden_student_detector.py` | Identifies disengaged students who aren't visibly disruptive |
| `risk_categorizer.py` | Maps numerical scores to triage categories (low / medium / high / critical) |
| `intervention_recommender.py` | Suggests practical interventions based on student profile and risk reasons |
| `explainable_ai.py` | Generates human-readable explanations for every AI flag |
| `teacher_burnout_analyzer.py` | Analyses teacher workload, intervention burden, and high-risk concentration |
| `voice_processor.py` | Processes multilingual voice notes into structured observations |

---

## 📊 Risk Scoring

EduShield AI uses a configurable, multi-signal scoring system:

| Signal | Example Weight |
|--------|---------------|
| 📅 Attendance decline | 30% |
| 📉 Academic decline | 25% |
| 👁️ Teacher observations | 20% |
| 😶 Behavioural withdrawal | 15% |
| 🔁 Intervention history | 10% |

**Output:**
```json
{
  "risk_score": 76,
  "risk_level": "High",
  "confidence": 0.87
}
```

> ⚠️ The scoring logic should be reviewed and calibrated using local school context before production deployment.

---

## 💡 Intervention Lifecycle

```
🚩 Student Flagged
        ↓
🤖 Risk Assessment Generated
        ↓
👩‍🏫 Teacher Reviews Explanation
        ↓
💡 Intervention Recommended
        ↓
✅ Teacher/Admin Creates Intervention
        ↓
📈 Progress Updated
        ↓
🔄 Follow-up Assessment
        ↓
🎯 Marked Successful  OR  ⬆️ Escalated
```

---

## 🧪 Running Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage report
pytest tests/ --cov=app --cov-report=term-missing

# Run a specific test file
pytest tests/test_api.py -v
```

---

## 🧹 Code Quality

```bash
# Format code
black app tests
isort app tests

# Lint
flake8 app tests

# Type checking (optional)
mypy app
```

---

## 🗄️ Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "describe migration"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## 🔒 Privacy & Responsible AI

> EduShield AI is designed for **sensitive educational environments.** Schools must use the system responsibly.

### ✅ Recommended Safeguards

- 🔒 Collect only necessary student data
- 👥 Restrict access using role-based permissions
- ⚖️ Never use AI output as the **sole** basis for disciplinary action
- 👩‍🏫 Keep teachers and counsellors in the decision loop
- 🔍 Review AI recommendations before acting
- 🌈 Avoid bias against gender, caste, religion, disability, language, or economic background
- 🗄️ Store student data securely and follow Indian data protection guidelines
- 📋 Maintain audit logs for all sensitive actions

### ⚠️ Important Disclaimer

> EduShield AI provides **risk indicators and recommendations only.** It does not diagnose mental health conditions, guarantee dropout prevention, or replace professional judgement.
>
> **Final decisions must always be made by qualified teachers, school administrators, counsellors, and guardians.**

---

## 🚢 Production Deployment Checklist

- [ ] Use a strong `SECRET_KEY`
- [ ] Disable `DEBUG` mode
- [ ] Configure production database
- [ ] Configure HTTPS / SSL
- [ ] Set allowed CORS origins
- [ ] Add automated database backups
- [ ] Enable structured logging
- [ ] Configure monitoring and alerts
- [ ] Secure uploaded files
- [ ] Set up role-based access control
- [ ] Review AI scoring logic with educators
- [ ] Perform security testing
- [ ] Document data retention policy

---

## 🛠️ Troubleshooting

<details>
<summary><b>❌ Database connection error</b></summary>

Check that PostgreSQL is running and `DATABASE_URL` is correct:
```bash
psql -U postgres -d edushield_db
```
</details>

<details>
<summary><b>❌ Redis connection error</b></summary>

```bash
redis-cli ping
# Expected: PONG
```
</details>

<details>
<summary><b>❌ Alembic migration error</b></summary>

Ensure your database exists and models are correctly imported:
```bash
alembic upgrade head
```
</details>

<details>
<summary><b>❌ OpenAI API error</b></summary>

Check your `.env` file:
```env
OPENAI_API_KEY=your-openai-api-key
```
Also verify your account has access to the required models and speech-to-text APIs.
</details>

---

## 🗺️ Roadmap

| Status | Feature |
|--------|---------|
| 🔜 | Role-based admin panel APIs |
| 🔜 | Parent communication module |
| 🔜 | SMS and WhatsApp alert integration |
| 🔜 | Offline-first mobile sync support |
| 🔜 | Advanced ML model training pipeline |
| 🔜 | School-level benchmarking |
| 🔜 | Intervention success prediction |
| 🔜 | Multi-school district dashboard |
| 🔜 | Additional Indian language support |
| 🔜 | Bias and fairness audit reports |

---

## 🧑‍💻 Development Workflow

**Branch Strategy:**

| Branch | Purpose |
|--------|---------|
| `main` | ✅ Stable production-ready code |
| `develop` | 🔨 Active development branch |
| `feature/*` | ✨ New features |
| `fix/*` | 🐛 Bug fixes |
| `hotfix/*` | 🚨 Urgent production fixes |

```bash
git checkout -b feature/voice-observation-api
pytest tests/ -v
git commit -m "Add voice observation API"
git push origin feature/voice-observation-api
```

---

## 🤝 Contributing

Contributions are warmly welcome! 🎉

1. 🍴 Fork the repository
2. 🌿 Create a feature branch
3. 💻 Make your changes
4. 🧪 Add tests
5. ✅ Run the test suite
6. 📤 Submit a pull request

```bash
git checkout -b feature/your-feature-name
pytest tests/ -v
git commit -m "Add your feature"
git push origin feature/your-feature-name
```

---

## 📄 License

This project is licensed under the **MIT License.** See the [LICENSE](LICENSE) file for details.

---

## ❤️ Mission

<div align="center">

> *EduShield AI is built with the mission of helping schools detect early warning signs, support vulnerable students, reduce silent dropouts, and empower teachers with practical AI assistance.*

<br/>

**Made with ❤️ to protect India's students from silent dropouts.**

<br/>

![India](https://img.shields.io/badge/Made_for-India's_Schools-FF9933?style=for-the-badge)
![Students](https://img.shields.io/badge/Protecting-Every_Student-138808?style=for-the-badge)
![AI](https://img.shields.io/badge/Powered_by-Responsible_AI-000080?style=for-the-badge)

</div>