# 🚀 Complete Step-by-Step Render Deployment Guide

This guide provides absolute clarity for deploying the **EduShield AI** full-stack system on Render's free tier. 

---

## 🏗️ Deployment Architecture

We will deploy three primary components natively on Render via Infrastructure as Code (`render.yaml`):
1. **Database Tier**: Render PostgreSQL (for persistent storage).
2. **Backend Service**: Native Python FastAPI Web Service.
3. **Frontend Service**: Native Node Next.js Web Service.

---

## 🏁 Option A: Zero-Config Blueprint Deployment (Fastest)

By using the `render.yaml` Blueprint in the root directory, you can deploy the database, backend, and frontend all at once without manual configuration in the Render UI.

### Step 1: Deploy from Blueprint
1. Log in to [Render](https://render.com) and click **Blueprints > New Blueprint Instance**.
2. Connect your GitHub repository containing the monorepo.
3. Render will automatically detect the `render.yaml` file and prompt you to deploy:
   - **PostgreSQL Database** (`edushield-db`)
   - **Backend Web Service** (`edushield-backend` using Python native environment)
   - **Frontend Web Service** (`edushield-frontend` using Node native environment)
4. Click **Apply Blueprint**. Render will prompt you to enter any un-synced environment variables. 
   - **Important**: For `NEXT_PUBLIC_API_URL`, you will need to paste the deployed URL of your backend service once it's created (e.g., `https://edushield-backend.onrender.com`).
5. Render will automatically build and deploy all services securely.

---

## 🛠️ Troubleshooting Deployment Failures

### 1. The deploy status says "Exited with status 1" during startup
- **Cause**: This usually means the backend is trying to run database migrations but the database is not ready or the connection timed out.
- **Fix**: Re-deploy the backend service once the PostgreSQL database is fully active and accepting connections.

### 2. The frontend shows empty lists or login loading indicators indefinitely
- **Cause**: The frontend cannot connect to the backend URL.
- **Fix**: Check `NEXT_PUBLIC_API_URL` on the frontend Web Service. The blueprint syncs this automatically, but if you recreated it, ensure it points to the active `https://edushield-backend.onrender.com`.

### 3. Build takes a long time
- **Cause**: Installing heavy data science and ML packages (e.g., pandas, scikit-learn) in a Python virtual environment can take a few minutes on the free tier.
- **Fix**: This is normal on Render Free Tier. Do not cancel the build; let it complete.
