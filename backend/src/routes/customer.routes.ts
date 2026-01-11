import { Router } from 'express';
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  updateInterestRate,
  accumulateInterestForAll,
} from '../controllers/customer.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadCustomerFiles } from '../utils/upload';

export const customerRoutes = Router();

customerRoutes.use(authenticate);

customerRoutes.post(
  '/',
  uploadCustomerFiles.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'panImage', maxCount: 1 },
  ]),
  createCustomer
);

customerRoutes.get('/', getCustomers);
customerRoutes.get('/:id', getCustomerById);

customerRoutes.put(
  '/:id',
  uploadCustomerFiles.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'aadhaarImage', maxCount: 1 },
    { name: 'panImage', maxCount: 1 },
  ]),
  updateCustomer
);

customerRoutes.put('/:id/interest-rate', updateInterestRate);
customerRoutes.post('/accumulate-interest', accumulateInterestForAll);

customerRoutes.delete('/:id', deleteCustomer);
