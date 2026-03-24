import { axiosClient } from '@/lib/axiosClient';

export const dashboardApi = {
  getStats: () =>
    axiosClient.get('/analytics/stats'),
  getDownloadTrend: () =>
    axiosClient.get('/analytics/downloads'),
  getSubjectStats: () =>
    axiosClient.get('/analytics/subjects'),
};
