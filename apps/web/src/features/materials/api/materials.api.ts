import { axiosClient } from '@/lib/axiosClient';

export const materialsApi = {
  list: (params: Record<string, any> = {}) =>
    axiosClient.get('/materials', { params }),
  upload: (formData: FormData) =>
    axiosClient.post('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  download: (id: string) =>
    axiosClient.post(`/materials/${id}/download`),
  remove: (id: string) =>
    axiosClient.delete(`/materials/${id}`),
};
