import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';

export const companyRoutes = Router();

// Company routes can be added here if needed
// For now, company registration is handled in auth routes

companyRoutes.get('/profile', authenticate, async (req: any, res) => {
  try {
    const { prisma } = await import('../config/database');
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    });

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(company);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch company' });
  }
});
