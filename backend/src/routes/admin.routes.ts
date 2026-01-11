import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
    getAdminData,
    updateAdminProfile,
    updateCompanyProfile,
    changePassword
} from '../controllers/admin.controller';

export const adminRoutes = Router();

adminRoutes.get('/', authenticate, getAdminData);
adminRoutes.put('/profile', authenticate, updateAdminProfile);
adminRoutes.put('/company', authenticate, updateCompanyProfile);
adminRoutes.put('/change-password', authenticate, changePassword);
