# Money Lending System (LMS)

A comprehensive system for money lending companies to manage their operations including employee management, customer management, and loan tracking.

## Features

- **Company Registration**: Companies can register with an admin account
- **Employee Management**: Full CRUD operations for employees
- **Customer Management**: Full CRUD operations for customers with photo and signature upload
- **Loan Management**: Create and track loans for registered customers

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM with SQLite
- JWT Authentication
- Multer for file uploads

### Frontend
- React with TypeScript
- Vite
- React Router
- Axios

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
UPLOAD_DIR="./uploads"
```

4. Generate Prisma client and run migrations:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. Register a new company by clicking "Register Company" on the login page
2. The person who registers becomes the admin of that company
3. Log in with the admin credentials
4. Add employees, customers, and create loans through the dashboard

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new company
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info

### Employees
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer (with photo and signature)
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Create loan
- `GET /api/loans/:id` - Get loan by ID

## Notes

- All API endpoints (except auth) require authentication via JWT token
- Customer photos and signatures are stored in the `uploads` directory
- The database uses SQLite for simplicity (can be easily changed to PostgreSQL/MySQL)
