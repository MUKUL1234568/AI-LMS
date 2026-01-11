import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';
import { CustomerData } from '../types';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const customerData: CustomerData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const signatureFile = files?.['signature']?.[0];
    const aadhaarImageFile = files?.['aadhaarImage']?.[0];
    const panImageFile = files?.['panImage']?.[0];

    // Validate required fields
    if (!customerData.name || !customerData.phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Check if customer with same phone exists in this company
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        companyId,
        phone: customerData.phone,
      },
    });

    if (existingCustomer) {
      return res.status(400).json({ error: 'Customer with this phone number already exists' });
    }

    // Save file paths
    const photoPath = photoFile ? `/uploads/photos/${photoFile.filename}` : null;
    const signaturePath = signatureFile ? `/uploads/signatures/${signatureFile.filename}` : null;
    const aadhaarImagePath = aadhaarImageFile ? `/uploads/aadhaar/${aadhaarImageFile.filename}` : null;
    const panImagePath = panImageFile ? `/uploads/pan/${panImageFile.filename}` : null;

    const customer = await prisma.customer.create({
      data: {
        ...customerData,
        photo: photoPath,
        signature: signaturePath,
        aadhaarImage: aadhaarImagePath,
        panImage: panImagePath,
        companyId,
      },
    });

    res.status(201).json(customer);
  } catch (error: any) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: error.message || 'Failed to create customer' });
  }
};

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const customers = await prisma.customer.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(customers);
  } catch (error: any) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const customer = await prisma.customer.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error: any) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch customer' });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    const updateData: Partial<CustomerData> = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const signatureFile = files?.['signature']?.[0];
    const aadhaarImageFile = files?.['aadhaarImage']?.[0];
    const panImageFile = files?.['panImage']?.[0];

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if customer exists and belongs to company
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // If phone is being updated, check for duplicates
    if (updateData.phone && updateData.phone !== existingCustomer.phone) {
      const duplicate = await prisma.customer.findFirst({
        where: {
          companyId,
          phone: updateData.phone,
        },
      });

      if (duplicate) {
        return res.status(400).json({ error: 'Customer with this phone number already exists' });
      }
    }

    // Handle file updates
    const photoPath = photoFile ? `/uploads/photos/${photoFile.filename}` : existingCustomer.photo;
    const signaturePath = signatureFile ? `/uploads/signatures/${signatureFile.filename}` : existingCustomer.signature;
    const aadhaarImagePath = aadhaarImageFile ? `/uploads/aadhaar/${aadhaarImageFile.filename}` : existingCustomer.aadhaarImage;
    const panImagePath = panImageFile ? `/uploads/pan/${panImageFile.filename}` : existingCustomer.panImage;

    // Delete old files if new ones are uploaded
    if (photoFile && existingCustomer.photo) {
      const oldPhotoPath = path.join(__dirname, '..', '..', existingCustomer.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    if (signatureFile && existingCustomer.signature) {
      const oldSignaturePath = path.join(__dirname, '..', '..', existingCustomer.signature);
      if (fs.existsSync(oldSignaturePath)) {
        fs.unlinkSync(oldSignaturePath);
      }
    }

    if (aadhaarImageFile && existingCustomer.aadhaarImage) {
      const oldAadhaarPath = path.join(__dirname, '..', '..', existingCustomer.aadhaarImage);
      if (fs.existsSync(oldAadhaarPath)) {
        fs.unlinkSync(oldAadhaarPath);
      }
    }

    if (panImageFile && existingCustomer.panImage) {
      const oldPanPath = path.join(__dirname, '..', '..', existingCustomer.panImage);
      if (fs.existsSync(oldPanPath)) {
        fs.unlinkSync(oldPanPath);
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...updateData,
        photo: photoPath,
        signature: signaturePath,
        aadhaarImage: aadhaarImagePath,
        panImage: panImagePath,
      },
    });

    res.json(customer);
  } catch (error: any) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: error.message || 'Failed to update customer' });
  }
};

export const updateInterestRate = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    const { monthlyInterestRate } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (monthlyInterestRate === undefined || monthlyInterestRate < 0) {
      return res.status(400).json({ error: 'Valid monthly interest rate is required' });
    }

    // Check if customer exists and belongs to company
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: {
        monthlyInterestRate: parseFloat(monthlyInterestRate),
        lastInterestDate: new Date(), // Reset interest calculation date when rate changes
      },
    });

    res.json(updatedCustomer);
  } catch (error: any) {
    console.error('Update interest rate error:', error);
    res.status(500).json({ error: error.message || 'Failed to update interest rate' });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    const { password } = req.body; // Get password from request body

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify password
    if (!password) {
      return res.status(400).json({ error: 'Admin password is required for deletion' });
    }

    // Get the current user (admin)
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Check if customer exists and belongs to company
    const customer = await prisma.customer.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Delete associated files
    if (customer.photo) {
      const photoPath = path.join(__dirname, '..', '..', customer.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    if (customer.signature) {
      const signaturePath = path.join(__dirname, '..', '..', customer.signature);
      if (fs.existsSync(signaturePath)) {
        fs.unlinkSync(signaturePath);
      }
    }

    if (customer.aadhaarImage) {
      const aadhaarPath = path.join(__dirname, '..', '..', customer.aadhaarImage);
      if (fs.existsSync(aadhaarPath)) {
        fs.unlinkSync(aadhaarPath);
      }
    }

    if (customer.panImage) {
      const panPath = path.join(__dirname, '..', '..', customer.panImage);
      if (fs.existsSync(panPath)) {
        fs.unlinkSync(panPath);
      }
    }

    await prisma.customer.delete({
      where: { id },
    });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete customer' });
  }
};

// Calculate daily interest
const calculateInterest = (
  principal: number,
  monthlyRate: number,
  lastInterestDate: Date
): number => {
  const now = new Date();
  const daysSinceLastCalc = Math.floor(
    (now.getTime() - lastInterestDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastCalc <= 0 || principal <= 0 || monthlyRate <= 0) {
    return 0;
  }
  
  // Daily rate = Monthly rate / 30
  const dailyRate = monthlyRate / 30;
  // Interest = Principal * Daily Rate * Days / 100
  const interest = (principal * dailyRate * daysSinceLastCalc) / 100;
  
  return Math.round(interest * 100) / 100; // Round to 2 decimal places
};

// Accumulate interest for all customers
export const accumulateInterestForAll = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all customers for the company
    const customers = await prisma.customer.findMany({
      where: { companyId },
    });

    const now = new Date();
    let updatedCount = 0;
    let totalInterestAccumulated = 0;

    // Update each customer's accumulated interest
    await prisma.$transaction(async (tx) => {
      for (const customer of customers) {
        // Calculate pending interest
        const newInterest = calculateInterest(
          customer.principalAmount,
          customer.monthlyInterestRate,
          customer.lastInterestDate
        );

        if (newInterest > 0) {
          await tx.customer.update({
            where: { id: customer.id },
            data: {
              accumulatedInterest: customer.accumulatedInterest + newInterest,
              lastInterestDate: now,
            },
          });
          updatedCount++;
          totalInterestAccumulated += newInterest;
        }
      }
    });

    res.json({
      message: `Interest accumulated for ${updatedCount} customer(s)`,
      updatedCount,
      totalInterestAccumulated,
    });
  } catch (error: any) {
    console.error('Accumulate interest for all error:', error);
    res.status(500).json({ error: error.message || 'Failed to accumulate interest' });
  }
};