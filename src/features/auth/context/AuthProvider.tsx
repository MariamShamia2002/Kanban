import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/features/auth/types/auth.types";
import { AuthContext } from "./AuthContext";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

function readToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function readUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readToken);
  const [user, setUser] = useState<User | null>(readUser);
  const setAuth = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      setAuth,
      logout,
    }),
    [token, user, setAuth, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}