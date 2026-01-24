# 🚀 InternTrack - Complete Deployment Guide

## Prerequisites
- GitHub account
- Render.com account (free)
- Vercel account (free) OR use Render for frontend too

---

## Option 1: Deploy to Render (Backend) + Vercel (Frontend) - RECOMMENDED

### 📦 Part 1: Push Code to GitHub

1. **Initialize Git Repository**
   ```powershell
   cd "C:\Users\kemav\OneDrive\Desktop\WAD Project"
   git init
   git add .
   git commit -m "Initial commit - InternTrack application"
   ```

2. **Create GitHub Repository**
   - Go to github.com → New Repository
   - Name: `interntrack`
   - Click "Create repository"

3. **Push to GitHub**
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/interntrack.git
   git branch -M main
   git push -u origin main
   ```

---

### 🔧 Part 2: Deploy Backend to Render

1. **Go to Render.com**
   - Visit [render.com](https://render.com)
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your `interntrack` repository
   - Click "Connect"

3. **Configure Service**
   - **Name:** `interntrack-backend`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

4. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" and add these:

   ```
   MONGODB_URI
   mongodb://admin:Admin123@ac-uagoacv-shard-00-00.h108ohn.mongodb.net:27017,ac-uagoacv-shard-00-01.h108ohn.mongodb.net:27017,ac-uagoacv-shard-00-02.h108ohn.mongodb.net:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority

   JWT_SECRET
   your-super-secret-jwt-key-change-this-in-production

   EMAIL_USER
   kemavarunchandra.09@gmail.com

   EMAIL_PASSWORD
   mwhp ohzq fhtj hnng

   NODE_ENV
   production

   PORT
   5000
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Your backend URL will be: `https://interntrack-backend.onrender.com`

---

### 🌐 Part 3: Deploy Frontend to Vercel

1. **Update config.js**
   - Open `config.js`
   - Replace the backend URL:
   ```javascript
   const API_CONFIG = {
     BASE_URL: window.location.hostname === 'localhost' 
       ? 'http://localhost:5000/api'
       : 'https://interntrack-backend.onrender.com/api' // Your Render URL
   };
   ```

2. **Push Changes**
   ```powershell
   git add config.js
   git commit -m "Update backend URL for production"
   git push
   ```

3. **Deploy on Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New" → "Project"
   - Import your `interntrack` repository
   - Configure:
     - **Framework Preset:** Other
     - **Root Directory:** `./` (leave as is)
     - **Build Command:** leave empty
     - **Output Directory:** leave empty
   - Click "Deploy"

4. **Done!**
   - Your app will be live at: `https://interntrack-XXXX.vercel.app`
   - Deployment takes 1-2 minutes

---

## Option 2: Deploy Everything to Render (Simpler)

### Backend (Same as above)
Follow Part 2 above

### Frontend (Static Site)
1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your repository
4. Configure:
   - **Name:** `interntrack-frontend`
   - **Branch:** `main`
   - **Build Command:** leave empty
   - **Publish Directory:** `./`
5. Click "Create Static Site"

Your app: `https://interntrack-frontend.onrender.com`

---

## ✅ Post-Deployment Checklist

After deployment, test these features:

- [ ] Open your deployed URL
- [ ] Test user registration
- [ ] Test login (use admin@interntrack.com / admin@123)
- [ ] Check calendar displays events
- [ ] Generate a roadmap
- [ ] Verify contests are showing
- [ ] Test forgot password flow

---

## 🔧 Troubleshooting

### CORS Errors
If you see CORS errors, add environment variable to Render backend:
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Database Connection Issues
- Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Verify `MONGODB_URI` is correct in Render environment variables

### API Not Working
- Check browser console for errors
- Verify `config.js` has correct backend URL
- Test backend directly: `https://your-backend.onrender.com/api/test`

### Free Tier Limitations
- Render free tier sleeps after 15min inactivity
- First request after sleep takes 30-60 seconds
- Upgrade to paid tier ($7/month) for always-on service

---

## 📊 Deployment URLs

After deployment, update this section:

- **Frontend:** https://your-app.vercel.app
- **Backend:** https://interntrack-backend.onrender.com
- **API Test:** https://interntrack-backend.onrender.com/api/test

---

## 🎉 Success!

Your InternTrack application is now live and accessible from anywhere in the world!

**Share your app:** Send the Vercel URL to friends and test it on mobile devices.
