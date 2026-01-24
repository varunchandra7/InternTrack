# InternTrack - Deployment Guide

## 🚀 How to Deploy Online

### Step 1: Deploy Backend to Render

1. **Create a GitHub Repository**
   ```bash
   cd "C:\Users\kemav\OneDrive\Desktop\WAD Project"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [https://render.com](https://render.com)
   - Click "Sign Up" (use GitHub account)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** interntrack-backend
     - **Root Directory:** backend
     - **Runtime:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
   
3. **Add Environment Variables**
   Click "Environment" and add:
   ```
   MONGODB_URI=mongodb://admin:Admin123@ac-uagoacv-shard-00-00.h108ohn.mongodb.net:27017,ac-uagoacv-shard-00-01.h108ohn.mongodb.net:27017,ac-uagoacv-shard-00-02.h108ohn.mongodb.net:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   EMAIL_USER=kemavarunchandra.09@gmail.com
   EMAIL_PASSWORD=mwhp ohzq fhtj hnng
   NODE_ENV=production
   PORT=5000
   ```

4. **Deploy** - Click "Create Web Service"
   - Wait 3-5 minutes
   - Copy your backend URL: `https://interntrack-backend.onrender.com`

---

### Step 2: Deploy Frontend to Vercel

1. **Update Frontend API URLs**
   - Open `config.js`
   - Replace `your-backend-url.onrender.com` with your actual Render URL

2. **Deploy on Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New" → "Project"
   - Import your repository
   - Configure:
     - **Framework Preset:** Other
     - **Root Directory:** ./
     - **Build Command:** (leave empty)
     - **Output Directory:** (leave empty)
   - Click "Deploy"

3. **Done!**
   - Your frontend URL: `https://your-project.vercel.app`

---

## 📝 Quick Alternative: Deploy Both to Render

**Simpler option if you want everything in one place:**

1. Deploy backend as Web Service (as above)
2. Deploy frontend as Static Site:
   - New → Static Site
   - Build Command: (leave empty)
   - Publish Directory: ./

---

## ✅ After Deployment Checklist

- [ ] Update `config.js` with backend URL
- [ ] Test login functionality
- [ ] Verify calendar loads events
- [ ] Test roadmap generation
- [ ] Check contests auto-fetch

---

## 🔧 Troubleshooting

**CORS errors?**
- Add your Vercel URL to `FRONTEND_URL` env variable in Render

**Database not connecting?**
- Check MongoDB Atlas IP whitelist includes `0.0.0.0/0`

**API not working?**
- Verify backend URL in `config.js` matches Render URL
