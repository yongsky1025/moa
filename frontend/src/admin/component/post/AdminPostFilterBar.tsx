import { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ko } from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("ko", ko);
import { useAdminPosts } from "../../context/AdminPostsContext";
import type { BoardType } from "../../types/adminTypes";
import { fetchCircleList } from "../../api/adminCircleApi";
import AdminFilterBar, { filterSelectCls } from "../AdminFilterBar";
import type { AppliedFilter } from "../AdminFilterBar";

type Scope = "" | "CIRCLE";

const SCOPE_OPTIONS: { value: Scope; label: string }[] = [
  { value: "", label: "전체" },
  { value: "CIRCLE", label: "모임" },
];

const BOARD_SUB_OPTIONS: { value: BoardType | ""; label: string }[] = [
  { value: "", label: "전체" },
  { value: "FREE", label: "자유" },
  { value: "NOTICE", label: "공지" },
  { value: "SUPPORT", label: "가입인사" },
];

const DELETED_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "false", label: "정상" },
  { value: "true", label: "삭제됨" },
];

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "newest", label: "최신순" },
  { value: "views", label: "조회수순" },
  { value: "replies", label: "댓글수순" },
];

const SEARCH_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "title", label: "제목" },
  { value: "author", label: "작성자" },
  { value: "content", label: "내용" },
];

const disabledSelectCls =
  "h-9 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-300 cursor-not-allowed outline-none";

interface CircleOption {
  circleId: number;
  circleName: string;
}

const findLabel = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value;

export default function AdminPostFilterBar() {
  const { params, applyFilter } = useAdminPosts();

  const [keyword, setKeyword] = useState(params.keyword ?? "");
  const [searchType, setSearchType] = useState(params.type ?? "");

  // scope: "" = 전체, "CIRCLE" = 모임
  const [scope, setScope] = useState<Scope>(
    params.circleId || params.boardType === "CIRCLE" ? "CIRCLE" : "",
  );
  // 모임 내 게시판 타입
  const [boardSubType, setBoardSubType] = useState<BoardType | "">(
    params.boardType && params.boardType !== "CIRCLE"
      ? params.boardType
      : "",
  );

  const [deleted, setDeleted] = useState(
    params.deleted !== undefined ? String(params.deleted) : "",
  );
  const [sort, setSort] = useState(params.sort ?? "newest");
  const [startDate, setStartDate] = useState<Date | null>(
    params.startDate ? new Date(params.startDate) : null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    params.endDate ? new Date(params.endDate) : null,
  );
  const [circleId, setCircleId] = useState<number | undefined>(
    params.circleId,
  );

  // 모임 목록 (모임 선택 시 2차 필터)
  const [circles, setCircles] = useState<CircleOption[]>([]);
  const [circleSearch, setCircleSearch] = useState("");

  useEffect(() => {
    if (scope === "CIRCLE") {
      fetchCircleList({ page: 1, size: 100 }).then((res) => {
        setCircles(
          res.dtoList.map((c) => ({
            circleId: c.circleId,
            circleName: c.circleName,
          })),
        );
      });
    } else {
      setCircleId(undefined);
      setCircles([]);
      setBoardSubType("");
    }
  }, [scope]);

  const filteredCircles = circles.filter((c) =>
    c.circleName.includes(circleSearch),
  );

  const hasFilter = !!(
    params.keyword ||
    params.boardType ||
    params.deleted !== undefined ||
    params.startDate ||
    params.endDate ||
    params.circleId ||
    (params.sort && params.sort !== "newest")
  );

  const formatDate = (d: Date | null) => {
    if (!d) return undefined;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // scope + boardSubType → 백엔드 boardType 매핑
  const resolveBoardType = (): BoardType | undefined => {
    if (scope === "") return undefined; // 전체: 필터 없음
    if (boardSubType) return boardSubType; // 모임 + 자유/공지/가입인사
    return "CIRCLE"; // 모임 + 전체
  };

  const handleSearch = () => {
    applyFilter({
      type: searchType || undefined,
      keyword: keyword.trim() || undefined,
      boardType: resolveBoardType(),
      deleted:
        deleted === "true" ? true : deleted === "false" ? false : undefined,
      sort: sort || undefined,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      circleId: scope === "CIRCLE" ? circleId || undefined : undefined,
    });
  };

  const handleReset = () => {
    setKeyword("");
    setSearchType("");
    setScope("");
    setBoardSubType("");
    setDeleted("");
    setSort("newest");
    setStartDate(null);
    setEndDate(null);
    setCircleId(undefined);
    setCircleSearch("");
    applyFilter({
      type: undefined,
      keyword: undefined,
      boardType: undefined,
      deleted: undefined,
      sort: undefined,
      startDate: undefined,
      endDate: undefined,
      circleId: undefined,
    });
  };

  // ─── 적용됨 태그 구성 ──────────────────────────────────────────────────────
  const appliedFilters: AppliedFilter[] = [];
  if (params.keyword) {
    appliedFilters.push({
      key: "keyword",
      label: findLabel(SEARCH_TYPE_OPTIONS, params.type ?? ""),
      value: params.keyword,
      onRemove: () => { setKeyword(""); applyFilter({ type: undefined, keyword: undefined }); },
    });
  }
  if (params.boardType) {
    const scopeLabel = params.boardType === "CIRCLE" ? "모임" : findLabel(BOARD_SUB_OPTIONS, params.boardType);
    appliedFilters.push({
      key: "boardType",
      label: "범위",
      value: scopeLabel,
      onRemove: () => { setScope(""); setBoardSubType(""); applyFilter({ boardType: undefined, circleId: undefined }); },
    });
  }
  if (params.circleId) {
    const circleName = circles.find((c) => c.circleId === params.circleId)?.circleName ?? String(params.circleId);
    appliedFilters.push({
      key: "circleId",
      label: "모임",
      value: circleName,
      onRemove: () => { setCircleId(undefined); setCircleSearch(""); applyFilter({ circleId: undefined }); },
    });
  }
  if (params.deleted !== undefined) {
    appliedFilters.push({
      key: "deleted",
      label: "삭제",
      value: params.deleted ? "삭제됨" : "정상",
      onRemove: () => { setDeleted(""); applyFilter({ deleted: undefined }); },
    });
  }
  if (params.sort && params.sort !== "newest") {
    appliedFilters.push({
      key: "sort",
      label: "정렬",
      value: findLabel(SORT_OPTIONS, params.sort),
      onRemove: () => { setSort("newest"); applyFilter({ sort: undefined }); },
    });
  }
  if (params.startDate) {
    appliedFilters.push({
      key: "startDate",
      label: "시작일",
      value: params.startDate,
      onRemove: () => { setStartDate(null); applyFilter({ startDate: undefined }); },
    });
  }
  if (params.endDate) {
    appliedFilters.push({
      key: "endDate",
      label: "종료일",
      value: params.endDate,
      onRemove: () => { setEndDate(null); applyFilter({ endDate: undefined }); },
    });
  }

  return (
    <AdminFilterBar
      hasFilter={hasFilter}
      onReset={handleReset}
      appliedFilters={appliedFilters}
    >
      {/* 1행: 검색 */}
      <div className="flex items-center gap-2">
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className={filterSelectCls(!!searchType)}
        >
          {SEARCH_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="border-moa-border bg-moa-light focus-within:border-moa-primary flex h-10 flex-1 items-center gap-2 rounded-lg border px-3 transition-colors focus-within:bg-white">
          <svg
            className="text-moa-subtle h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="검색어 입력"
            className="text-moa-text placeholder:text-moa-subtle flex-1 bg-transparent text-sm outline-none"
          />
          {keyword && (
            <button
              onClick={() => {
                setKeyword("");
                applyFilter({ type: undefined, keyword: undefined });
              }}
              className="text-moa-subtle hover:text-moa-primary cursor-pointer text-xs transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          className="bg-moa-primary hover:bg-moa-hover h-10 cursor-pointer rounded-lg px-6 text-sm font-bold text-white shadow-sm transition-colors"
        >
          검색
        </button>
      </div>

      {/* 2행: 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-moa-subtle text-xs font-medium">필터</span>
        <div className="bg-moa-border h-4 w-px" />

        {/* 범위: 전체 / 모임 */}
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as Scope)}
          className={filterSelectCls(scope !== "")}
        >
          {SCOPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* 모임 2차 필터: 특정 모임 검색 */}
        {scope === "CIRCLE" && (
          <div className="relative">
            <input
              value={
                circleId
                  ? circles.find((c) => c.circleId === circleId)
                      ?.circleName ?? ""
                  : circleSearch
              }
              onChange={(e) => {
                setCircleSearch(e.target.value);
                setCircleId(undefined);
              }}
              placeholder="모임 검색"
              className={`${filterSelectCls(!!circleId)} w-40`}
            />
            {circleSearch && !circleId && filteredCircles.length > 0 && (
              <ul className="border-moa-border absolute top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">
                {filteredCircles.map((c) => (
                  <li
                    key={c.circleId}
                    onClick={() => {
                      setCircleId(c.circleId);
                      setCircleSearch("");
                    }}
                    className="hover:bg-moa-light cursor-pointer px-3 py-2 text-sm"
                  >
                    {c.circleName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="bg-moa-border h-4 w-px" />

        {/* 게시판 타입: 자유/공지/가입인사 (모임 선택 시만 활성) */}
        <select
          value={boardSubType}
          onChange={(e) =>
            setBoardSubType(e.target.value as BoardType | "")
          }
          disabled={scope !== "CIRCLE"}
          className={
            scope !== "CIRCLE"
              ? disabledSelectCls
              : filterSelectCls(!!boardSubType)
          }
        >
          {BOARD_SUB_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <div className="bg-moa-border h-4 w-px" />

        {/* 삭제 상태 */}
        <select
          value={deleted}
          onChange={(e) => setDeleted(e.target.value)}
          className={filterSelectCls(!!deleted)}
        >
          {DELETED_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleSearch}
          className="border-moa-primary text-moa-primary hover:bg-moa-light h-9 cursor-pointer rounded-lg border px-4 text-sm font-medium transition-colors"
        >
          적용
        </button>
      </div>

      {/* 3행: 정렬 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-moa-subtle text-xs font-medium">정렬</span>
        <div className="bg-moa-border h-4 w-px" />

        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            applyFilter({ sort: e.target.value || undefined });
          }}
          className={filterSelectCls(sort !== "newest")}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* 4행: 기간 검색 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-moa-subtle text-xs font-medium">기간</span>
        <div className="bg-moa-border h-4 w-px" />

        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => setStartDate(date)}
          selectsStart
          startDate={startDate ?? undefined}
          endDate={endDate ?? undefined}
          placeholderText="시작일"
          dateFormat="yyyy-MM-dd"
          locale="ko"
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={5}
          className={`${filterSelectCls(!!startDate)} w-32 text-center`}
          isClearable
        />
        <span className="text-moa-subtle text-xs">~</span>
        <DatePicker
          selected={endDate}
          onChange={(date: Date | null) => setEndDate(date)}
          selectsEnd
          startDate={startDate ?? undefined}
          endDate={endDate ?? undefined}
          minDate={startDate ?? undefined}
          placeholderText="종료일"
          dateFormat="yyyy-MM-dd"
          locale="ko"
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={5}
          className={`${filterSelectCls(!!endDate)} w-32 text-center`}
          isClearable
        />
      </div>
    </AdminFilterBar>
  );
}
