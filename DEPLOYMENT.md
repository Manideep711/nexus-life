# 🚀 Nexus Lifeline Deployment Guide

This guide will walk you through deploying your MERN stack application completely for free. We'll use **MongoDB Atlas** for the database, **Render** for the backend (Node/Express), and **Vercel** for the frontend (React/Vite).

---

## Step 1: Database Setup (MongoDB Atlas)
If you haven't already moved your database to the cloud, you need to do so:
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up/log in.
2. Create a new **Free Tier Cluster**.
3. Under **Database Access**, create a new database user (save the username and password).
4. Under **Network Access**, add `0.0.0.0/0` to allow access from anywhere (or configure specific IPs).
5. Click **Connect**, choose "Connect your application", and copy your connection string (it looks like `mongodb+srv://<username>:<password>@cluster...`).
6. Save this string. You'll need it for the Backend deployment.

---

## Step 2: Prepare Your GitHub Repository
Before deploying, push your entire project to a **GitHub Repository**.
1. Open up your terminal in the main project folder.
2. Initialize and push your repository:
   ```bash
   git init
   git add .
   git commit -m "Ready for production"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

---

## Step 3: Backend Deployment (Render)
Render automatically detects Node.js and manages free hosting.
1. Create a free account at [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `nexus-lifeline` repository.
4. Fill in the following details:
   - **Name:** `nexus-backend` (or similar)
   - **Root Directory:** `backend` (very important!)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Scroll down to **Environment Variables** and add:
   - `MONGO_URI`: (Paste your MongoDB connection string from Step 1)
   - `JWT_SECRET`: (Create a random, secure string)
   - `PORT`: `5000` (Optional)
   - `FRONTEND_URL`: `*` *(We'll come back and update this to your Vercel URL later for security)*
6. Click **Create Web Service**. Wait for it to build and deploy. Once deployed, copy the Render URL (e.g., `https://nexus-backend.onrender.com`).

*Note: On Render's free tier, local file uploads to the `uploads/` folder will be deleted when the server sleeps.*

---

## Step 4: Frontend Deployment (Vercel)
Vercel is optimized for React/Vite applications.
1. Create a free account at [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. In the configuration window:
   - **Root Directory:** Edit this and select `frontend`.
   - **Framework Preset:** Vite (should be auto-detected).
5. Open the **Environment Variables** section and add:
   - `VITE_API_URL`: (Paste your Render Backend URL, e.g., `https://nexus-backend.onrender.com`. Do NOT include a trailing slash.)
   - `VITE_GOOGLE_MAPS_API_KEY`: (Your Google Maps API key)
6. Click **Deploy**. Vercel will build and launch your application.
7. Once finished, copy your new Vercel URL (e.g., `https://nexus-lifeline.vercel.app`).

---

## Step 5: Final Security Connection
Now that your frontend is live, let's secure the backend CORS policy.
1. Go back to your Backend Web Service on **Render**.
2. Go to the **Environment** tab.
3. Update the `FRONTEND_URL` variable to your new Vercel URL (e.g., `https://nexus-lifeline.vercel.app`).
4. Click Save. Render may trigger a quick restart.

## 🎉 Congratulations!
Your Full Stack Application is now live on the internet! Test the chat, maps, and document uploads to ensure everything is connected successfully.
