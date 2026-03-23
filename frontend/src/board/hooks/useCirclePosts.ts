import { usePosts } from "../../post/hooks/usePosts";

interface UseCirclePostsParams {
  circleId: number;
  boardId?: number;
  enabled?: boolean;
}

export function useCirclePosts({ circleId, boardId, enabled = true }: UseCirclePostsParams) {
  return usePosts({ kind: "circle", circleId, boardId, enabled });
}
