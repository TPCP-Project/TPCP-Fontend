//Re-export hook từ AuthContext cho dễ sử dụng

import { useAuth as useAuthFromContext } from '@/context/AuthContext';

export const useAuth = () => {
  return useAuthFromContext();
};