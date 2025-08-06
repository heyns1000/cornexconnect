import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useState, useEffect, useRef } from "react";

export function useAuth() {
  const [authState, setAuthState] = useState<{
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    checked: boolean;
  }>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    checked: false,
  });

  const { data: user, isLoading, error, isSuccess } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    enabled: !authState.checked, // Only run once until checked
    retry: false, // No retries to prevent loops
    refetchOnWindowFocus: false,
    staleTime: Infinity, // Cache forever until manual refresh
    refetchInterval: false,
    gcTime: Infinity, // Keep in cache
  });

  // Update auth state when query completes
  useEffect(() => {
    if (!isLoading) {
      if (user && !error) {
        // Successfully authenticated
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
          checked: true,
        });
      } else {
        // Not authenticated
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          checked: true,
        });
      }
    }
  }, [user, isLoading, error]);

  return authState;
}