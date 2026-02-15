import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";
import { useLocation } from "wouter";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  authProvider: string;
  emailVerified: boolean;
  createdAt: string;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isAuthenticated = !!user && !error;

  return {
    user: user || null,
    isLoading,
    isAuthenticated,
    checked: !isLoading,
  };
}

// Hook to track page navigation for audit trail
export function usePageAudit(pageName: string) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Fire and forget - log page visit
      apiRequest("/api/auth/audit", "POST", {
        action: "page_visit",
        details: `Visited: ${pageName}`,
      }).catch(() => {});
    }
  }, [pageName, user?.id]);
}

// Hook for logout
export function useLogout() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  return async () => {
    try {
      await apiRequest("/api/auth/logout", "POST");
    } catch {
      // Ignore errors
    }
    queryClient.clear();
    setLocation("/login");
  };
}
