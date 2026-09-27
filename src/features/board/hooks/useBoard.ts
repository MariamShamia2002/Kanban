import { useQuery } from "@tanstack/react-query";
import { getBoard } from "@/features/board/api/boardsApi";
import { boardKeys } from "@/features/board/hooks/boardKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function useBoard(boardId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: boardKeys.detail(boardId),
    queryFn: () => getBoard(token!, boardId),
    enabled: !!token && !!boardId,
  });
}
