import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';

// Calculate daily interest and update customer
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

// Get customer with updated interest
export const getCustomerWithInterest = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const customer = await prisma.customer.findFirst({
      where: { id, companyId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate current interest
    const newInterest = calculateInterest(
      customer.principalAmount,
      customer.monthlyInterestRate,
      customer.lastInterestDate
    );

    // Update accumulated interest if there's new interest
    if (newInterest > 0) {
      const updatedCustomer = await prisma.customer.update({
        where: { id },
        data: {
          accumulatedInterest: customer.accumulatedInterest + newInterest,
          lastInterestDate: new Date(),
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
      return res.json(updatedCustomer);
    }

    res.json(customer);
  } catch (error: any) {
    console.error('Get customer with interest error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch customer' });
  }
};

// Give loan to customer
export const giveLoan = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { customerId } = req.params;
    const { amount, interestRate, description, bankAccountId } = req.body;

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

    // Get customer
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
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
      customer.principalAmount,
      customer.monthlyInterestRate,
      customer.lastInterestDate
    );

    // New balances
    const newPrincipal = customer.principalAmount + amount;
    const newInterest = customer.accumulatedInterest + pendingInterest;
    const newBankBalance = bankAccount.balance - amount;
    
    // Use the new interest rate or keep the old one if this is an additional loan
    // We'll use the new rate as the current active rate
    const newInterestRate = interestRate;

    // Create transaction and update customer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update customer
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          principalAmount: newPrincipal,
          accumulatedInterest: newInterest,
          monthlyInterestRate: newInterestRate,
          lastInterestDate: new Date(),
        },
      });

      // Update bank account balance
      const updatedBankAccount = await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: newBankBalance },
      });

      // Create bank transaction (withdrawal)
      await tx.bankTransaction.create({
        data: {
          type: 'WITHDRAW',
          amount,
          description: description || `Loan given to customer ${customer.name}: ₹${amount}`,
          balanceAfter: newBankBalance,
          bankAccountId,
        },
      });

      // Create customer transaction record
      const transaction = await tx.transaction.create({
        data: {
          type: 'LOAN',
          amount,
          interestRate: newInterestRate,
          description: description || `Loan given: ₹${amount} at ${newInterestRate}% monthly`,
          principalAfter: newPrincipal,
          interestAfter: newInterest,
          customerId,
          companyId,
          bankAccountId,
        },
      });

      return { customer: updatedCustomer, transaction, bankAccount: updatedBankAccount };
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Give loan error:', error);
    res.status(500).json({ error: error.message || 'Failed to give loan' });
  }
};

// Receive deposit from customer
export const receiveDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { customerId } = req.params;
    const { amount, description, bankAccountId } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (!bankAccountId) {
      return res.status(400).json({ error: 'Bank account is required' });
    }

    // Get customer
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
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
      customer.principalAmount,
      customer.monthlyInterestRate,
      customer.lastInterestDate
    );

    let currentInterest = customer.accumulatedInterest + pendingInterest;
    let currentPrincipal = customer.principalAmount;
    
    // Check if customer has any amount due
    const totalDue = currentPrincipal + currentInterest;
    if (totalDue <= 0) {
      return res.status(400).json({ error: 'Customer has no amount due. Cannot receive deposit.' });
    }
    
    let remainingAmount = amount;

    // First subtract from interest
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

    const newBankBalance = bankAccount.balance + amount;

    // Create transaction and update customer
    const result = await prisma.$transaction(async (tx) => {
      // Update customer
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          principalAmount: currentPrincipal,
          accumulatedInterest: currentInterest,
          lastInterestDate: new Date(),
        },
      });

      // Update bank account balance
      const updatedBankAccount = await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: { balance: newBankBalance },
      });

      // Create bank transaction (deposit)
      await tx.bankTransaction.create({
        data: {
          type: 'DEPOSIT',
          amount,
          description: description || `Deposit received from customer ${customer.name}: ₹${amount}`,
          balanceAfter: newBankBalance,
          bankAccountId,
        },
      });

      // Create customer transaction record
      const transaction = await tx.transaction.create({
        data: {
          type: 'DEPOSIT',
          amount,
          description: description || `Deposit received: ₹${amount}`,
          principalAfter: currentPrincipal,
          interestAfter: currentInterest,
          customerId,
          companyId,
          bankAccountId,
        },
      });

      return { customer: updatedCustomer, transaction, bankAccount: updatedBankAccount };
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Receive deposit error:', error);
    res.status(500).json({ error: error.message || 'Failed to receive deposit' });
  }
};

// Add accumulated interest to principal
export const addInterestToPrincipal = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { customerId } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get customer
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, companyId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Calculate any pending interest first
    const pendingInterest = calculateInterest(
      customer.principalAmount,
      customer.monthlyInterestRate,
      customer.lastInterestDate
    );

    const totalInterest = customer.accumulatedInterest + pendingInterest;

    if (totalInterest <= 0) {
      return res.status(400).json({ error: 'No interest to add to principal' });
    }

    // New principal = old principal + all accumulated interest
    const newPrincipal = customer.principalAmount + totalInterest;

    // Create transaction and update customer
    const result = await prisma.$transaction(async (tx) => {
      // Update customer
      const updatedCustomer = await tx.customer.update({
        where: { id: customerId },
        data: {
          principalAmount: newPrincipal,
          accumulatedInterest: 0, // Reset interest
          lastInterestDate: new Date(),
        },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          type: 'INTEREST_ADD',
          amount: totalInterest,
          description: `Interest ₹${totalInterest.toFixed(2)} added to principal`,
          principalAfter: newPrincipal,
          interestAfter: 0,
          customerId,
          companyId,
        },
      });

      return { customer: updatedCustomer, transaction };
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Add interest to principal error:', error);
    res.status(500).json({ error: error.message || 'Failed to add interest to principal' });
  }
};

// Get all transactions for a customer
export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { customerId } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { customerId, companyId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(transactions);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
  }
};
