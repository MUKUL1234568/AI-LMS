import { Router } from 'express';
import {
  createInvestor,
  getInvestors,
  getInvestorById,
  updateInvestor,
  deleteInvestor,
  updateInterestRate,
  accumulateInterestForAll,
} from '../controllers/investor.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadCustomerFiles } from '../utils/upload';

export const investorRoutes = Router();

investorRoutes.use(authenticate);

investorRoutes.post(
  '/',
  uploadCustomerFiles.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'panImage', maxCount: 1 },
  ]),
  createInvestor
);

investorRoutes.get('/', getInvestors);
investorRoutes.get('/:id', getInvestorById);

investorRoutes.put(
  '/:id',
  uploadCustomerFiles.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'panImage', maxCount: 1 },
  ]),
  updateInvestor
);

investorRoutes.put('/:id/interest-rate', updateInterestRate);
investorRoutes.post('/accumulate-interest', accumulateInterestForAll);
investorRoutes.delete('/:id', deleteInvestor);
