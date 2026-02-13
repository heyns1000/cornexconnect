import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

const DEMO_USER: User = {
  id: "homemart_admin_001",
  email: "admin@homemart.co.za",
  firstName: "HOMEMART",
  lastName: "ADMIN",
  profileImageUrl: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // If real auth is available, use it. Otherwise fall back to demo user.
  const resolvedUser = user || DEMO_USER;
  const isAuthenticated = !!user || !!error; // Always authenticated (demo fallback)

  return {
    user: resolvedUser,
    isLoading: isLoading && !error,
    isAuthenticated: true, // Always true - demo mode until real auth is deployed
    checked: !isLoading || !!error
  };
}
