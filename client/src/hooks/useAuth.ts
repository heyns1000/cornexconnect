import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { useState, useEffect, useRef } from "react";

export function useAuth() {
  // Demo mode for Homemart Africa evaluation
  const demoUser: User = {
    id: "homemart_admin_001",
    email: "admin@homemart.co.za",
    firstName: "HOMEMART",
    lastName: "ADMIN",
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  return {
    user: demoUser,
    isLoading: false,
    isAuthenticated: true,
    checked: true
  };
}