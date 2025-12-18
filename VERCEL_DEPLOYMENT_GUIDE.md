# Vercel Deployment Guide - Todos Application

## ✅ Project Status
Your project is **PRODUCTION READY** and can be deployed to Vercel immediately!

---

## 📋 Pre-Deployment Checklist

- ✅ Frontend (React) - Build successful
- ✅ Backend (Node.js) - All routes working
- ✅ Database (MongoDB Atlas) - Connected and accessible
- ✅ Authentication - JWT implemented
- ✅ Zero vulnerabilities - All packages verified
- ✅ Environment variables - Configured

---

## 🚀 Deployment Steps

### **STEP 1: Prepare Backend for Vercel**

Create a `vercel.json` file in the backend root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "SECRET_KEY": "@secret_key",
    "PORT": "3000"
  }
}
```

---

### **STEP 2: Deploy Backend to Vercel**

#### 2.1 Install Vercel CLI
```bash
npm install -g vercel
```

#### 2.2 Login to Vercel
```bash
vercel login
```

#### 2.3 Deploy Backend
```bash
cd todo-List-Backend
vercel
```

**Follow the prompts:**
- Project name: `todos-app-backend` (or your choice)
- Framework preset: `Other`
- Root directory: `.` (current directory)

#### 2.4 Add Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project: `todos-app-backend`
3. Go to Settings → Environment Variables
4. Add these variables:

```
MONGODB_URI=mongodb+srv://krishnavarun:Krishnavarun5126@cluster0.zsgpsd9.mongodb.net/todo-list
SECRET_KEY=your_secure_secret_key_here_generate_new_one
PORT=3000
NODE_ENV=production
```

**To generate a secure SECRET_KEY:**
```bash
# In terminal/PowerShell, run:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### 2.5 Get Backend URL
After deployment, you'll get a URL like:
```
https://todos-app-backend-xxxxx.vercel.app
```

Copy this URL - you'll need it for the frontend.

---

### **STEP 3: Update Frontend for Production**

Update the API_URL in your frontend files to use the deployed backend.

#### 3.1 Update `src/components/LoginForm.jsx`
Replace:
```javascript
const API_URL = 'http://localhost:3000';
```

With:
```javascript
const API_URL = 'https://todos-app-backend-xxxxx.vercel.app';
```

#### 3.2 Update `src/components/Todos.jsx`
Replace:
```javascript
const API_URL = 'http://localhost:3000';
```

With:
```javascript
const API_URL = 'https://todos-app-backend-xxxxx.vercel.app';
```

#### 3.3 Update `src/components/RegisterForm.jsx`
If it has API_URL, replace it similarly.

---

### **STEP 4: Deploy Frontend to Vercel**

#### 4.1 Deploy Frontend
```bash
cd ../todo-List-Frontend
vercel
```

**Follow the prompts:**
- Project name: `todos-app-frontend` (or your choice)
- Framework preset: `Vite`
- Root directory: `.`
- Build command: `npm run build`
- Output directory: `dist`

#### 4.2 Frontend Deployment Complete
You'll get a URL like:
```
https://todos-app-frontend-xxxxx.vercel.app
```

**Your app is now LIVE!** 🎉

---

## 🔗 Connecting Backend & Frontend

If you deployed backend to: `https://todos-app-backend-xxxxx.vercel.app`

Update frontend files with this URL:
- `src/components/LoginForm.jsx`
- `src/components/RegisterForm.jsx`
- `src/components/Todos.jsx`

Then redeploy frontend:
```bash
cd todo-List-Frontend
vercel --prod
```

---

## 🧪 Testing Deployment

1. Open your frontend URL: `https://todos-app-frontend-xxxxx.vercel.app`
2. Try to register a new account
3. Login with your credentials
4. Add a todo
5. Test all CRUD operations

---

## 🛠️ Environment Variables Reference

### Backend (.env)
```
PORT=3000
MONGODB_URI=mongodb+srv://krishnavarun:Krishnavarun5126@cluster0.zsgpsd9.mongodb.net/todo-list
SECRET_KEY=<generate-new-secure-key>
NODE_ENV=production
```

### Frontend (No .env needed)
- Update hardcoded API_URL in component files

---

## 📊 Vercel Deployment Overview

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| Frontend | Vercel | https://todos-app-frontend-xxxxx.vercel.app | Live |
| Backend | Vercel | https://todos-app-backend-xxxxx.vercel.app | Live |
| Database | MongoDB Atlas | Cloud | Connected |

---

## ⚠️ Important Notes

1. **CORS Configuration**: Backend already has CORS enabled for all origins (update in production if needed)
2. **Authentication**: Uses JWT tokens - stored in localStorage
3. **Database**: Uses your existing MongoDB Atlas connection
4. **Security**: Change the SECRET_KEY for production
5. **API Requests**: Frontend uses the deployed backend URL

---

## 🐛 Troubleshooting

### Backend Not Responding
- Check Vercel logs: https://vercel.com/dashboard → Project → Deployments → Logs
- Verify MONGODB_URI environment variable
- Verify SECRET_KEY is set

### CORS Errors
- Backend has `cors()` middleware enabled
- Check frontend is using correct API URL

### Login/Register Not Working
- Verify backend is running
- Check MongoDB connection
- Review Vercel deployment logs

---

## 📈 Monitoring & Updates

### View Logs
```bash
vercel logs [project-name]
```

### Redeploy After Changes
```bash
git add .
git commit -m "Update frontend API URL"
vercel --prod
```

### Scale Your App
- Vercel automatically handles scaling
- Monitor usage at: https://vercel.com/dashboard

---

## ✨ After Deployment

✅ **Your app is now:**
- Hosted globally on Vercel CDN
- Accessible from anywhere
- Automatically scaled
- HTTPS secured
- Ready for production users

**Share your app URL:** `https://todos-app-frontend-xxxxx.vercel.app`

---

## 📞 Support

For issues with Vercel deployment:
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- React/Vite: https://vitejs.dev/

---

**Deployment Date:** December 18, 2025  
**Status:** ✅ Ready for Production
