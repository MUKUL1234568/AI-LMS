import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';
import { InvestorData } from '../types';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export const createInvestor = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const investorData: InvestorData = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const signatureFile = files?.['signature']?.[0];
    const aadhaarImageFile = files?.['aadhaarImage']?.[0];
    const panImageFile = files?.['panImage']?.[0];

    // Validate required fields
    if (!investorData.name || !investorData.phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Check if investor with same phone exists in this company
    const existingInvestor = await prisma.investor.findFirst({
      where: {
        companyId,
        phone: investorData.phone,
      },
    });

    if (existingInvestor) {
      return res.status(400).json({ error: 'Investor with this phone number already exists' });
    }

    // Save file paths
    const photoPath = photoFile ? `/uploads/photos/${photoFile.filename}` : null;
    const signaturePath = signatureFile ? `/uploads/signatures/${signatureFile.filename}` : null;
    const aadhaarImagePath = aadhaarImageFile ? `/uploads/aadhaar/${aadhaarImageFile.filename}` : null;
    const panImagePath = panImageFile ? `/uploads/pan/${panImageFile.filename}` : null;

    const investor = await prisma.investor.create({
      data: {
        ...investorData,
        photo: photoPath,
        signature: signaturePath,
        aadhaarImage: aadhaarImagePath,
        panImage: panImagePath,
        companyId,
      },
    });

    res.status(201).json(investor);
  } catch (error: any) {
    console.error('Create investor error:', error);
    res.status(500).json({ error: error.message || 'Failed to create investor' });
  }
};

export const getInvestors = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const investors = await prisma.investor.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(investors);
  } catch (error: any) {
    console.error('Get investors error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch investors' });
  }
};

export const getInvestorById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const investor = await prisma.investor.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    res.json(investor);
  } catch (error: any) {
    console.error('Get investor error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch investor' });
  }
};

export const updateInvestor = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    const updateData: Partial<InvestorData> = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const photoFile = files?.['photo']?.[0];
    const signatureFile = files?.['signature']?.[0];
    const aadhaarImageFile = files?.['aadhaarImage']?.[0];
    const panImageFile = files?.['panImage']?.[0];

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if investor exists and belongs to company
    const existingInvestor = await prisma.investor.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!existingInvestor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // If phone is being updated, check for duplicates
    if (updateData.phone && updateData.phone !== existingInvestor.phone) {
      const duplicate = await prisma.investor.findFirst({
        where: {
          companyId,
          phone: updateData.phone,
        },
      });

      if (duplicate) {
        return res.status(400).json({ error: 'Investor with this phone number already exists' });
      }
    }

    // Handle file updates
    const photoPath = photoFile ? `/uploads/photos/${photoFile.filename}` : existingInvestor.photo;
    const signaturePath = signatureFile ? `/uploads/signatures/${signatureFile.filename}` : existingInvestor.signature;
    const aadhaarImagePath = aadhaarImageFile ? `/uploads/aadhaar/${aadhaarImageFile.filename}` : existingInvestor.aadhaarImage;
    const panImagePath = panImageFile ? `/uploads/pan/${panImageFile.filename}` : existingInvestor.panImage;

    // Delete old files if new ones are uploaded
    if (photoFile && existingInvestor.photo) {
      const oldPhotoPath = path.join(__dirname, '..', '..', existingInvestor.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    if (signatureFile && existingInvestor.signature) {
      const oldSignaturePath = path.join(__dirname, '..', '..', existingInvestor.signature);
      if (fs.existsSync(oldSignaturePath)) {
        fs.unlinkSync(oldSignaturePath);
      }
    }

    if (aadhaarImageFile && existingInvestor.aadhaarImage) {
      const oldAadhaarPath = path.join(__dirname, '..', '..', existingInvestor.aadhaarImage);
      if (fs.existsSync(oldAadhaarPath)) {
        fs.unlinkSync(oldAadhaarPath);
      }
    }

    if (panImageFile && existingInvestor.panImage) {
      const oldPanPath = path.join(__dirname, '..', '..', existingInvestor.panImage);
      if (fs.existsSync(oldPanPath)) {
        fs.unlinkSync(oldPanPath);
      }
    }

    const investor = await prisma.investor.update({
      where: { id },
      data: {
        ...updateData,
        photo: photoPath,
        signature: signaturePath,
        aadhaarImage: aadhaarImagePath,
        panImage: panImagePath,
      },
    });

    res.json(investor);
  } catch (error: any) {
    console.error('Update investor error:', error);
    res.status(500).json({ error: error.message || 'Failed to update investor' });
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

    // Check if investor exists and belongs to company
    const investor = await prisma.investor.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    const updatedInvestor = await prisma.investor.update({
      where: { id },
      data: {
        monthlyInterestRate: parseFloat(monthlyInterestRate),
        lastInterestDate: new Date(),
      },
    });

    res.json(updatedInvestor);
  } catch (error: any) {
    console.error('Update interest rate error:', error);
    res.status(500).json({ error: error.message || 'Failed to update interest rate' });
  }
};

export const deleteInvestor = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    const { password } = req.body;

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

    // Check if investor exists and belongs to company
    const investor = await prisma.investor.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Delete associated files
    if (investor.photo) {
      const photoPath = path.join(__dirname, '..', '..', investor.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    if (investor.signature) {
      const signaturePath = path.join(__dirname, '..', '..', investor.signature);
      if (fs.existsSync(signaturePath)) {
        fs.unlinkSync(signaturePath);
      }
    }

    if (investor.aadhaarImage) {
      const aadhaarPath = path.join(__dirname, '..', '..', investor.aadhaarImage);
      if (fs.existsSync(aadhaarPath)) {
        fs.unlinkSync(aadhaarPath);
      }
    }

    if (investor.panImage) {
      const panPath = path.join(__dirname, '..', '..', investor.panImage);
      if (fs.existsSync(panPath)) {
        fs.unlinkSync(panPath);
      }
    }

    await prisma.investor.delete({
      where: { id },
    });

    res.json({ message: 'Investor deleted successfully' });
  } catch (error: any) {
    console.error('Delete investor error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete investor' });
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

// Accumulate interest for all investors
export const accumulateInterestForAll = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get all investors for the company
    const investors = await prisma.investor.findMany({
      where: { companyId },
    });

    const now = new Date();
    let updatedCount = 0;
    let totalInterestAccumulated = 0;

    // Update each investor's accumulated interest
    await prisma.$transaction(async (tx) => {
      for (const investor of investors) {
        // Calculate pending interest
        const newInterest = calculateInterest(
          investor.principalAmount,
          investor.monthlyInterestRate,
          investor.lastInterestDate
        );

        if (newInterest > 0) {
          await tx.investor.update({
            where: { id: investor.id },
            data: {
              accumulatedInterest: investor.accumulatedInterest + newInterest,
              lastInterestDate: now,
            },
          });
          updatedCount++;
          totalInterestAccumulated += newInterest;
        }
      }
    });

    res.json({
      message: `Interest accumulated for ${updatedCount} investor(s)`,
      updatedCount,
      totalInterestAccumulated,
    });
  } catch (error: any) {
    console.error('Accumulate interest for all investors error:', error);
    res.status(500).json({ error: error.message || 'Failed to accumulate interest' });
  }
};
