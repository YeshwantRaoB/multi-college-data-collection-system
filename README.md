# Multi-College Data Collection & Management System

A comprehensive web application for managing college staff data across multiple institutions with role-based access control, bulk operations, and reporting capabilities.

## 🚀 Features

### Admin Features
- ✅ **Full System Control**: Complete CRUD operations for colleges and users
- 👥 **User Management**: Create, edit, delete users and reset passwords
- 🏫 **College Management**: Manage all college data with real-time validation
- 📊 **Advanced Reporting**: Generate Excel and PDF reports with custom filters
- 📤 **Bulk Upload**: Import colleges and users via Excel templates
- 📝 **Audit Logs**: Track all changes with timestamps and user information
- 🔍 **Filtering**: Multi-dimensional filtering by district, taluk, designation, etc.

### College User Features
- 🏢 **Limited Access**: View and edit only their own college data
- ✏️ **Restricted Editing**: Can only modify Working, Deputation, and Deputation To fields
- 👁️ **View-Only**: Other fields are read-only (College Code, Name, District, etc.)
- 🕒 **Auto-Update Tracking**: View when changes were last made

### Data Fields
1. College Code
2. College Name
3. District
4. Taluk
5. Designation
6. Group
7. Branch
8. Sanctioned
9. Working
10. Vacant (auto-calculated)
11. Deputation
12. Deputation to College Code
13. Remarks

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 + Vite
- **UI Library**: Bootstrap 5.3
- **Icons**: Font Awesome 4.7
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7.9
- **Excel Export**: xlsx, jspdf, jspdf-autotable

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.1
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 8.18
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, express-rate-limit
- **File Processing**: multer, xlsx
- **PDF Generation**: jspdf, jspdf-autotable
- **Validation**: Joi

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account (free tier works)
- Git
- Vercel account (free tier for hosting)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd multi-college-data-collection-system
```

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env

# Edit .env with your MongoDB credentials
# nano .env or use your favorite editor
```

**Configure `.env`:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
NODE_ENV=development
```

**Create Admin User:**
```bash
npm run create-admin
```

Default admin credentials:
- Username: `admin`
- Password: `admin123`
- ⚠️ **Change this password immediately after first login!**

**Start Backend:**
```bash
npm start         # Production
npm run dev       # Development with nodemon
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install

# Create .env.local file
cp .env.example .env.local
```

**Configure `.env.local`:**
```env
VITE_API_URL=http://localhost:5000/api
```

**Start Frontend:**
```bash
npm run dev       # Development
npm run build     # Production build
npm run preview   # Preview production build
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🌐 Deployment to Vercel

This application is configured for **separate deployments** - one for backend, one for frontend.

### Backend Deployment

1. **Navigate to backend folder**
```bash
cd backend
```

2. **Push to GitHub** (if not already)
```bash
git init
git add .
git commit -m "Backend ready for deployment"
git remote add origin <your-backend-repo-url>
git push -u origin main
```

3. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - **Root Directory**: Select `backend`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

4. **Environment Variables** (Add in Vercel Dashboard)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=production
FRONTEND_URL=https://your-frontend-project.vercel.app
```

5. **Deploy** and note your backend URL: `https://your-backend-project.vercel.app`

### Frontend Deployment

1. **Navigate to frontend folder**
```bash
cd frontend
```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - **Root Directory**: Select `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables** (Add in Vercel Dashboard)
```
VITE_API_URL=https://your-backend-project.vercel.app/api
```

4. **Deploy** and access your app: `https://your-frontend-project.vercel.app`

### Post-Deployment

1. **Test the application** with admin credentials
2. **Create college users** through the admin panel
3. **Import sample data** using bulk upload
4. **Change admin password** immediately
5. **Set up MongoDB indexes** for better performance (optional but recommended)

## 📁 Project Structure

```
multi-college-data-collection-system/
├── backend/
│   ├── middleware/          # Auth, validation middleware
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API routes
│   ├── scripts/            # Utility scripts
│   ├── server.js           # Express server
│   ├── package.json
│   ├── vercel.json         # Vercel config
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   ├── vercel.json        # Vercel config
│   ├── vite.config.js
│   └── .env.local         # Local environment
└── README.md
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **Helmet.js**: HTTP security headers
- **CORS Protection**: Configured allowed origins
- **Input Validation**: Joi schema validation
- **Role-Based Access Control**: Admin and college user roles

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/change-password` - Change own password
- `POST /api/auth/reset-password` - Reset user password (admin)

### Colleges
- `GET /api/colleges` - Get all colleges (paginated)
- `GET /api/colleges/:code` - Get single college
- `POST /api/colleges` - Create college (admin)
- `PUT /api/colleges/:code` - Update college
- `DELETE /api/colleges/:code` - Delete college (admin)

### Users
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Bulk Upload
- `POST /api/upload/colleges` - Upload colleges Excel
- `POST /api/upload/users` - Upload users Excel
- `GET /api/upload/template/colleges` - Download college template
- `GET /api/upload/template/users` - Download user template

### Reports
- `GET /api/reports/data` - Get filtered report data
- `GET /api/reports/export/excel` - Export Excel report
- `GET /api/reports/export/pdf` - Export PDF report
- `GET /api/reports/filters` - Get available filters

### Logs
- `GET /api/logs` - Get all logs (admin)
- `GET /api/logs/college/:code` - Get college logs
- `GET /api/logs/recent/activity` - Get recent activity

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas (add IP whitelist)
- Ensure database user has read/write permissions

### CORS Errors
- Verify FRONTEND_URL is set in backend environment
- Check browser console for specific origin errors
- Ensure both apps are using HTTPS in production

### Build Failures
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)
- Verify all environment variables are set

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Developer

**Yeshwant Rao B**
- Portfolio: [yrb-portfolio.netlify.app](https://yrb-portfolio.netlify.app/)
- Institution: [Karnataka (Govt.) Polytechnic, Mangalore](https://gpt.karnataka.gov.in/kptmangalore/public/en)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for Educational Institutions**
