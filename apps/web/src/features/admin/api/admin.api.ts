import { axiosClient } from '@/lib/axiosClient';

export const adminApi = {
  listUsers: (params: Record<string, any> = {}) =>
    axiosClient.get('/admin/users', { params }),
  getUser: (id: string) =>
    axiosClient.get(`/admin/users/${id}`),
  createUser: (data: { name: string; email: string; password: string; role: string }) =>
    axiosClient.post('/admin/users', data),
  updateUser: (id: string, data: Record<string, any>) =>
    axiosClient.patch(`/admin/users/${id}`, data),
  deleteUser: (id: string) =>
    axiosClient.delete(`/admin/users/${id}`),
  auditLog: (params: Record<string, any> = {}) =>
    axiosClient.get('/admin/audit-log', { params }),
};
