# API Documentation

Complete API reference for the Multi-College Data Collection System.

## Base URL

**Development:** `http://localhost:5000/api`  
**Production:** `https://your-backend.vercel.app/api`

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "message": "Error description",
  "details": [ ... ] // Optional validation errors
}
```

---

## Authentication Endpoints

### POST /auth/login
Login to get JWT token.

**Access:** Public

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "role": "admin",
    "collegeCode": null
  }
}
```

### GET /auth/verify
Verify JWT token validity.

**Access:** Requires Authentication

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "role": "admin",
    "collegeCode": null
  }
}
```

### POST /auth/change-password
Change own password.

**Access:** Requires Authentication

**Request Body:**
```json
{
  "currentPassword": "admin123",
  "newPassword": "newSecurePassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

### POST /auth/reset-password
Reset another user's password (admin only).

**Access:** Admin Only

**Request Body:**
```json
{
  "username": "user123",
  "newPassword": "newPassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

---

## College Endpoints

### GET /colleges
Get all colleges with pagination.

**Access:** Admin Only

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 25, max: 1000) - Items per page

**Example:** `/api/colleges?page=1&limit=50`

**Success Response (200):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "collegeCode": "KPTMGL001",
      "collegeName": "Karnataka Government Polytechnic Mangalore",
      "district": "Dakshina Kannada",
      "taluk": "Mangalore",
      "designation": "Principal",
      "group": "Technical Education",
      "branch": "Administration",
      "sanctioned": 1,
      "working": 1,
      "vacant": 0,
      "deputation": 0,
      "deputationToCollegeCode": "",
      "remarks": "Main campus",
      "lastUpdated": "2025-01-06T12:00:00.000Z",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-06T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "pages": 2
  }
}
```

### GET /colleges/:collegeCode
Get single college by code.

**Access:** Authenticated (College users can only access their own)

**Example:** `/api/colleges/KPTMGL001`

**Success Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "collegeCode": "KPTMGL001",
  "collegeName": "Karnataka Government Polytechnic Mangalore",
  ...
}
```

### POST /colleges
Create new college.

**Access:** Admin Only

**Request Body:**
```json
{
  "collegeCode": "KPTMGL001",
  "collegeName": "Karnataka Government Polytechnic Mangalore",
  "district": "Dakshina Kannada",
  "taluk": "Mangalore",
  "designation": "Principal",
  "group": "Technical Education",
  "branch": "Administration",
  "sanctioned": 1,
  "working": 1,
  "deputation": 0,
  "deputationToCollegeCode": "",
  "remarks": "Main campus"
}
```

**Success Response (201):**
```json
{
  "message": "College created successfully",
  "college": { ... }
}
```

### PUT /colleges/:collegeCode
Update college data.

**Access:** Authenticated  
**Note:** College users can only update `working`, `deputation`, and `deputationToCollegeCode` fields.

**Request Body (Admin):**
```json
{
  "collegeName": "Updated Name",
  "working": 5,
  "deputation": 1,
  ...
}
```

**Request Body (College User):**
```json
{
  "working": 5,
  "deputation": 1,
  "deputationToCollegeCode": "KPTBLR001"
}
```

**Success Response (200):**
```json
{
  "message": "College updated successfully",
  "college": { ... }
}
```

### DELETE /colleges/:collegeCode
Delete a college.

**Access:** Admin Only

**Success Response (200):**
```json
{
  "message": "College deleted successfully"
}
```

---

## User Endpoints

### GET /users
Get all users.

**Access:** Admin Only

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "kptmangalore",
    "role": "college",
    "collegeCode": "KPTMGL001",
    "isActive": true,
    "lastLogin": "2025-01-06T12:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-06T12:00:00.000Z"
  }
]
```

### POST /users
Create new user.

**Access:** Admin Only

**Request Body:**
```json
{
  "username": "newuser",
  "password": "password123",
  "collegeCode": "KPTMGL001" // Optional, null for admin users
}
```

**Success Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "newuser",
    "role": "college",
    "collegeCode": "KPTMGL001",
    ...
  }
}
```

### PUT /users/:userId
Update user details.

**Access:** Admin Only

**Request Body:**
```json
{
  "username": "updatedusername",
  "collegeCode": "KPTBLR001",
  "isActive": true
}
```

**Success Response (200):**
```json
{
  "message": "User updated successfully",
  "user": { ... }
}
```

### DELETE /users/:userId
Delete a user.

**Access:** Admin Only  
**Note:** Cannot delete own admin account.

**Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Bulk Upload Endpoints

### POST /upload/colleges
Upload colleges via Excel file.

**Access:** Admin Only

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Excel file (.xlsx, .xls)

**Excel Columns Required:**
- College Code
- College Name
- District
- Taluk
- Designation
- Group
- Branch
- Sanctioned
- Working
- Vacant
- Deputation
- Deputation to College Code
- Remarks

**Success Response (200):**
```json
{
  "message": "Bulk upload completed: 10 successful, 2 duplicates, 1 errors",
  "results": {
    "total": 13,
    "successful": 10,
    "errors": ["Row 5: Invalid Sanctioned value"],
    "duplicates": 2
  }
}
```

### POST /upload/users
Upload users via Excel file.

**Access:** Admin Only

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Excel file (.xlsx, .xls)

**Excel Columns Required:**
- Username
- Password
- College Code

**Success Response (200):**
```json
{
  "message": "Bulk upload completed: 5 successful, 0 duplicates, 0 errors",
  "results": {
    "total": 5,
    "successful": 5,
    "errors": [],
    "duplicates": 0
  }
}
```

### GET /upload/template/colleges
Download Excel template for colleges.

**Access:** Admin Only

**Response:** Excel file download

### GET /upload/template/users
Download Excel template for users.

**Access:** Admin Only

**Response:** Excel file download

---

## Report Endpoints

### GET /reports/filters
Get available filter options.

**Access:** Authenticated

**Success Response (200):**
```json
{
  "districts": ["Bangalore Urban", "Mysore", "Hassan"],
  "taluks": ["Bangalore North", "Mysore South"],
  "designations": ["Principal", "HOD", "Lecturer"],
  "groups": ["Technical Education", "Arts"],
  "branches": ["Computer Science", "Mechanical Engineering"],
  "collegeCodes": ["KPTMGL001", "KPTBLR001"]
}
```

### GET /reports/data
Get filtered report data.

**Access:** Authenticated

**Query Parameters:**
- `district` (string) - Filter by district
- `taluk` (string) - Filter by taluk
- `designation` (string) - Filter by designation
- `group` (string) - Filter by group
- `branch` (string) - Filter by branch
- `collegeCode` (string) - Filter by college code

**Example:** `/api/reports/data?district=Mysore&designation=Principal`

**Success Response (200):**
```json
{
  "colleges": [ ... ],
  "summary": {
    "totalColleges": 10,
    "totalSanctioned": 100,
    "totalWorking": 85,
    "totalVacant": 15,
    "totalDeputation": 5,
    "byDistrict": {
      "Mysore": {
        "colleges": 3,
        "sanctioned": 30,
        "working": 25,
        "vacant": 5,
        "deputation": 1
      }
    },
    "byDesignation": { ... }
  },
  "filters": { ... },
  "generatedAt": "2025-01-06T12:00:00.000Z"
}
```

### GET /reports/export/excel
Export report data as Excel.

**Access:** Authenticated

**Query Parameters:** Same as /reports/data

**Response:** Excel file download

### GET /reports/export/pdf
Export report data as PDF.

**Access:** Authenticated

**Query Parameters:** Same as /reports/data

**Response:** PDF file download

---

## Log Endpoints

### GET /logs
Get all update logs with pagination.

**Access:** Admin Only

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)
- `collegeCode` (string) - Filter by college
- `startDate` (ISO date string) - Filter from date
- `endDate` (ISO date string) - Filter to date

**Example:** `/api/logs?collegeCode=KPTMGL001&limit=100`

**Success Response (200):**
```json
{
  "logs": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "admin",
        "role": "admin"
      },
      "collegeCode": "KPTMGL001",
      "fieldChanged": "working",
      "oldValue": "5",
      "newValue": "6",
      "ipAddress": "192.168.1.1",
      "createdAt": "2025-01-06T12:00:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 234
}
```

### GET /logs/college/:collegeCode
Get logs for specific college.

**Access:** Authenticated (College users can only access their own)

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user": { ... },
    "collegeCode": "KPTMGL001",
    "fieldChanged": "working",
    "oldValue": "5",
    "newValue": "6",
    "createdAt": "2025-01-06T12:00:00.000Z"
  }
]
```

### GET /logs/recent/activity
Get recent activity logs (last 10).

**Access:** Admin Only

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "user": { ... },
    "collegeCode": "KPTMGL001",
    "fieldChanged": "working",
    "oldValue": "5",
    "newValue": "6",
    "createdAt": "2025-01-06T12:00:00.000Z"
  }
]
```

---

## Miscellaneous Endpoints

### GET /health
Health check endpoint.

**Access:** Public

**Success Response (200):**
```json
{
  "status": "OK",
  "message": "College Data System API is running",
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request - Invalid input |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

---

## Rate Limiting

- **General API endpoints:** 100 requests per 15 minutes per IP
- **Authentication endpoints:** 5 requests per 15 minutes per IP

When rate limited, you'll receive:
```json
{
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Best Practices

1. **Always check response status codes**
2. **Store JWT tokens securely** (not in localStorage for production)
3. **Handle token expiration** (tokens expire in 24 hours)
4. **Validate data before sending**
5. **Use pagination for large datasets**
6. **Implement proper error handling**
7. **Respect rate limits**
8. **Use HTTPS in production**

---

## Example Usage

### JavaScript/Axios Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend.vercel.app/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const login = async () => {
  try {
    const response = await api.post('/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = response.data.token;
    localStorage.setItem('token', token);
    
    // Set token for future requests
    api.defaults.headers.Authorization = `Bearer ${token}`;
    
    return response.data.user;
  } catch (error) {
    console.error('Login failed:', error.response?.data);
    throw error;
  }
};

// Get colleges
const getColleges = async () => {
  try {
    const response = await api.get('/colleges?limit=100');
    return response.data;
  } catch (error) {
    console.error('Error fetching colleges:', error.response?.data);
    throw error;
  }
};

// Update college
const updateCollege = async (collegeCode, data) => {
  try {
    const response = await api.put(`/colleges/${collegeCode}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating college:', error.response?.data);
    throw error;
  }
};
```

---

## Support

For API issues or questions:
- Create an issue on GitHub
- Check the main README.md
- Review DEPLOYMENT.md for setup help

---

**Last Updated:** January 6, 2025  
**Version:** 1.0.0
