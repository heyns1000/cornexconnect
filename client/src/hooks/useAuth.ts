import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  // Temporarily disable auth to show landing page
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: false, // Disable auth query for now to fix infinite loop
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: null, // Temporarily return null to show landing page
    isLoading: false, // Not loading since query is disabled
    isAuthenticated: false, // Show landing page
  };
}