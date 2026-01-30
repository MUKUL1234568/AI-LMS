# Loan Management System (LMS)

A professional full-stack loan management platform for money lending companies, built with Node.js, Express, React, and PostgreSQL.

## Overview

The Loan Management System is a web-based platform designed specifically for money lending companies. It enables:

- **Company Admins** to register, manage their company, and add/manage employees
- **Employees** to access their profile and view company information with limited permissions
- **JWT-based authentication** for secure access
- **Role-based access control** for different user types

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend** | Node.js, Express.js | 18.x, 4.18+ |
| **Frontend** | React | 18.2+ |
| **Database** | PostgreSQL | 12+ |
| **Authentication** | JWT (JSON Web Tokens) | 9.0.0+ |
| **Password Hashing** | bcryptjs | 2.4.3+ |
| **Validation** | Joi | 17.11+ |
| **HTTP Client** | Axios | 1.6+ |
| **Styling** | CSS3 | - |

---

## Project Structure

```
LMS/
├── backend/                    # Node.js + Express API Server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # PostgreSQL connection pool
│   │   ├── controllers/
│   │   │   ├── companyAuthController.js      # Company registration & login
│   │   │   ├── employeeAuthController.js     # Employee login
│   │   │   └── employeeManagementController.js # Add/manage employees
│   │   ├── models/
│   │   │   ├── Company.js      # Company database operations
│   │   │   └── Employee.js     # Employee database operations
│   │   ├── routes/
│   │   │   ├── companyRoutes.js             # /api/company/*
│   │   │   ├── employeeAuthRoutes.js        # /api/employee/auth/*
│   │   │   └── employeeManagementRoutes.js  # /api/employees/*
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verification & role checking
│   │   ├── utils/              # Helper functions (for future use)
│   │   ├── validators/         # Input validation (for future use)
│   │   └── index.js            # Express app entry point
│   ├── migrations/
│   │   └── 001_create_tables.sql # Database schema
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── frontend/                   # React Web Application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.js                      # Landing page
│   │   │   ├── CompanyRegister.js           # Company registration form
│   │   │   ├── CompanyLogin.js              # Company admin login
│   │   │   ├── EmployeeLogin.js             # Employee login
│   │   │   ├── AdminDashboard.js            # Company admin dashboard
│   │   │   └── EmployeeDashboard.js         # Employee profile view
│   │   ├── components/                      # Reusable components (for future)
│   │   ├── services/
│   │   │   └── api.js          # Axios instance with JWT token handling
│   │   ├── hooks/              # Custom React hooks (for future)
│   │   ├── context/            # Context API state (for future)
│   │   ├── styles/
│   │   │   ├── Home.css        # Landing page styles
│   │   │   ├── Auth.css        # Login/register styles
│   │   │   ├── Dashboard.css   # Dashboard styles
│   │   │   ├── App.css         # Global styles
│   │   │   └── index.css       # Base styles
│   │   ├── App.js              # Main app with routing
│   │   └── index.js            # React entry point
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── README.md                   # This file
├── QUICKSTART.md               # Quick setup guide
├── SETUP_AND_TESTING.md        # Detailed setup & testing
├── API_DOCUMENTATION.md        # Complete API reference
├── USER_GUIDE.md               # User manual
└── .gitignore
```

---

## Quick Start (5 minutes)

### Prerequisites
- Node.js v14+ ([Download](https://nodejs.org/))
- PostgreSQL v12+ ([Download](https://www.postgresql.org/))

### Step 1: Database Setup
```bash
psql -U postgres
CREATE DATABASE lms_db;
\q
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with database credentials
psql -U postgres -d lms_db -f migrations/001_create_tables.sql
npm run dev
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm start
```

Visit **http://localhost:3000** and start using the platform!

---

## Features Implemented

### ✅ Company Management
- Register new lending company with details
- Secure admin login with JWT authentication
- View company profile with employee count
- Password hashing with bcrypt

### ✅ Employee Management
- Add employees with comprehensive details
- Manage employee information (edit, deactivate)
- Pagination support for employee lists
- Employee data isolation per company

### ✅ Authentication & Security
- JWT-based authentication (7-day expiration)
- Role-based access control (admin vs employee)
- Password hashing with bcryptjs
- Protected API endpoints
- Automatic token handling in requests

### ✅ Employee Features
- Employee login with company ID
- View personal profile
- Company isolation (employees only see their own data)
- Limited access scope

### ✅ User Interface
- Responsive design with CSS Grid/Flexbox
- Intuitive navigation
- Form validation
- Error handling and user feedback
- Professional styling with gradient design

---

## API Endpoints

### Company Endpoints
```
POST   /api/company/register      # Register new company
POST   /api/company/login         # Login as company admin
GET    /api/company/profile       # Get company profile (admin only)
```

### Employee Management Endpoints
```
POST   /api/employees             # Add new employee (admin only)
GET    /api/employees             # Get all employees (admin only)
GET    /api/employees/:id         # Get employee details (admin only)
PUT    /api/employees/:id         # Update employee (admin only)
DELETE /api/employees/:id         # Deactivate employee (admin only)
```

### Employee Auth Endpoints
```
POST   /api/employee/auth/login   # Employee login
GET    /api/employee/auth/profile # Get employee profile (employee only)
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

---

## Database Schema

### Companies Table
```sql
- id (PRIMARY KEY)
- name (UNIQUE)
- email (UNIQUE)
- phone
- address
- city, state, zip_code
- registration_number (UNIQUE)
- password_hash
- is_active
- created_at, updated_at
```

### Employees Table
```sql
- id (PRIMARY KEY)
- company_id (FOREIGN KEY)
- first_name, last_name
- email
- phone
- employee_id_number
- position, department
- password_hash
- salary
- is_active
- hired_date
- created_at, updated_at
```

---

## Development Workflow

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000 with auto-reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Runs on http://localhost:3000 with hot-reload
```

### Testing

See [SETUP_AND_TESTING.md](./SETUP_AND_TESTING.md) for:
- Step-by-step testing guide
- API testing with curl
- Database verification
- Troubleshooting common issues

---

## Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](./QUICKSTART.md) | 5-minute setup guide |
| [SETUP_AND_TESTING.md](./SETUP_AND_TESTING.md) | Detailed setup, configuration & testing |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference with examples |
| [USER_GUIDE.md](./USER_GUIDE.md) | User manual & feature guide |

---

## Configuration

### Environment Variables

**Backend (.env)**
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=lms_db
JWT_SECRET=your_strong_secret_key
JWT_EXPIRE=7d
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

---

## Key Features

### For Company Admins
- ✅ Register company with full details
- ✅ Secure JWT-based login
- ✅ Add unlimited employees
- ✅ Manage employee information
- ✅ View company statistics
- ✅ Deactivate/remove employees

### For Employees
- ✅ Login with company ID and credentials
- ✅ View personal profile and details
- ✅ Limited access to company features
- ✅ Secure token-based authentication

### Security Features
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Company data isolation
- ✅ Protected API endpoints
- ✅ Secure token storage

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Common Issues & Solutions

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
✅ Solution: Start PostgreSQL service
- Windows: Check Services
- Mac: `brew services start postgresql`
- Linux: `sudo service postgresql start`

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
✅ Solution: Kill process or change port in .env

### npm install fails
✅ Solution:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

See [SETUP_AND_TESTING.md](./SETUP_AND_TESTING.md) for more troubleshooting.

---

## Future Enhancements

- [ ] Password reset functionality
- [ ] Loan application management
- [ ] Payment tracking system
- [ ] Interest calculation engine
- [ ] Reports and analytics dashboard
- [ ] Email notifications
- [ ] Two-factor authentication
- [ ] Admin activity logs
- [ ] Advanced filtering and search
- [ ] Data export capabilities

---

## Project Statistics

| Metric | Value |
|--------|-------|
| Backend Routes | 10 |
| Frontend Pages | 6 |
| Database Tables | 2 |
| API Endpoints | 10 |
| Controllers | 3 |
| Models | 2 |

---

## Git Setup

```bash
# Initialize git repository (if not already done)
git init

# Add files
git add .

# Initial commit
git commit -m "Initial project setup with company and employee management"

# Add remote (if pushing to GitHub)
git remote add origin https://github.com/yourusername/lms.git
git branch -M main
git push -u origin main
```

---

## License

This project is provided as-is for educational and commercial use.

---

## Support & Contact

For issues, questions, or feature requests:
- Review the [USER_GUIDE.md](./USER_GUIDE.md) for common questions
- Check [SETUP_AND_TESTING.md](./SETUP_AND_TESTING.md) for troubleshooting
- Consult [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for API details

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Company registration and authentication
- ✅ Employee management system
- ✅ Employee login and profile
- ✅ JWT-based security
- ✅ Responsive UI
- ✅ API documentation
- ✅ User guide

---

**Happy lending! 🚀**

*Last Updated: January 2025*
