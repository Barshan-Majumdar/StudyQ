import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';
import { authApi } from '../api/auth.api';
import type { LoginDto, RegisterDto } from '@studyq/shared';

export function useLogin() {
  const navigate = useNavigate();
  const setUser = useUiStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: LoginDto) => authApi.login(data),
    onSuccess: ({ data }) => {
      setUser(data.data.user);
      navigate('/dashboard');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const setUser = useUiStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: RegisterDto) => authApi.register(data),
    onSuccess: ({ data }) => {
      setUser(data.data.user);
      navigate('/dashboard');
    },
  });
}

export function useLogout() {
  const clearUser = useUiStore((s) => s.clearUser);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearUser();
      qc.clear();
    },
  });
}

export function useRefreshAuth() {
  const setUser = useUiStore((s) => s.setUser);
  const clearUser = useUiStore((s) => s.clearUser);

  return useQuery({
    queryKey: ['auth', 'refresh'],
    queryFn: async () => {
      try {
        const { data } = await authApi.refresh();
        setUser(data.data.user);
        return data.data.user;
      } catch {
        clearUser();
        return null;
      }
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 min
  });
}

export function useAuth() {
  const user = useUiStore((s) => s.user);
  return { user, isAuthenticated: !!user };
}
