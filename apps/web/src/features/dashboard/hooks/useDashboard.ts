import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard.api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data.data),
  });
}

export function useDownloadTrend() {
  return useQuery({
    queryKey: ['dashboard', 'downloadTrend'],
    queryFn: () => dashboardApi.getDownloadTrend().then((r) => r.data.data),
  });
}

export function useSubjectStats() {
  return useQuery({
    queryKey: ['dashboard', 'subjectStats'],
    queryFn: () => dashboardApi.getSubjectStats().then((r) => r.data.data),
  });
}
