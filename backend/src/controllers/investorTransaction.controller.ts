import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';

// Calculate daily interest
const calculateInterest = (
  principal: number,
  monthlyRate: number,
  lastInterestDate: Date,
  calculationDate: Date = new Date()
): number => {
  const now = calculationDate;
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

// Get investor with updated interest
export const getInvestorWithInterest = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const investor = await prisma.investor.findFirst({
      where: { id, companyId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Calculate current interest
    const newInterest = calculateInterest(
      investor.principalAmount,
      investor.monthlyInterestRate,
      investor.lastInterestDate
    );

    // Update accumulated interest if there's new interest
    if (newInterest > 0) {
      const updatedInvestor = await prisma.investor.update({
        where: { id },
        data: {
          accumulatedInterest: investor.accumulatedInterest + newInterest,
          lastInterestDate: new Date(),
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      return res.json(updatedInvestor);
    }

    res.json(investor);
  } catch (error: any) {
    console.error('Get investor with interest error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch investor' });
  }
};

// Take loan from investor (company receives money, we owe more)
export const takeLoan = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { investorId } = req.params;
    const { amount, interestRate, description, bankAccountId, date } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (!interestRate || interestRate < 0) {
      return res.status(400).json({ error: 'Interest rate must be 0 or greater' });
    }

    if (!bankAccountId) {
      return res.status(400).json({ error: 'Bank account is required' });
    }

    // Get investor
    const investor = await prisma.investor.findFirst({
      where: { id: investorId, companyId },
    });

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Get and validate bank account
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, companyId },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    // Calculate any pending interest first
    const pendingInterest = calculateInterest(
      investor.principalAmount,
      investor.monthlyInterestRate,
      investor.lastInterestDate
    );

    // New balances (we owe more)
    const newPrincipal = investor.principalAmount + amount;
    const newInterest = investor.accumulatedInterest + pendingInterest;
    const newBankBalance = bankAccount.balance + amount; // Company receives money

    const newInterestRate = interestRate;

    // Create transaction and update investor
    const result = await prisma.$transaction(async (tx) => {
      // Update investor
      const updatedInvestor = await tx.investor.update({
        where: { id: investorId },
        data: {
          principalAmount: newPrincipal,
          accumulatedInterest: newInterest,
          monthlyInterestRate: newInterestRate,
          lastInterestDate: date ? new Date(date) : new Date(),
        },
      });

      // Update bank account balance (deposit - company receives money)
      const updatedBankAccount = await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: newBankBalance },
      });

      // Create bank transaction (deposit - company receives money)
      await tx.bankTransaction.create({
        data: {
          type: 'DEPOSIT',
          amount,
          description: description || `Loan taken from investor ${investor.name}: ₹${amount}`,
          balanceAfter: newBankBalance,
          bankAccountId,
        },
      });

      // Create investor transaction record
      const transaction = await tx.investorTransaction.create({
        data: {
          type: 'LOAN_TAKEN',
          amount,
          interestRate: newInterestRate,
          description: description || `Loan taken: ₹${amount} at ${newInterestRate}% monthly`,
          principalAfter: newPrincipal,
          interestAfter: newInterest,
          investorId,
          companyId,
          bankAccountId,
          date: date ? new Date(date) : new Date(),
        },
      });

      return { investor: updatedInvestor, transaction, bankAccount: updatedBankAccount };
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Take loan error:', error);
    res.status(500).json({ error: error.message || 'Failed to take loan' });
  }
};

// Return loan to investor (company pays money, we owe less)
export const returnLoan = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { investorId } = req.params;
    const { amount, description, bankAccountId, date } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (!bankAccountId) {
      return res.status(400).json({ error: 'Bank account is required' });
    }

    // Get investor
    const investor = await prisma.investor.findFirst({
      where: { id: investorId, companyId },
    });

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Get and validate bank account
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: bankAccountId, companyId },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    if (bankAccount.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance in bank account' });
    }

    // Calculate any pending interest first
    const pendingInterest = calculateInterest(
      investor.principalAmount,
      investor.monthlyInterestRate,
      investor.lastInterestDate,
      date ? new Date(date) : new Date()
    );

    let currentInterest = investor.accumulatedInterest + pendingInterest;
    let currentPrincipal = investor.principalAmount;

    // Check if company has any amount owed to investor
    const totalOwed = currentPrincipal + currentInterest;
    if (totalOwed <= 0) {
      return res.status(400).json({ error: 'No amount owed to investor. Cannot return loan.' });
    }

    let remainingAmount = amount;

    // First subtract from interest (we pay interest first)
    if (currentInterest > 0 && remainingAmount > 0) {
      if (remainingAmount >= currentInterest) {
        remainingAmount -= currentInterest;
        currentInterest = 0;
      } else {
        currentInterest -= remainingAmount;
        remainingAmount = 0;
      }
    }

    // Then subtract from principal
    if (currentPrincipal > 0 && remainingAmount > 0) {
      if (remainingAmount >= currentPrincipal) {
        remainingAmount -= currentPrincipal;
        currentPrincipal = 0;
      } else {
        currentPrincipal -= remainingAmount;
        remainingAmount = 0;
      }
    }

    const newBankBalance = bankAccount.balance - amount; // Company pays money

    // Create transaction and update investor
    const result = await prisma.$transaction(async (tx) => {
      // Update investor
      const updatedInvestor = await tx.investor.update({
        where: { id: investorId },
        data: {
          principalAmount: currentPrincipal,
          accumulatedInterest: currentInterest,
          lastInterestDate: date ? new Date(date) : new Date(),
        },
      });

      // Update bank account balance (withdraw - company pays money)
      const updatedBankAccount = await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: newBankBalance },
      });

      // Create bank transaction (withdraw - company pays money)
      await tx.bankTransaction.create({
        data: {
          type: 'WITHDRAW',
          amount,
          description: description || `Loan returned to investor ${investor.name}: ₹${amount}`,
          balanceAfter: newBankBalance,
          bankAccountId,
        },
      });

      // Create investor transaction record
      const transaction = await tx.investorTransaction.create({
        data: {
          type: 'LOAN_RETURN',
          amount,
          description: description || `Loan returned: ₹${amount}`,
          principalAfter: currentPrincipal,
          interestAfter: currentInterest,
          investorId,
          companyId,
          bankAccountId,
          date: date ? new Date(date) : new Date(),
        },
      });

      return { investor: updatedInvestor, transaction, bankAccount: updatedBankAccount };
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Return loan error:', error);
    res.status(500).json({ error: error.message || 'Failed to return loan' });
  }
};

// Add accumulated interest to principal
export const addInterestToPrincipal = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { investorId } = req.params;
    const { date } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get investor
    const investor = await prisma.investor.findFirst({
      where: { id: investorId, companyId },
    });

    if (!investor) {
      return res.status(404).json({ error: 'Investor not found' });
    }

    // Calculate any pending interest first
    const pendingInterest = calculateInterest(
      investor.principalAmount,
      investor.monthlyInterestRate,
      investor.lastInterestDate
    );

    const totalInterest = investor.accumulatedInterest + pendingInterest;

    if (totalInterest <= 0) {
      return res.status(400).json({ error: 'No interest to add to principal' });
    }

    // New principal = old principal + all accumulated interest
    const newPrincipal = investor.principalAmount + totalInterest;

    // Create transaction and update investor
    const result = await prisma.$transaction(async (tx) => {
      // Update investor
      const updatedInvestor = await tx.investor.update({
        where: { id: investorId },
        data: {
          principalAmount: newPrincipal,
          accumulatedInterest: 0,
          lastInterestDate: date ? new Date(date) : new Date(),
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Create transaction record
      const transaction = await tx.investorTransaction.create({
        data: {
          type: 'INTEREST_ADD',
          amount: totalInterest,
          description: `Interest ₹${totalInterest.toFixed(2)} added to principal`,
          principalAfter: newPrincipal,
          interestAfter: 0,
          investorId,
          companyId,
          date: date ? new Date(date) : new Date(),
        },
      });

      return { investor: updatedInvestor, transaction };
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Add interest to principal error:', error);
    res.status(500).json({ error: error.message || 'Failed to add interest to principal' });
  }
};
