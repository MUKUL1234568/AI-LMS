import { Router } from 'express';
import {
  getInvestorWithInterest,
  takeLoan,
  returnLoan,
  addInterestToPrincipal,
} from '../controllers/investorTransaction.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const investorTransactionRoutes = Router();

investorTransactionRoutes.use(authenticate);

investorTransactionRoutes.get('/investors/:id/with-interest', getInvestorWithInterest);
investorTransactionRoutes.post('/investors/:investorId/take-loan', takeLoan);
investorTransactionRoutes.post('/investors/:investorId/return-loan', returnLoan);
investorTransactionRoutes.post('/investors/:investorId/add-interest-to-principal', addInterestToPrincipal);
