import type { ReactNode } from "react";

type SearchType = "all" | "title" | "content";

interface CommunityBoardToolbarProps {
  title: string;
  titleContent?: ReactNode;
  searchType: SearchType;
  onSearchTypeChange: (type: SearchType) => void;
  keyword: string;
  onKeywordChange: (value: string) => void;
  placeholder?: string;
  titleAddon?: ReactNode;
  rightAddon?: ReactNode;
}

export default function CommunityBoardToolbar({
  title,
  titleContent,
  searchType,
  onSearchTypeChange,
  keyword,
  onKeywordChange,
  placeholder = "게시글 검색",
  titleAddon,
  rightAddon,
}: CommunityBoardToolbarProps) {
  return (
    <div className="community-center-toolbar">
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {titleContent ?? (
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#111827" }}>
            {title}
          </h3>
        )}
        {titleAddon}
      </div>
      <div className="community-toolbar-search">
        <select
          className="community-toolbar-search-select"
          value={searchType}
          onChange={(e) => onSearchTypeChange(e.target.value as SearchType)}
        >
          <option value="all">전체</option>
          <option value="title">제목</option>
          <option value="content">내용</option>
        </select>
        <input
          className="community-toolbar-search-input"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          autoComplete="off"
          placeholder={placeholder}
        />
        {rightAddon}
      </div>
    </div>
  );
}
