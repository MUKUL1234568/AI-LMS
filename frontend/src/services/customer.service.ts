import api from './api';
import { Customer } from '../types';

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (data: FormData): Promise<Customer> => {
    const response = await api.post('/customers', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: FormData): Promise<Customer> => {
    const response = await api.put(`/customers/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async (id: string, password: string): Promise<void> => {
    await api.delete(`/customers/${id}`, { data: { password } });
  },

  updateInterestRate: async (id: string, monthlyInterestRate: number): Promise<Customer> => {
    const response = await api.put(`/customers/${id}/interest-rate`, { monthlyInterestRate });
    return response.data;
  },

  accumulateInterestForAll: async (): Promise<{ message: string; updatedCount: number; totalInterestAccumulated: number }> => {
    const response = await api.post('/customers/accumulate-interest');
    return response.data;
  },
};
