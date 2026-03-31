interface BoardPendingPanelProps {
  postPinnedCount: number;
  postDeletedCount: number;
  boardCreateCount: number;
  boardRenameCount: number;
  boardDeleteCount: number;
  onReset: () => void;
  onApply: () => void;
  resetDisabled?: boolean;
  applyDisabled?: boolean;
  showBasePinnedCount?: boolean;
  basePinnedCount?: number;
  embedded?: boolean;
}

export default function BoardPendingPanel({
  postPinnedCount,
  postDeletedCount,
  boardCreateCount,
  boardRenameCount,
  boardDeleteCount,
  onReset,
  onApply,
  resetDisabled = false,
  applyDisabled = false,
  showBasePinnedCount = false,
  basePinnedCount = 0,
  embedded = false,
}: BoardPendingPanelProps) {
  return (
    <section className={`community-admin-toolbar left${embedded ? " embedded" : ""}`}>
      <div className="community-admin-pending-head">
        <p className="community-admin-pending-head-title">변경대기</p>
        <div className="community-admin-pending-head-actions">
          <button
            type="button"
            className="community-admin-reset-button inline"
            disabled={resetDisabled}
            onClick={onReset}
          >
            되돌리기
          </button>
          <span className="community-admin-pending-sep">|</span>
          <button
            type="button"
            className="community-apply-button inline"
            disabled={applyDisabled}
            onClick={onApply}
          >
            적용
          </button>
        </div>
      </div>
      <div className="community-admin-pending-block">
        <div className="community-admin-pending-group">
          <p className="community-admin-pending-label">게시글</p>
          {showBasePinnedCount && (
            <p className="community-admin-pending-line">
              기존 고정 <span className="community-admin-pending-value">{basePinnedCount}</span>건
            </p>
          )}
          <p className="community-admin-pending-line">
            고정 <span className="community-admin-pending-value">{postPinnedCount}</span>건 / 삭제{" "}
            <span className="community-admin-pending-value">{postDeletedCount}</span>건
          </p>
        </div>
        <div className="community-admin-pending-group">
          <p className="community-admin-pending-label">게시판</p>
          <p className="community-admin-pending-line">
            추가 <span className="community-admin-pending-value">{boardCreateCount}</span>건 / 수정{" "}
            <span className="community-admin-pending-value">{boardRenameCount}</span>건 / 삭제{" "}
            <span className="community-admin-pending-value">{boardDeleteCount}</span>건
          </p>
        </div>
      </div>
    </section>
  );
}
