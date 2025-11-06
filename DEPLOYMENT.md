# Deployment Guide - Multi-College Data Collection System

This guide provides step-by-step instructions for deploying the application to Vercel.

## 📋 Pre-Deployment Checklist

### MongoDB Setup
- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster (free tier is fine)
- [ ] Create database user with read/write permissions
- [ ] Whitelist IP addresses (0.0.0.0/0 for Vercel or specific IPs)
- [ ] Get connection string (should look like: `mongodb+srv://username:password@cluster.mongodb.net/`)
- [ ] Test connection from local environment

### Repository Setup
- [ ] Push code to GitHub/GitLab/Bitbucket
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Commit all changes
- [ ] Create separate branches if needed (optional)

### Vercel Account
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Connect your Git provider
- [ ] Verify email address

## 🚀 Part 1: Backend Deployment

### Step 1: Prepare Backend

1. **Verify vercel.json exists in backend folder:**
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
      "src": "/api/(.*)",
      "dest": "server.js"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. **Verify package.json has correct scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 2: Deploy Backend to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"

2. **Import Repository**
   - Select your Git provider
   - Choose your repository
   - Click "Import"

3. **Configure Project**
   - **Project Name**: `college-data-backend` (or your choice)
   - **Framework Preset**: Other
   - **Root Directory**: `backend` ⚠️ IMPORTANT: Click "Edit" and select `backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/college_data
   JWT_SECRET = your-super-secret-jwt-key-minimum-32-characters
   NODE_ENV = production
   FRONTEND_URL = (leave empty for now, will add after frontend deployment)
   ```

   **Generate JWT Secret** (use this command):
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)
   - Note your backend URL: `https://your-project-name.vercel.app`

6. **Test Backend**
   - Visit: `https://your-project-name.vercel.app/api/health`
   - Should see: `{"status":"OK","message":"College Data System API is running",...}`

### Step 3: Create Admin User

After backend is deployed, you need to create an admin user in MongoDB:

**Option A: Using MongoDB Compass/Atlas Web Interface**
1. Connect to your MongoDB database
2. Create a document in the `users` collection:
```json
{
  "username": "admin",
  "password": "$2a$10$X8xN9...", // You'll need to hash this - see Option B
  "role": "admin",
  "isActive": true,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

**Option B: Run Script Locally (Recommended)**
```bash
cd backend
# Make sure .env points to production MongoDB
npm run create-admin
```

**Option C: Use MongoDB Shell**
```javascript
use college_data;
db.users.insertOne({
  username: "admin",
  password: "$2a$10$X8xN9...", // Hash "admin123" using bcrypt
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});
```

## 🎨 Part 2: Frontend Deployment

### Step 1: Prepare Frontend

1. **Verify vercel.json exists in frontend folder:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

2. **Verify vite.config.js:**
```javascript
export default {
  // ... existing config
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser'
  }
}
```

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel Dashboard**
   - Click "Add New Project"

2. **Import Same Repository**
   - Select your repository again (yes, same repo!)

3. **Configure Project**
   - **Project Name**: `college-data-frontend` (or your choice)
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` ⚠️ IMPORTANT: Click "Edit" and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   
   ```
   VITE_API_URL = https://your-backend-project.vercel.app/api
   ```
   
   ⚠️ Replace with your actual backend URL from Part 1!

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Note your frontend URL: `https://your-frontend-name.vercel.app`

### Step 3: Update Backend CORS

1. **Go to Backend Project Settings**
   - Vercel Dashboard → Your Backend Project → Settings → Environment Variables

2. **Add/Update FRONTEND_URL**
   ```
   FRONTEND_URL = https://your-frontend-name.vercel.app
   ```

3. **Redeploy Backend**
   - Go to Deployments tab
   - Click "..." on latest deployment
   - Click "Redeploy"

## ✅ Post-Deployment Verification

### Test Checklist

1. **Backend Health Check**
   - [ ] Visit: `https://your-backend.vercel.app/api/health`
   - [ ] Should return JSON with status OK

2. **Frontend Loading**
   - [ ] Visit: `https://your-frontend.vercel.app`
   - [ ] Login page should load
   - [ ] No console errors

3. **Authentication**
   - [ ] Login with admin credentials: `admin` / `admin123`
   - [ ] Should redirect to admin dashboard
   - [ ] Dashboard should show data (may be 0 if fresh)

4. **API Communication**
   - [ ] Check browser Network tab
   - [ ] API calls should go to backend URL
   - [ ] No CORS errors

5. **College Management**
   - [ ] Try adding a college
   - [ ] Try editing a college
   - [ ] Try deleting a college

6. **User Management**
   - [ ] Create a college user
   - [ ] Reset user password
   - [ ] Logout and login as college user

7. **Bulk Upload**
   - [ ] Download templates
   - [ ] Upload sample data
   - [ ] Verify data appears

8. **Reports**
   - [ ] Apply filters
   - [ ] Export Excel
   - [ ] Export PDF

9. **Logs**
   - [ ] View update logs
   - [ ] Verify timestamps are correct

## 🔧 Troubleshooting

### Issue: "Cannot connect to database"
**Solutions:**
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for Vercel)
- Verify MONGODB_URI environment variable
- Check MongoDB user permissions
- Ensure database name in connection string is correct

### Issue: "CORS Error"
**Solutions:**
- Verify FRONTEND_URL is set in backend environment
- Check that frontend is using correct VITE_API_URL
- Redeploy backend after updating environment variables
- Clear browser cache

### Issue: "404 Not Found" on API calls
**Solutions:**
- Verify API_URL in frontend environment (should end with `/api`)
- Check backend vercel.json routes configuration
- Ensure backend is deployed in `backend` folder
- Check backend logs in Vercel dashboard

### Issue: "Build Failed"
**Solutions:**
- Check build logs in Vercel dashboard
- Verify all dependencies are in package.json
- Ensure Node version compatibility (18+)
- Check for syntax errors in code

### Issue: "Cannot read property of undefined"
**Solutions:**
- Check environment variables are set correctly
- Verify API responses in Network tab
- Check browser console for specific errors
- Ensure backend is running and accessible

## 🔐 Security Recommendations

After deployment:

1. **Change Admin Password**
   - Login as admin
   - Go to profile/settings
   - Change password from `admin123` to something strong

2. **Use Strong JWT Secret**
   - Generate with: `openssl rand -base64 32`
   - Update in Vercel environment variables
   - Redeploy backend

3. **Enable 2FA** (if needed)
   - Implement in future versions

4. **Monitor Logs**
   - Check Vercel logs regularly
   - Set up alerts for errors

5. **Backup Database**
   - Set up automated backups in MongoDB Atlas
   - Export data regularly

## 🔄 Updating the Application

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push
```
Vercel will auto-deploy!

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel will auto-deploy!

### Manual Redeploy
- Vercel Dashboard → Project → Deployments
- Click "..." on latest deployment → Redeploy

## 📊 Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Track pageviews, performance, errors

### MongoDB Metrics
- MongoDB Atlas → Cluster → Metrics
- Monitor connections, operations, storage

## 🆘 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console errors
3. Verify environment variables
4. Test API endpoints with Postman
5. Review this guide again

## 🎉 Success!

If all tests pass, your application is live and production-ready!

**Your URLs:**
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app`
- API: `https://your-backend.vercel.app/api`

Share with your team and start managing college data! 🚀
