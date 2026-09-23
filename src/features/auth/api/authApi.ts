import { apiClient } from "@/api/client";
import type { LoginResponse } from "@/features/auth/types/auth.types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export function login(credentials: LoginCredentials) {
  return apiClient<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

