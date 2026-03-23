import { Navigate } from 'react-router-dom';
import { useUiStore } from '@/store/uiStore';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function RoleGuard({ children, allowedRoles }: Props) {
  const user = useUiStore((s) => s.user);

  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role.toLowerCase())) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
