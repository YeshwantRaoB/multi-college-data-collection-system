# Quick Setup Guide

This guide helps you get the application running locally in under 10 minutes.

## 🚀 Quick Start (Copy & Paste)

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd multi-college-data-collection-system

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Setup MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account → Create cluster (free tier)
3. Create database user:
   - Username: `college_admin`
   - Password: (generate or create strong password)
4. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
5. Connect → Drivers → Copy connection string

### 3. Configure Backend

```bash
cd backend

# Create .env file
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://college_admin:YOUR_PASSWORD@cluster.mongodb.net/college_data
JWT_SECRET=your-32-character-secret-key-here-change-me
PORT=5000
NODE_ENV=development
EOF

# Edit .env and replace YOUR_PASSWORD with actual password
# For Windows: use notepad .env
# For Mac/Linux: use nano .env or vim .env
```

### 4. Create Admin User

```bash
# Still in backend folder
npm run create-admin
```

You should see:
```
✅ Admin user created successfully
Username: admin
Password: admin123
Role: admin
⚠️  Please change the password after first login!
```

### 5. Start Backend

```bash
npm run dev
```

You should see:
```
Backend server is running on port 5000
API Base URL: http://localhost:5000/api
React Frontend: http://localhost:3000
Health Check: http://localhost:5000/api/health
Connected to MongoDB Atlas
```

**Test it:** Open http://localhost:5000/api/health in browser

### 6. Configure Frontend

Open a NEW terminal window:

```bash
cd frontend

# Create .env.local file
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5000/api
EOF
```

### 7. Start Frontend

```bash
# Still in frontend folder
npm run dev
```

You should see:
```
  VITE v7.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 8. Access Application

Open your browser and go to: **http://localhost:5173**

**Login with:**
- Username: `admin`
- Password: `admin123`

## 🎉 That's It!

You should now see the admin dashboard. Try:
- Adding a college
- Creating a user
- Exploring features

## 🐛 Common Issues

### "Cannot connect to MongoDB"
```bash
# Check your MongoDB connection string
cd backend
cat .env

# Test connection
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('✅ Connected!')).catch(err => console.log('❌ Error:', err.message));"
```

### "Port 5000 already in use"
```bash
# Change PORT in backend/.env to 5001 or 3001
# Update VITE_API_URL in frontend/.env.local accordingly
```

### "Module not found"
```bash
# Delete node_modules and reinstall
cd backend
rm -rf node_modules
npm install

cd ../frontend
rm -rf node_modules
npm install
```

## 📚 Next Steps

1. **Read the full README**: [README.md](./README.md)
2. **Deploy to Vercel**: [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Explore the code**: Check out the project structure
4. **Customize**: Modify for your specific needs

## 🆘 Need Help?

- Check the [README.md](./README.md) for detailed information
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Open an issue on GitHub
- Check the troubleshooting section in README

## 💡 Pro Tips

### Sample Data

Create a few colleges manually or use bulk upload:
1. Go to "Bulk Upload" tab
2. Click "Download Template"
3. Fill in the Excel file
4. Upload the file

### MongoDB Compass

Install [MongoDB Compass](https://www.mongodb.com/products/compass) to:
- View your data visually
- Run queries
- Manage indexes
- Export/import data

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- MongoDB for VS Code
- Thunder Client (API testing)

### Environment Variables Reference

**Backend (.env)**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=long-random-string-at-least-32-characters
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env.local)**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🔐 Security Reminders

- ✅ Change admin password after first login
- ✅ Never commit `.env` files
- ✅ Use strong JWT_SECRET in production
- ✅ Keep dependencies updated
- ✅ Review logs regularly

---

**Happy Coding! 🚀**
