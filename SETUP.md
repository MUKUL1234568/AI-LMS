# Setup Guide - Money Lending System

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy the content below)
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="your-secret-key-change-this-in-production"
# JWT_EXPIRES_IN="7d"
# PORT=5000
# UPLOAD_DIR="./uploads"

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start the server
npm run dev
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## First Steps

1. Open `http://localhost:3000` in your browser
2. Click "Register Company" to create a new company
3. Fill in the company and admin information
4. You will be automatically logged in as the admin
5. Start adding employees and customers

## Features Implemented

✅ Company registration with admin user creation
✅ Admin login/logout
✅ Employee CRUD operations
✅ Customer CRUD operations with photo and signature upload
✅ Loan creation for registered customers
✅ Dashboard with statistics
✅ Protected routes (authentication required)

## File Structure

```
backend/
  src/
    controllers/    # Business logic
    routes/         # API routes
    middlewares/    # Authentication middleware
    models/         # (Not used - using Prisma)
    types/          # TypeScript types
    utils/          # Utility functions (file upload)
    config/         # Database configuration
  prisma/
    schema.prisma   # Database schema

frontend/
  src/
    components/     # React components
    services/       # API service functions
    types/          # TypeScript types
    utils/          # Utility functions
```

## Important Notes

- The database uses SQLite (dev.db file)
- Uploaded files (photos/signatures) are stored in `backend/uploads/`
- JWT tokens are stored in localStorage
- All API endpoints (except auth) require authentication

## Troubleshooting

1. **Database errors**: Make sure you ran `npm run prisma:migrate`
2. **File upload errors**: Ensure the `uploads` directory exists in the backend folder
3. **CORS errors**: Make sure backend is running on port 5000 and frontend on port 3000
4. **Authentication errors**: Clear localStorage and login again
