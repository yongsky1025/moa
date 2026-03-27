import CommunityProfileCard, { type CommunityProfileQuickView } from "./CommunityProfileCard";
import CommunityBoardMenu from "./CommunityBoardMenu";
import { postRoutes } from "../../post/routes/postRoutes";

export type CommunityView = "home" | "myPosts" | "myReplies" | "scrap";
export type CommunityBoardFilter = "all" | "notice" | "review" | "free" | "qna";

interface CommunityLeftSidebarProps {
  selectedView: CommunityView;
  onSelectView: (view: CommunityView) => void;
  selectedBoard: CommunityBoardFilter;
  onSelectBoard: (board: CommunityBoardFilter) => void;
}

export default function CommunityLeftSidebar({
  selectedView,
  onSelectView,
  selectedBoard,
  onSelectBoard,
}: CommunityLeftSidebarProps) {
  const isBoardMenuActive = selectedView === "home";
  const selectBoardAndScrollTop = (board: CommunityBoardFilter) => {
    onSelectBoard(board);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectViewAndScrollTop = (nextView: CommunityProfileQuickView) => {
    onSelectView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <aside
      className="community-left-sidebar"
      style={{
        display: "grid",
        gap: 12,
      }}
    >
      <CommunityProfileCard
        selectedView={selectedView}
        onSelectView={selectViewAndScrollTop}
        writeHref={postRoutes.freeCreate}
      />
      <CommunityBoardMenu
        selectedBoard={selectedBoard}
        isActive={isBoardMenuActive}
        onSelectBoard={selectBoardAndScrollTop}
      />
    </aside>
  );
}
