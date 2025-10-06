# Multi-College Data Collection & Management System

A comprehensive web application for collecting and managing college data across the state, built with Node.js, Express, MongoDB, and Bootstrap.

## Features

### Admin Features
- Full system control
- Add/Edit/Delete colleges & users
- Bulk upload via Excel
- Generate Excel & PDF reports
- View and modify all college data
- Password management
- Update history tracking

### College User Features
- View/Edit their college's data
- Edit permissions restricted to Working and Deputation fields
- Real-time data updates
- Secure login system

### Data Management
- Automatic calculation of vacant positions (Sanctioned - Working - Deputation)
- Comprehensive audit logs
- Responsive web UI
- Excel/PDF export functionality

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **File Upload**: Multer
- **Reports**: Excel (xlsx), PDF (jsPDF)
- **Frontend**: HTML5, Bootstrap 5, JavaScript
- **Deployment**: Vercel

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Vercel account (for deployment)

### Local Development

1. Clone the repository
```bash
git clone <repository-url>
cd multi-college-data-collection-system
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp backend/.env.example backend/.env
```

4. Update `.env` with your MongoDB URI and JWT secret
```env
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-jwt-secret-key
PORT=5000
```

5. Create admin user
```bash
npm run create-admin
```

6. Start development server
```bash
npm run dev
```

7. Open browser at `http://localhost:5000`

## Deployment to Vercel

1. Push your code to GitHub

2. Connect your GitHub repository to Vercel

3. Set environment variables in Vercel:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string for JWT signing

4. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify token
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/reset-password` - Reset user password (admin only)

### Colleges
- `GET /api/colleges` - Get all colleges (admin)
- `GET /api/colleges/:code` - Get college by code
- `POST /api/colleges` - Create new college (admin)
- `PUT /api/colleges/:code` - Update college
- `DELETE /api/colleges/:code` - Delete college (admin)
- `GET /api/colleges/user/current` - Get current user's college

### Users
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Create new user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

### Upload
- `POST /api/upload/colleges` - Bulk upload colleges (admin)
- `POST /api/upload/users` - Bulk upload users (admin)
- `GET /api/upload/template/colleges` - Download colleges template
- `GET /api/upload/template/users` - Download users template

### Reports
- `GET /api/reports/data` - Get filtered report data
- `GET /api/reports/export/excel` - Export to Excel
- `GET /api/reports/export/pdf` - Export to PDF
- `GET /api/reports/filters` - Get available filter options

### Logs
- `GET /api/logs` - Get all update logs (admin)
- `GET /api/logs/college/:code` - Get logs for specific college
- `GET /api/logs/recent/activity` - Get recent activity

## Data Structure

### College Fields
- College Code (unique)
- College Name
- District
- Taluk
- Designation
- Group
- Branch
- Sanctioned (total positions)
- Working (filled positions)
- Vacant (calculated: Sanctioned - Working - Deputation)
- Deputation (positions on deputation)
- Deputation to College Code (where deputed)
- Remarks

### User Roles
- **Admin**: Full access to all features
- **College**: Limited access to their college data

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- CORS protection
- Secure file upload handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC License

## Author

**Yeshwant Rao B**
- Portfolio: [https://yrb-portfolio.netlify.app/](https://yrb-portfolio.netlify.app/)
- College: [Karnataka (Govt.) Polytechnic, Mangalore](https://gpt.karnataka.gov.in/kptmangalore/public/en)