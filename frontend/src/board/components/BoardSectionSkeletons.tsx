export function SidebarPostListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="community-sidebar-skeleton-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={`sidebar-skeleton-${index}`}
          className="community-skeleton-block community-sidebar-skeleton-line"
        />
      ))}
    </div>
  );
}

export function PinnedPreviewSkeleton({ count = 3 }: { count?: number }) {
  return (
    <section className="community-pinned-preview" aria-hidden="true">
      <ul className="community-pinned-preview-list">
        {Array.from({ length: count }).map((_, index) => (
          <li key={`pinned-preview-skeleton-${index}`}>
            <div className="community-pinned-preview-card">
              <span className="community-pinned-preview-pin">
                <span className="community-skeleton-block community-skeleton-pin" />
              </span>
              <div className="community-pinned-preview-title-row">
                <span className="community-skeleton-block community-pinned-skeleton-title" />
              </div>
              <span className="community-skeleton-block community-pinned-skeleton-date" />
              <span className="community-skeleton-block community-pinned-skeleton-author" />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ActivityFeedListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="community-post-list" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <li key={`activity-feed-skeleton-${index}`} className="community-activity-feed-item">
          <article className="community-twitter-card">
            <div className="community-twitter-main">
              <div className="community-twitter-header">
                <div className="community-twitter-author-block">
                  <span className="community-skeleton-block community-activity-skeleton-avatar" />
                  <div className="community-twitter-author-info">
                    <span className="community-skeleton-block community-activity-skeleton-headline" />
                    <span className="community-skeleton-block community-activity-skeleton-subline" />
                  </div>
                </div>
              </div>
              <div className="community-twitter-content-link">
                <div className="community-twitter-content-split">
                  <div className="community-twitter-content-text">
                    <span className="community-skeleton-block community-activity-skeleton-line" />
                    <span className="community-skeleton-block community-activity-skeleton-line short" />
                  </div>
                  <span className="community-skeleton-block community-activity-skeleton-image" />
                </div>
              </div>
              <div className="community-twitter-footer">
                <div className="community-twitter-actions">
                  <span className="community-skeleton-block community-activity-skeleton-action" />
                  <span className="community-skeleton-block community-activity-skeleton-action" />
                  <span className="community-skeleton-block community-activity-skeleton-action" />
                </div>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

export function CircleDetailBannerSkeleton() {
  return (
    <section className="community-circle-banner-skeleton" aria-hidden="true">
      <div className="community-skeleton-block community-circle-banner-image" />
      <div className="community-circle-banner-body">
        <div className="community-circle-banner-tags">
          <span className="community-skeleton-block community-circle-banner-tag" />
          <span className="community-skeleton-block community-circle-banner-tag" />
        </div>
        <span className="community-skeleton-block community-circle-banner-title" />
        <span className="community-skeleton-block community-circle-banner-desc" />
        <span className="community-skeleton-block community-circle-banner-desc short" />
      </div>
    </section>
  );
}

export function BoardMenuSkeleton({ count = 5 }: { count?: number }) {
  return (
    <section className="community-board-menu-skeleton" aria-hidden="true">
      <span className="community-skeleton-block community-board-menu-skeleton-head" />
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={`board-menu-skeleton-${index}`}
          className="community-skeleton-block community-board-menu-skeleton-item"
        />
      ))}
    </section>
  );
}
