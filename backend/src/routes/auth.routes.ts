import { Router } from 'express';
import { registerCompany, login, getCurrentUser } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

export const authRoutes = Router();

authRoutes.post('/register', registerCompany);
authRoutes.post('/login', login);
authRoutes.get('/me', authenticate, getCurrentUser);
