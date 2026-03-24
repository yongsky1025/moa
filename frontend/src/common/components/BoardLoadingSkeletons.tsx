import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const baseColor = "#e5e7eb";
const highlightColor = "#f3f4f6";

export function BoardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div style={{ display: "grid", gap: 12 }}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              backgroundColor: "#fff",
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <Skeleton width={84} height={20} borderRadius={999} />
              <Skeleton width={90} height={14} />
            </div>
            <Skeleton width="72%" height={24} style={{ marginBottom: 10 }} />
            <Skeleton count={2} height={14} style={{ marginBottom: 12 }} />
            <div
              style={{
                borderTop: "1px solid #f3f4f6",
                paddingTop: 10,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Skeleton width={220} height={14} />
              <Skeleton width={88} height={28} borderRadius={999} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

export function BoardDetailSkeleton() {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <section
        style={{
          backgroundColor: "#fff",
          border: "1px solid #d6d9dd",
          borderRadius: 14,
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "28px 28px 24px" }}>
          <Skeleton width="70%" height={34} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={18} />
        </div>
        <div style={{ borderTop: "1px solid #e5e7eb" }} />
        <div style={{ padding: 28 }}>
          <Skeleton count={8} height={16} style={{ marginBottom: 8 }} />
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <Skeleton width={74} height={38} borderRadius={8} />
            <Skeleton width={74} height={38} borderRadius={8} />
          </div>
        </div>
      </section>
    </SkeletonTheme>
  );
}

export function ReplyListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: 14,
            }}
          >
            <Skeleton width={140} height={14} style={{ marginBottom: 10 }} />
            <Skeleton count={2} height={14} />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

export function BoardSideMenuSkeleton({ count = 6 }: { count?: number }) {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div style={{ display: "grid", gap: 8 }}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} height={34} borderRadius={8} />
        ))}
      </div>
    </SkeletonTheme>
  );
}

export function BoardPreviewSectionSkeleton() {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div
        style={{
          backgroundColor: "#f8f8f8",
          borderRadius: 12,
          border: "1px solid #ededed",
          padding: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", gap: 8 }}>
            <Skeleton width={72} height={30} borderRadius={999} />
            <Skeleton width={72} height={30} borderRadius={999} />
            <Skeleton width={72} height={30} borderRadius={999} />
          </div>
          <Skeleton width={86} height={18} />
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ececec",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Skeleton width="30%" height={24} style={{ marginBottom: 12 }} />
          <Skeleton count={4} height={16} />
        </div>
        <Skeleton height={42} borderRadius={8} style={{ marginTop: 12 }} />
      </div>
    </SkeletonTheme>
  );
}

export function BoardSelectorSkeleton() {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <Skeleton height={44} borderRadius={8} />
    </SkeletonTheme>
  );
}

export function PostEditorSkeleton() {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div style={{ display: "grid", gap: 12 }}>
        <Skeleton width={110} height={24} />
        <Skeleton width="100%" height={46} borderRadius={10} />
        <Skeleton width="100%" height={360} borderRadius={10} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton width={84} height={40} borderRadius={8} />
          <Skeleton width={84} height={40} borderRadius={8} />
        </div>
      </div>
    </SkeletonTheme>
  );
}
