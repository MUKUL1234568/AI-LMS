import api from './api';
import { BankAccount, BankTransaction } from '../types';

export const bankService = {
  getAll: async (): Promise<BankAccount[]> => {
    const response = await api.get('/banks');
    return response.data;
  },

  getById: async (id: string): Promise<BankAccount> => {
    const response = await api.get(`/banks/${id}`);
    return response.data;
  },

  create: async (data: {
    bankName: string;
    accountNumber?: string;
    ownerName: string;
    initialBalance?: number;
  }): Promise<BankAccount> => {
    const response = await api.post('/banks', data);
    return response.data;
  },

  update: async (
    id: string,
    data: {
      bankName?: string;
      accountNumber?: string;
      ownerName?: string;
    }
  ): Promise<BankAccount> => {
    const response = await api.put(`/banks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/banks/${id}`);
  },

  deposit: async (
    id: string,
    data: { amount: number; description?: string }
  ): Promise<{ bankAccount: BankAccount; transaction: BankTransaction }> => {
    const response = await api.post(`/banks/${id}/deposit`, data);
    return response.data;
  },

  withdraw: async (
    id: string,
    data: { amount: number; description?: string }
  ): Promise<{ bankAccount: BankAccount; transaction: BankTransaction }> => {
    const response = await api.post(`/banks/${id}/withdraw`, data);
    return response.data;
  },

  transfer: async (data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
  }): Promise<{
    fromAccount: BankAccount;
    toAccount: BankAccount;
    fromTransaction: BankTransaction;
    toTransaction: BankTransaction;
  }> => {
    const response = await api.post('/banks/transfer', data);
    return response.data;
  },
};
