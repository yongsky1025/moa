import { Settings } from "lucide-react";
import type { ReactNode } from "react";
import CommunityProfileCard, { type CommunityProfileQuickView } from "./CommunityProfileCard";
import CommunityBoardMenu from "./CommunityBoardMenu";
import { postRoutes } from "../../post/routes/postRoutes";
import { useAuthStore } from "../../store/authStore";

export type CommunityView = "home" | "myPosts" | "myReplies" | "scrap";
export type CommunityBoardFilter = "all" | "notice" | "free" | number;

export interface CommunityExtraBoardItem {
  boardId: number;
  label: string;
}

interface CommunityLeftSidebarProps {
  selectedView: CommunityView;
  onSelectView: (view: CommunityView) => void;
  selectedBoard: CommunityBoardFilter;
  onSelectBoard: (board: CommunityBoardFilter) => void;
  noticeBoardLabel?: string;
  freeBoardLabel?: string;
  hasNoticeBoard?: boolean;
  hasFreeBoard?: boolean;
  noticeChanged?: boolean;
  freeChanged?: boolean;
  canAddBoard?: boolean;
  onAddBoard?: (name: string) => void;
  pendingAddedBoardNames?: string[];
  extraBoards?: CommunityExtraBoardItem[];
  pendingPanel?: ReactNode;
  showEditModeToggle?: boolean;
  editModeActive?: boolean;
  onToggleEditMode?: () => void;
  profileCounts?: {
    myPosts: number;
    myReplies: number;
    scrap: number;
  };
}

export default function CommunityLeftSidebar({
  selectedView,
  onSelectView,
  selectedBoard,
  onSelectBoard,
  noticeBoardLabel,
  freeBoardLabel,
  hasNoticeBoard = true,
  hasFreeBoard = true,
  noticeChanged = false,
  freeChanged = false,
  canAddBoard = false,
  onAddBoard,
  pendingAddedBoardNames,
  extraBoards,
  pendingPanel,
  showEditModeToggle = false,
  editModeActive = false,
  onToggleEditMode,
  profileCounts,
}: CommunityLeftSidebarProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.userRole === "ADMIN";
  const isBoardMenuActive = selectedView === "home";
  const writeHref = (() => {
    if (selectedBoard === "notice") {
      return isAdmin
        ? `${postRoutes.createBase}?board=notice&fromBoard=notice`
        : `${postRoutes.createBase}?selectBoard=true&fromBoard=notice`;
    }
    if (selectedBoard !== "all" && selectedBoard !== "free") {
      return `${postRoutes.createBase}?board=free&fromBoard=${selectedBoard}`;
    }
    return `${postRoutes.createBase}?board=free&fromBoard=${selectedBoard}`;
  })();

  const scrollToPageTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectBoardAndScrollTop = (board: CommunityBoardFilter) => {
    onSelectBoard(board);
    scrollToPageTop();
  };

  const selectViewAndScrollTop = (nextView: CommunityProfileQuickView) => {
    onSelectView(nextView);
    scrollToPageTop();
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
        writeHref={writeHref}
        counts={profileCounts}
        replaceWithPending={editModeActive && !!pendingPanel}
        pendingContent={pendingPanel}
        bottomAction={
          showEditModeToggle ? (
            <button
              type="button"
              onClick={onToggleEditMode}
              className={`community-side-edit-toggle ${editModeActive ? "active" : ""}`}
              aria-label="수정모드 전환"
              title="수정모드"
            >
              <Settings size={16} strokeWidth={2} aria-hidden="true" />
              <span>편집모드</span>
            </button>
          ) : undefined
        }
      />
      <CommunityBoardMenu
        selectedBoard={selectedBoard}
        isActive={isBoardMenuActive}
        onSelectBoard={selectBoardAndScrollTop}
        noticeLabel={noticeBoardLabel}
        freeLabel={freeBoardLabel}
        hasNoticeBoard={hasNoticeBoard}
        hasFreeBoard={hasFreeBoard}
        noticeChanged={noticeChanged}
        freeChanged={freeChanged}
        canAddBoard={canAddBoard}
        onAddBoard={onAddBoard}
        pendingAddedBoardNames={pendingAddedBoardNames}
        extraBoards={extraBoards}
      />
    </aside>
  );
}
