import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialsApi } from '../api/materials.api';

export function useMaterials(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => materialsApi.list(params).then((r) => r.data.data),
  });
}

export function useUploadMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => materialsApi.upload(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materials'] }),
  });
}

export function useDownloadMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialsApi.download(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materials'] }),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => materialsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materials'] }),
  });
}
