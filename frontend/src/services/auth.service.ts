import api from './api';
import { User, UserRole } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const res: any = await api.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (data: { email: string; password: string; fullName: string; role: UserRole; department?: string }): Promise<{ user: User; token: string }> => {
    const res: any = await api.post('/auth/register', data);
    return res.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const res: any = await api.get('/auth/me');
    return res.data;
  },
};
