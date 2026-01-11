import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { companyRoutes } from './routes/company.routes';
import { employeeRoutes } from './routes/employee.routes';
import { customerRoutes } from './routes/customer.routes';
import { investorRoutes } from './routes/investor.routes';
import { authRoutes } from './routes/auth.routes';
import { transactionRoutes } from './routes/transaction.routes';
import { investorTransactionRoutes } from './routes/investorTransaction.routes';
import { bankRoutes } from './routes/bank.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads/photos', express.static(path.join(__dirname, '../uploads/photos')));
app.use('/uploads/signatures', express.static(path.join(__dirname, '../uploads/signatures')));
app.use('/uploads/aadhaar', express.static(path.join(__dirname, '../uploads/aadhaar')));
app.use('/uploads/pan', express.static(path.join(__dirname, '../uploads/pan')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/investor-transactions', investorTransactionRoutes);
app.use('/api/banks', bankRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
