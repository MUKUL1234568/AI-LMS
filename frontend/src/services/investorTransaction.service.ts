import api from './api';
import { Investor, InvestorTransaction } from '../types';

export const investorTransactionService = {
  getInvestorWithInterest: async (id: string): Promise<Investor> => {
    const response = await api.get(`/investor-transactions/investors/${id}/with-interest`);
    return response.data;
  },

  takeLoan: async (investorId: string, data: {
    amount: number;
    interestRate: number;
    description?: string;
    bankAccountId: string;
    date?: string;
  }): Promise<{ investor: Investor; transaction: InvestorTransaction; bankAccount: any }> => {
    const response = await api.post(`/investor-transactions/investors/${investorId}/take-loan`, data);
    return response.data;
  },

  returnLoan: async (investorId: string, data: {
    amount: number;
    description?: string;
    bankAccountId: string;
    date?: string;
  }): Promise<{ investor: Investor; transaction: InvestorTransaction; bankAccount: any }> => {
    const response = await api.post(`/investor-transactions/investors/${investorId}/return-loan`, data);
    return response.data;
  },

  addInterestToPrincipal: async (investorId: string): Promise<{ investor: Investor; transaction: InvestorTransaction }> => {
    const response = await api.post(`/investor-transactions/investors/${investorId}/add-interest-to-principal`);
    return response.data;
  },
};
