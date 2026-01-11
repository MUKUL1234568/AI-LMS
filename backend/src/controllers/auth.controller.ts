import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { CompanyRegistrationData } from '../types';

export const registerCompany = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      adminName,
      adminPhone,
    }: CompanyRegistrationData = req.body;

    // Validate required fields
    if (!name || !email || !password || !adminName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email },
    });

    if (existingCompany) {
      return res.status(400).json({ error: 'Company with this email already exists' });
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create admin user
      const admin = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: adminName,
          phone: adminPhone,
          role: 'ADMIN',
        },
      });

      // Create company with admin
      const company = await tx.company.create({
        data: {
          name,
          email,
          phone,
          address,
          adminId: admin.id,
        },
      });

      // Update user with companyId
      await tx.user.update({
        where: { id: admin.id },
        data: { companyId: company.id },
      });

      return { company, admin };
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: result.admin.id,
        companyId: result.company.id,
        role: 'ADMIN',
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Company registered successfully',
      token,
      company: {
        id: result.company.id,
        name: result.company.name,
        email: result.company.email,
      },
      user: {
        id: result.admin.id,
        name: result.admin.name,
        email: result.admin.email,
        role: result.admin.role,
      },
    });
  } catch (error: any) {
    console.error('Company registration error:', error);
    res.status(500).json({ error: error.message || 'Failed to register company' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.companyId) {
      return res.status(401).json({ error: 'User is not associated with any company' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
      company: user.company ? {
        id: user.company.id,
        name: user.company.name,
        email: user.company.email,
      } : null,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Failed to login' });
  }
};

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { company: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        companyId: true,
        company: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: error.message || 'Failed to get user' });
  }
};
