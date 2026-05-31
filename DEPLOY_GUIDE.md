# 🚀 Complete Step-by-Step Render Deployment Guide

This guide provides absolute clarity for deploying the **EduShield AI** full-stack system entirely on Render's free tier without using paid Blueprint features.

---

## 🏗️ Deployment Architecture

We will deploy three primary components natively on Render:
1. **Database Tier**: Render PostgreSQL (for persistent storage).
2. **Backend Service**: Native Python FastAPI Web Service.
3. **Frontend Service**: Native Node Next.js Web Service.

---

## 🔒 Step 1: Create a Render PostgreSQL Database

1. In the Render Dashboard, click **New > PostgreSQL**.
2. Configure:
   - **Name**: `edushield-db`
   - **Database**: `edushield_db`
   - **User**: `edushield_user`
   - **Region**: Select the same region for all services (e.g., *Oregon* or *Singapore* to reduce latency).
   - **Instance Type**: `Free`
3. Click **Create Database**.
4. Once active, look under **Connection Details** and copy the **Internal Database URL** (e.g., `postgres://edushield_user:...`).

---

## 🐍 Step 2: Deploy the Backend (Native Python Web Service)

1. Click **New > Web Service**.
2. Select your repository.
3. Configure:
   - **Name**: `edushield-backend`
   - **Root Directory**: `Edushield-AI-Backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, click **Add Environment Variable** and define:
   
   | Key | Value | Description |
   |-----|-------|-------------|
   | `DATABASE_URL` | *[Paste the Internal Database URL from Step 1]* | The rewriter will automatically convert this to the correct driver prefix. |
   | `SECRET_KEY` | `8cb2bbdc065e8a5dbcf50ad75b4819d45e54d4b1a43a088bd0c4e12e8b15d2fb` | Your encryption security token. |
   | `OPENAI_API_KEY` | `mock-key` *(or your real OpenAI key)* | Key to process vocal observations. |
   | `GEMINI_API_KEY` | `mock-key` *(or your real Gemini key)* | Fallback key for NLP summaries. |
   | `GROQ_API_KEY` | `mock-key` *(or your real Groq key)* | **Alternative Key** to process vocal observations via high-speed Llama models. |

5. Click **Deploy Web Service**.
   - Render will build the environment and spin up the uvicorn server.
   - Note down the active backend service URL (e.g., `https://edushield-backend.onrender.com`).

---

## 🖥️ Step 3: Deploy the Frontend (Native Node Web Service)

1. In Render Dashboard, click **New > Web Service**.
2. Select your repository.
3. Configure:
   - **Name**: `edushield-frontend`
   - **Root Directory**: `EduShield-AI-Frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, click **Add Environment Variable** and define:

   | Key | Value | Description |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_API_URL` | `https://edushield-backend.onrender.com` | **CRITICAL**: Paste your actual backend service URL (omit trailing slash). |

5. Click **Deploy Web Service**.
   - Render will download node dependencies, compile the production package, and serve the dashboard.
   - Launch your active frontend URL in the browser and start logging in!

---

## 🛠️ Troubleshooting Deployment Failures

### 1. The deploy status says "Exited with status 1" during startup
- **Cause**: This usually means the backend is trying to run database migrations but the database is not ready or the connection timed out.
- **Fix**: Re-deploy the backend service once the PostgreSQL database is fully active and accepting connections.

### 2. The frontend shows empty lists or login loading indicators indefinitely
- **Cause**: The frontend cannot connect to the backend URL.
- **Fix**: Check `NEXT_PUBLIC_API_URL` on the frontend Web Service. Verify it has the correct protocol prefix (`https://`) and has **no** trailing slash (e.g., `https://edushield-backend.onrender.com`).

### 3. Build takes a long time
- **Cause**: Installing heavy data science and ML packages (e.g., pandas, scikit-learn) in a Python virtual environment can take a few minutes on the free tier.
- **Fix**: This is normal on Render Free Tier. Do not cancel the build; let it complete.
