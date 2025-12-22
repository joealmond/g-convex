// Mock useAdmin hook
import { useUser } from '@/firebase';

export function useAdmin() {
  const { isLoading } = useUser();
  // Mock logic: assume not admin for now, or check generic claim
  return {
    isRealAdmin: false,
    isAdmin: false,
    isLoading: isLoading,
    error: null
  };
}
