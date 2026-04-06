interface CommunityPostListSkeletonProps {
  count?: number;
  showBoardName?: boolean;
}

export default function CommunityPostListSkeleton({
  count = 6,
  showBoardName = true,
}: CommunityPostListSkeletonProps) {
  return (
    <ul className="community-post-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <li key={`community-post-skeleton-${index}`}>
          <div className="community-post-item-row">
            <div className="community-post-item-link community-post-item-link-skeleton">
              <span className="community-post-pin-placeholder">
                <span className="community-skeleton-block community-skeleton-pin" />
              </span>
              <div className="community-post-item-body">
                <p className="community-post-item-title">
                  <span className="community-skeleton-block community-skeleton-title" />
                  {showBoardName ? (
                    <span className="community-skeleton-block community-skeleton-chip" />
                  ) : null}
                </p>
                <p className="community-post-item-meta">
                  <span className="community-skeleton-block community-skeleton-meta-short" />
                  <span className="community-skeleton-block community-skeleton-meta-stat" />
                  <span className="community-skeleton-block community-skeleton-meta-stat" />
                  <span className="community-skeleton-block community-skeleton-meta-stat" />
                  <span className="community-skeleton-block community-skeleton-meta-date" />
                </p>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
