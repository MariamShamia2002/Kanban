import { useQuery } from "@tanstack/react-query";
import { getBoards } from "@/features/board/api/boardsApi";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useBoards() {
  const { token } = useAuth();

  return useQuery({
    queryKey: boardKeys.lists(),
    queryFn: () => getBoards(token!),
    enabled: !!token,
  });
}
