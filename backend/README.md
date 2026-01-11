# Money Lending System - Backend

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following content:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
UPLOAD_DIR="./uploads"
```

3. Generate Prisma client:
```bash
npm run prisma:generate
```

4. Run database migrations:
```bash
npm run prisma:migrate
```

5. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new company (admin)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user info

### Company
- `GET /api/company/profile` - Get company profile

### Employees
- `POST /api/employees` - Create employee
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Customers
- `POST /api/customers` - Create customer (with photo and signature upload)
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer (with optional photo/signature upload)
- `DELETE /api/customers/:id` - Delete customer

### Loans
- `POST /api/loans` - Create loan
- `GET /api/loans` - Get all loans
- `GET /api/loans/:id` - Get loan by ID
