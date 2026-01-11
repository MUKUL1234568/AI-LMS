import { Router } from 'express';
import {
  getCustomerWithInterest,
  giveLoan,
  receiveDeposit,
  addInterestToPrincipal,
  getTransactions,
} from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const transactionRoutes = Router();

transactionRoutes.use(authenticate);

// Get customer with updated interest calculation
transactionRoutes.get('/customer/:id', getCustomerWithInterest);

// Get all transactions for a customer
transactionRoutes.get('/customer/:customerId/transactions', getTransactions);

// Give loan to customer
transactionRoutes.post('/customer/:customerId/loan', giveLoan);

// Receive deposit from customer
transactionRoutes.post('/customer/:customerId/deposit', receiveDeposit);

// Add accumulated interest to principal
transactionRoutes.post('/customer/:customerId/add-interest', addInterestToPrincipal);
