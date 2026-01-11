import { Router } from 'express';
import {
  createBankAccount,
  getBankAccounts,
  getBankAccountById,
  updateBankAccount,
  deleteBankAccount,
  depositMoney,
  withdrawMoney,
  transferMoney,
} from '../controllers/bank.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const bankRoutes = Router();

bankRoutes.use(authenticate);

// CRUD operations
bankRoutes.post('/', createBankAccount);
bankRoutes.get('/', getBankAccounts);
bankRoutes.get('/:id', getBankAccountById);
bankRoutes.put('/:id', updateBankAccount);
bankRoutes.delete('/:id', deleteBankAccount);

// Transactions
bankRoutes.post('/:id/deposit', depositMoney);
bankRoutes.post('/:id/withdraw', withdrawMoney);
bankRoutes.post('/transfer', transferMoney);
