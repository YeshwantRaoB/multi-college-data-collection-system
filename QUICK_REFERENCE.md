# Quick Reference Card

## 🚀 Common Commands

### Setup (First Time)
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with MongoDB URI
npm run create-admin

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
```

### Development
```bash
# Start backend (terminal 1)
cd backend && npm run dev

# Start frontend (terminal 2)
cd frontend && npm run dev
```

### Database Operations
```bash
cd backend

# Create admin user
npm run create-admin

# Create sample data
npm run create-sample-data

# Optimize database indexes
npm run setup-indexes
```

### Production Build
```bash
# Backend (no build needed)
cd backend && npm start

# Frontend
cd frontend && npm run build
```

---

## 🔑 Default Credentials

**Admin:**
```
Username: admin
Password: admin123
```

**Sample College Users:**
```
kptmangalore / college123
kptbangalore / college123
gcemysore / college123
```

⚠️ Change admin password immediately!

---

## 📍 Local URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API: http://localhost:5000/api
- Health: http://localhost:5000/api/health

---

## 🌐 API Endpoints Quick Reference

### Authentication
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/reset-password` - Reset password (admin)

### Colleges
- `GET /api/colleges` - List all
- `GET /api/colleges/:code` - Get one
- `POST /api/colleges` - Create
- `PUT /api/colleges/:code` - Update
- `DELETE /api/colleges/:code` - Delete

### Users
- `GET /api/users` - List all
- `POST /api/users` - Create
- `PUT /api/users/:id` - Update
- `DELETE /api/users/:id` - Delete

### Bulk Upload
- `POST /api/upload/colleges` - Upload colleges
- `POST /api/upload/users` - Upload users
- `GET /api/upload/template/colleges` - Download template
- `GET /api/upload/template/users` - Download template

### Reports
- `GET /api/reports/filters` - Get filter options
- `GET /api/reports/data` - Get report data
- `GET /api/reports/export/excel` - Export Excel
- `GET /api/reports/export/pdf` - Export PDF

### Logs
- `GET /api/logs` - All logs
- `GET /api/logs/college/:code` - College logs
- `GET /api/logs/recent/activity` - Recent activity

---

## 🔧 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-32-character-secret
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Vercel Deployment

### Backend
1. Import repo → Select `backend` folder
2. Add environment variables
3. Deploy

### Frontend
1. Import repo → Select `frontend` folder
2. Add `VITE_API_URL`
3. Deploy

---

## 📦 Project Structure

```
backend/
  middleware/      # Auth, validation
  models/          # Database schemas
  routes/          # API endpoints
  scripts/         # Utility scripts
  server.js        # Main server

frontend/
  src/
    components/    # React components
    context/       # State management
    pages/         # Page components
    services/      # API calls
```

---

## 🐛 Troubleshooting

### Cannot connect to MongoDB
```bash
# Check connection string in .env
cat backend/.env

# Test connection
cd backend
node -e "require('dotenv').config(); const m=require('mongoose'); m.connect(process.env.MONGODB_URI).then(()=>console.log('✅ OK')).catch(e=>console.log('❌',e.message));"
```

### Port already in use
```bash
# Change PORT in backend/.env
# Update VITE_API_URL in frontend/.env.local
```

### Build failed
```bash
# Clear and reinstall
rm -rf node_modules
npm install
```

### CORS error
- Check FRONTEND_URL in backend env
- Check VITE_API_URL in frontend env
- Redeploy backend after env changes

---

## 📚 Documentation Files

- **README.md** - Main documentation
- **DEPLOYMENT.md** - Deployment guide
- **SETUP.md** - Quick setup
- **API_DOCUMENTATION.md** - API reference
- **PRODUCTION-CHECKLIST.md** - Pre-deploy checklist
- **CONTRIBUTING.md** - Contribution guide
- **CHANGELOG.md** - Version history
- **PROJECT_SUMMARY.md** - Project overview

---

## 💡 Useful npm Scripts

### Backend
```bash
npm start                    # Production
npm run dev                  # Development
npm run create-admin         # Create admin
npm run create-sample-data   # Sample data
npm run setup-indexes        # Optimize DB
npm test                     # Run tests
```

### Frontend
```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview build
npm test          # Run tests
npm run lint      # Lint code
```

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable HTTPS in production
- [ ] Whitelist MongoDB IPs
- [ ] Review CORS settings
- [ ] Keep dependencies updated
- [ ] Monitor error logs

---

## 📞 Need Help?

1. Check README.md
2. Review API_DOCUMENTATION.md
3. See DEPLOYMENT.md
4. Check SETUP.md
5. Review troubleshooting section
6. Create GitHub issue

---

**Quick Start:** `cd backend && npm run dev` + `cd frontend && npm run dev`

**Deploy:** Follow DEPLOYMENT.md

**Questions:** Check README.md

---

*Save this file for quick reference! 📌*
