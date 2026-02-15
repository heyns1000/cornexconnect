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
  lastLoginAt: string | null;
  phone: string | null;
  department: string | null;
  createdAt: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) return null;
      return await res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const isAuthenticated = !!user;

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
