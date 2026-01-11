import api from './api';

export const adminService = {
    getAdminData: async () => {
        const response = await api.get('/admin');
        return response.data;
    },

    updateAdminProfile: async (data: any) => {
        const response = await api.put('/admin/profile', data);
        return response.data;
    },

    updateCompanyProfile: async (data: any) => {
        const response = await api.put('/admin/company', data);
        return response.data;
    },

    changePassword: async (data: any) => {
        const response = await api.put('/admin/change-password', data);
        return response.data;
    },
};
