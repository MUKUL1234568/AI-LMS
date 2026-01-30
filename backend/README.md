# Loan Management System - Backend

Node.js + Express backend for the LMS application with PostgreSQL database.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database and JWT credentials

3. Setup database:
   ```bash
   npm run migrate
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

Server will run on `http://localhost:5000`

## Project Structure

- `src/config/` - Database and configuration files
- `src/controllers/` - Request handlers
- `src/models/` - Database models
- `src/routes/` - API routes
- `src/middleware/` - Custom middleware
- `src/services/` - Business logic
- `src/validators/` - Input validation
- `src/utils/` - Helper functions
- `migrations/` - Database migrations
