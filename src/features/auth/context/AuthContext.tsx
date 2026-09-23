import { createContext } from "react";
import type { User } from "@/features/auth/types/auth.types";

export interface AuthContextValue {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);