import { axiosClient } from '@/lib/axiosClient';
import type { RegisterDto, LoginDto } from '@studyq/shared';

export const authApi = {
  register: (data: RegisterDto) =>
    axiosClient.post<{ success: boolean; data: { user: any } }>('/auth/register', data),
  login: (data: LoginDto) =>
    axiosClient.post<{ success: boolean; data: { user: any } }>('/auth/login', data),
  refresh: () =>
    axiosClient.post<{ success: boolean; data: { user: any } }>('/auth/refresh'),
  logout: () =>
    axiosClient.post('/auth/logout'),
  getMe: () =>
    axiosClient.get<{ success: boolean; data: any }>('/auth/me'),
};
