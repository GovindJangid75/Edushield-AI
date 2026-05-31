# 🚀 Complete Step-by-Step Render Deployment Guide

This guide provides absolute clarity for deploying the **EduShield AI** full-stack system on Render's free tier. 

---

## 🏗️ Deployment Architecture

We will deploy three primary components on Render:
1. **Database Tier**: Render PostgreSQL (for persistent storage) and Render Redis (for caching/background queues).
2. **Backend Service**: Docker-based FastAPI Web Service.
3. **Frontend Service**: Node-based Next.js Web Service.

---

## 🏁 Option A: Zero-Config Deployment (Fastest, SQLite-based)

If you are setting up a quick evaluation or hackathon demo, you do **not** need to set up a database. The backend will automatically fall back to SQLite and run migrations seamlessly inside the container.

### Step 1: Deploy the Backend Web Service
1. Log in to [Render](https://render.com) and click **New > Web Service**.
2. Connect your GitHub repository containing the monorepo.
3. In the Web Service configuration, set:
   - **Name**: `edushield-backend`
   - **Root Directory**: `Edushield-AI-Backend`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
4. Click **Deploy Web Service**. Render will automatically pull the Dockerfile, build the image, run migrations on startup, and serve the API on a `.onrender.com` subdomain (e.g., `https://edushield-backend.onrender.com`).

---

## 🔒 Option B: Production-Grade Deployment (PostgreSQL + Redis)

Use this method to secure long-term database persistence and real-time syncing logs.

### Step 1: Create a Render PostgreSQL Database
1. In Render Dashboard, click **New > PostgreSQL**.
2. Configure:
   - **Name**: `edushield-db`
   - **Database**: `edushield_db`
   - **User**: `edushield_user`
   - **Region**: Select the same region for all services (e.g., *Oregon* or *Singapore* to reduce latency).
   - **Instance Type**: `Free`
3. Click **Create Database**.
4. Once active, look under **Connection Details** and copy the **Internal Database URL** (e.g., `postgres://edushield_user:...`).

### Step 2: Create a Render Redis Cache (Optional)
1. Click **New > Redis**.
2. Configure:
   - **Name**: `edushield-redis`
   - **Instance Type**: `Free`
3. Click **Create Redis**.
4. Copy the **Internal Redis URL** (e.g., `redis://red-...`).

### Step 3: Deploy the Backend (FastAPI Docker Web Service)
1. Click **New > Web Service**.
2. Select your repository.
3. Configure:
   - **Name**: `edushield-backend`
   - **Root Directory**: `Edushield-AI-Backend`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, click **Add Environment Variable** and define:
   
   | Key | Value | Description |
   |-----|-------|-------------|
   | `DATABASE_URL` | *[Paste the Internal Database URL from Step 1]* | The rewriter will automatically convert this to the correct driver prefix. |
   | `REDIS_URL` | *[Paste the Internal Redis URL from Step 2]* | Connection details for Redis caches. |
   | `SECRET_KEY` | `8cb2bbdc065e8a5dbcf50ad75b4819d45e54d4b1a43a088bd0c4e12e8b15d2fb` | Your encryption security token. |
   | `OPENAI_API_KEY` | `mock-key` *(or your real OpenAI key)* | Key to process vocal observations. |
   | `GEMINI_API_KEY` | `mock-key` *(or your real Gemini key)* | Fallback key for NLP summaries. |
   | `GROQ_API_KEY` | `mock-key` *(or your real Groq key)* | **Alternative Key** to process vocal observations via high-speed Llama models. |

5. Click **Deploy Web Service**.
   - Render will build the container, execute the command `alembic upgrade head` to configure the schemas, and spin up the uvicorn server.
   - Note down the active backend service URL (e.g., `https://edushield-backend.onrender.com`).

---

## 🖥️ Step 4: Deploy the Frontend (Next.js Node Web Service)

1. In Render Dashboard, click **New > Web Service**.
2. Select your repository.
3. Configure:
   - **Name**: `edushield-frontend`
   - **Root Directory**: `EduShield-AI-Frontend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, click **Add Environment Variable** and define:

   | Key | Value | Description |
   |-----|-------|-------------|
   | `NEXT_PUBLIC_API_URL` | `https://edushield-backend.onrender.com` | **CRITICAL**: Paste your actual backend service URL (omit trailing slash). |

5. Click **Deploy Web Service**.
   - Render will download node dependencies, compile the production production package, and serve the dashboard.
   - Launch your active frontend URL in the browser and start logging in!

---

## 🛠️ Troubleshooting Deployment Failures

### 1. The deploy status says "Exited with status 1" during startup
- **Cause**: This usually means the backend is trying to run database migrations but the database is not ready or the connection timed out.
- **Fix**: Verify that you pasted the **Internal Database URL** (not the external one) in the backend's environment variables. Ensure the PostgreSQL status is `Active` on the Render dashboard before deploying uvicorn.

### 2. The frontend shows empty lists or login loading indicators indefinitely
- **Cause**: The frontend cannot connect to the backend URL.
- **Fix**: Check `NEXT_PUBLIC_API_URL` on the frontend Web Service. Verify it has the correct protocol prefix (`https://`) and has **no** trailing slash (e.g., `https://edushield-backend.onrender.com`).

### 3. Build takes a long time
- **Cause**: Render's free tier has limited RAM (512MB). Creating a Docker container can take between 5 to 9 minutes.
- **Fix**: This is normal on Render Free Tier. Do not cancel the build; let it complete. Future builds will be much faster due to Docker layer caching.
