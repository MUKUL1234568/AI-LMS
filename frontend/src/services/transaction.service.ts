import api from './api';
import { Customer, Transaction } from '../types';

export const transactionService = {
  // Get customer with updated interest
  getCustomerWithInterest: async (customerId: string): Promise<Customer> => {
    const response = await api.get(`/transactions/customer/${customerId}`);
    return response.data;
  },

  // Get all transactions for a customer
  getTransactions: async (customerId: string): Promise<Transaction[]> => {
    const response = await api.get(`/transactions/customer/${customerId}/transactions`);
    return response.data;
  },

  // Give loan to customer
  giveLoan: async (customerId: string, data: { amount: number; interestRate: number; description?: string; bankAccountId: string; date?: string }) => {
    const response = await api.post(`/transactions/customer/${customerId}/loan`, data);
    return response.data;
  },

  // Receive deposit from customer
  receiveDeposit: async (customerId: string, data: { amount: number; description?: string; bankAccountId: string; date?: string }) => {
    const response = await api.post(`/transactions/customer/${customerId}/deposit`, data);
    return response.data;
  },

  // Add interest to principal
  addInterestToPrincipal: async (customerId: string) => {
    const response = await api.post(`/transactions/customer/${customerId}/add-interest`);
    return response.data;
  },
};
