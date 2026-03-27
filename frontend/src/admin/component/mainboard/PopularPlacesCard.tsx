import type { PopularPlaceDTO } from "../../types/adminTypes";

interface Props {
  data: PopularPlaceDTO[];
  loading: boolean;
}

const RANK_STYLE = [
  { bg: "#FFD700", text: "#7A5C00" }, // 1위 금
  { bg: "#C0C0C0", text: "#4B5563" }, // 2위 은
  { bg: "#CD7F32", text: "#fff" }, // 3위 동
  { bg: "#EAF4F0", text: "#5F8F7B" },
  { bg: "#EAF4F0", text: "#5F8F7B" },
];

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="text-[11px]"
          style={{
            color: i < full || (i === full && half) ? "#F59E0B" : "#D1D5DB",
          }}
        >
          {i < full ? "★" : i === full && half ? "☆" : "☆"}
        </span>
      ))}
      <span className="ml-0.5 text-[11px] text-moa-subtle">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export default function PopularPlacesCard({ data, loading }: Props) {
  return (
    <div className="admin-card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="admin-card-title mb-0">인기 장소 TOP 5</h3>
        <span className="text-[11px] text-moa-subtle">
          최근 30일 기준(누적x)
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-300">데이터 없음</p>
      ) : (
        <div className="flex flex-col gap-2">
          {/* 헤더 */}
          <div className="mb-1 grid grid-cols-[2rem_1fr_5rem_4rem_4rem_4rem] items-center gap-2 px-1">
            <span />
            <span className="text-[11px] font-semibold text-moa-subtle">
              장소명
            </span>
            <span className="text-center text-[11px] font-semibold text-moa-subtle">
              평점
            </span>
            <span className="text-right text-[11px] font-semibold text-moa-subtle">
              예약
            </span>
            <span className="text-right text-[11px] font-semibold text-moa-subtle">
              좋아요
            </span>
            <span className="text-right text-[11px] font-semibold text-moa-subtle">
              점수
            </span>
          </div>

          {data.map((place, idx) => {
            const rankStyle = RANK_STYLE[idx] ?? {
              bg: "#F3F4F6",
              text: "#6B7280",
            };
            return (
              <div
                key={place.placeId}
                className="grid grid-cols-[2rem_1fr_5rem_4rem_4rem_4rem] items-center gap-2 rounded-xl border border-gray-100 px-3 py-2.5 transition-colors hover:bg-gray-50"
              >
                {/* 순위 뱃지 */}
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                  style={{ background: rankStyle.bg, color: rankStyle.text }}
                >
                  {idx + 1}
                </div>

                {/* 장소명 + 도시 */}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-moa-text">
                    {place.name}
                  </p>
                  <p className="text-[11px] text-moa-subtle">{place.city}</p>
                </div>

                {/* 평점 */}
                <div className="flex justify-center">
                  <Stars rating={place.averageRating} />
                </div>

                {/* 예약수 */}
                <p className="text-right text-sm font-bold text-moa-text">
                  {place.recentReservationCount.toLocaleString("ko-KR")}
                  <span className="ml-0.5 text-[10px] font-normal text-moa-subtle">
                    건
                  </span>
                </p>

                {/* 좋아요 */}
                <p
                  className="text-right text-sm font-bold"
                  style={{ color: "#F43F5E" }}
                >
                  ♥ {place.recentLikeCount.toLocaleString("ko-KR")}
                </p>

                {/* 점수 */}
                <p
                  className="text-right text-sm font-black"
                  style={{ color: "#5F8F7B" }}
                >
                  {place.score.toFixed(1)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
