import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApi } from "../../post/api/postApi";
import { postRoutes } from "../../post/routes/postRoutes";
import type { PostResponse } from "../../post/types/postTypes";
import CommunityPinnedPreviewList from "./CommunityPinnedPreviewList";
import { PinnedPreviewSkeleton } from "./BoardSectionSkeletons";
import { useDelayedLoading } from "../../common/hooks/useDelayedLoading";

interface GlobalPinnedPreviewSectionProps {
  fromPath: string;
}

const toDateLabel = (value: string) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
};

const comparePinnedPosts = (a: PostResponse, b: PostResponse) => {
  const pinnedAtDiff =
    new Date(b.pinnedAt ?? "").getTime() - new Date(a.pinnedAt ?? "").getTime();
  if (pinnedAtDiff !== 0) {
    return pinnedAtDiff;
  }
  return new Date(b.createDate).getTime() - new Date(a.createDate).getTime();
};

export default function GlobalPinnedPreviewSection({
  fromPath,
}: GlobalPinnedPreviewSectionProps) {
  const { data: pinnedGlobalPosts = [], isLoading } = useQuery<PostResponse[]>({
    queryKey: ["communityPinnedGlobalTopUnified"],
    queryFn: async () => {
      const { data } = await postApi.getCommunityPosts("all");
      return data
        .filter(
          (post) =>
            !!post.pinned &&
            (post.boardType === "NOTICE" || post.boardType === "FREE"),
        )
        .sort(comparePinnedPosts);
    },
  });

  const pinnedPreviewItems = useMemo(
    () =>
      pinnedGlobalPosts.map((post) => ({
        id: post.postId,
        title: post.title,
        noticeCategory:
          post.boardType === "NOTICE"
            ? (post.noticeCategory ?? "ANNOUNCEMENT")
            : null,
        authorName: post.authorName,
        createDateLabel: toDateLabel(post.createDate),
        href:
          post.boardType === "NOTICE"
            ? postRoutes.noticeDetail(post.postId)
            : postRoutes.freeDetail(post.postId),
        status: "pinned" as const,
      })),
    [pinnedGlobalPosts],
  );
  const showLoading = useDelayedLoading(isLoading, 150, 300);

  if (showLoading) {
    return <PinnedPreviewSkeleton count={3} />;
  }
  if (isLoading) {
    return null;
  }

  if (pinnedPreviewItems.length === 0) {
    return null;
  }

  return <CommunityPinnedPreviewList items={pinnedPreviewItems} fromPath={fromPath} />;
}
