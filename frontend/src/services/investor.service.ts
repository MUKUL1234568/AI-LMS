import api from './api';
import { Investor } from '../types';

export const investorService = {
  getAll: async (): Promise<Investor[]> => {
    const response = await api.get('/investors');
    return response.data;
  },

  getById: async (id: string): Promise<Investor> => {
    const response = await api.get(`/investors/${id}`);
    return response.data;
  },

  create: async (data: FormData): Promise<Investor> => {
    const response = await api.post('/investors', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: FormData): Promise<Investor> => {
    const response = await api.put(`/investors/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string, password: string): Promise<void> => {
    await api.delete(`/investors/${id}`, { data: { password } });
  },

  updateInterestRate: async (id: string, monthlyInterestRate: number): Promise<Investor> => {
    const response = await api.put(`/investors/${id}/interest-rate`, { monthlyInterestRate });
    return response.data;
  },

  accumulateInterestForAll: async (): Promise<{ message: string; updatedCount: number; totalInterestAccumulated: number }> => {
    const response = await api.post('/investors/accumulate-interest');
    return response.data;
  },
};
