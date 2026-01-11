import { Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../types';

// Create a new bank account
export const createBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { bankName, accountNumber, ownerName, initialBalance } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!bankName || !ownerName) {
      return res.status(400).json({ error: 'Bank name and owner name are required' });
    }

    const bankAccount = await prisma.bankAccount.create({
      data: {
        bankName,
        accountNumber: accountNumber || null,
        ownerName,
        balance: initialBalance || 0,
        companyId,
      },
    });

    // If there's an initial balance, create a deposit transaction
    if (initialBalance && initialBalance > 0) {
      await prisma.bankTransaction.create({
        data: {
          type: 'DEPOSIT',
          amount: initialBalance,
          description: 'Initial deposit',
          balanceAfter: initialBalance,
          bankAccountId: bankAccount.id,
        },
      });
    }

    res.status(201).json(bankAccount);
  } catch (error: any) {
    console.error('Create bank account error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bank account with same details already exists' });
    }
    res.status(500).json({ error: error.message || 'Failed to create bank account' });
  }
};

// Get all bank accounts for company
export const getBankAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { bankTransactions: true },
        },
      },
    });

    res.json(bankAccounts);
  } catch (error: any) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bank accounts' });
  }
};

// Get single bank account with transactions
export const getBankAccountById = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id, companyId },
      include: {
        bankTransactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    res.json(bankAccount);
  } catch (error: any) {
    console.error('Get bank account error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch bank account' });
  }
};

// Update bank account details
export const updateBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    const { bankName, accountNumber, ownerName } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const existingAccount = await prisma.bankAccount.findFirst({
      where: { id, companyId },
    });

    if (!existingAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: {
        bankName: bankName || existingAccount.bankName,
        accountNumber: accountNumber !== undefined ? accountNumber : existingAccount.accountNumber,
        ownerName: ownerName || existingAccount.ownerName,
      },
    });

    res.json(bankAccount);
  } catch (error: any) {
    console.error('Update bank account error:', error);
    res.status(500).json({ error: error.message || 'Failed to update bank account' });
  }
};

// Delete bank account
export const deleteBankAccount = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id, companyId },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    await prisma.bankAccount.delete({ where: { id } });

    res.json({ message: 'Bank account deleted successfully' });
  } catch (error: any) {
    console.error('Delete bank account error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete bank account' });
  }
};

// Deposit money to bank account
export const depositMoney = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    const { amount, description } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id, companyId },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    const newBalance = bankAccount.balance + amount;

    // Update balance and create transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.bankAccount.update({
        where: { id },
        data: { balance: newBalance },
      });

      const transaction = await tx.bankTransaction.create({
        data: {
          type: 'DEPOSIT',
          amount,
          description: description || `Deposit: ₹${amount}`,
          balanceAfter: newBalance,
          bankAccountId: id,
        },
      });

      return { bankAccount: updatedAccount, transaction };
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Deposit error:', error);
    res.status(500).json({ error: error.message || 'Failed to deposit money' });
  }
};

// Withdraw money from bank account
export const withdrawMoney = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { id } = req.params;
    const { amount, description } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id, companyId },
    });

    if (!bankAccount) {
      return res.status(404).json({ error: 'Bank account not found' });
    }

    if (bankAccount.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const newBalance = bankAccount.balance - amount;

    // Update balance and create transaction
    const result = await prisma.$transaction(async (tx) => {
      const updatedAccount = await tx.bankAccount.update({
        where: { id },
        data: { balance: newBalance },
      });

      const transaction = await tx.bankTransaction.create({
        data: {
          type: 'WITHDRAW',
          amount,
          description: description || `Withdrawal: ₹${amount}`,
          balanceAfter: newBalance,
          bankAccountId: id,
        },
      });

      return { bankAccount: updatedAccount, transaction };
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Withdraw error:', error);
    res.status(500).json({ error: error.message || 'Failed to withdraw money' });
  }
};

// Transfer money between bank accounts
export const transferMoney = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user?.companyId;
    const { fromAccountId, toAccountId, amount, description } = req.body;

    if (!companyId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!fromAccountId || !toAccountId) {
      return res.status(400).json({ error: 'Source and destination accounts are required' });
    }

    if (fromAccountId === toAccountId) {
      return res.status(400).json({ error: 'Source and destination accounts must be different' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Get both bank accounts
    const fromAccount = await prisma.bankAccount.findFirst({
      where: { id: fromAccountId, companyId },
    });

    const toAccount = await prisma.bankAccount.findFirst({
      where: { id: toAccountId, companyId },
    });

    if (!fromAccount) {
      return res.status(404).json({ error: 'Source bank account not found' });
    }

    if (!toAccount) {
      return res.status(404).json({ error: 'Destination bank account not found' });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance in source account' });
    }

    const newFromBalance = fromAccount.balance - amount;
    const newToBalance = toAccount.balance + amount;

    // Create transactions and update balances
    const result = await prisma.$transaction(async (tx) => {
      // Update source account balance
      const updatedFromAccount = await tx.bankAccount.update({
        where: { id: fromAccountId },
        data: { balance: newFromBalance },
      });

      // Update destination account balance
      const updatedToAccount = await tx.bankAccount.update({
        where: { id: toAccountId },
        data: { balance: newToBalance },
      });

      // Create withdrawal transaction for source account
      const fromTransaction = await tx.bankTransaction.create({
        data: {
          type: 'WITHDRAW',
          amount,
          description: description || `Transfer to ${toAccount.bankName} - ${toAccount.ownerName}: ₹${amount}`,
          balanceAfter: newFromBalance,
          bankAccountId: fromAccountId,
        },
      });

      // Create deposit transaction for destination account
      const toTransaction = await tx.bankTransaction.create({
        data: {
          type: 'DEPOSIT',
          amount,
          description: description || `Transfer from ${fromAccount.bankName} - ${fromAccount.ownerName}: ₹${amount}`,
          balanceAfter: newToBalance,
          bankAccountId: toAccountId,
        },
      });

      return {
        fromAccount: updatedFromAccount,
        toAccount: updatedToAccount,
        fromTransaction,
        toTransaction,
      };
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Transfer error:', error);
    res.status(500).json({ error: error.message || 'Failed to transfer money' });
  }
};
