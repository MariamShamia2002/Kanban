import { useMutation } from "@tanstack/react-query";
import { login, type LoginCredentials } from "@/features/auth/api/authApi";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useLogin() {
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
    },
  });
}
