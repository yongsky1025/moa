import { ChevronLeft, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TagCategoryGroup } from "./PlaceTagFilterDropdown";

// 고정 4개 카테고리 (DB categoryName과 일치해야 함)
const FIXED_CATEGORIES = ["편의시설", "용도", "위치특성", "공간유형"];

interface Props {
  tagGroups: TagCategoryGroup[];
  selectedTagIds: number[];
  onChange: (ids: number[]) => void;
}

// 카테고리 내 선택된 태그 수 계산
function countSelected(group: TagCategoryGroup, selectedTagIds: number[]) {
  return group.tags.filter((t) => selectedTagIds.includes(t.id)).length;
}

export default function PlaceTagSection({ tagGroups, selectedTagIds, onChange }: Props) {
  // 현재 열린 드롭다운: categoryId | "other" | null
  const [openKey, setOpenKey] = useState<number | "other" | null>(null);
  // 기타 2단계 — 선택된 서브카테고리
  const [otherSub, setOtherSub] = useState<TagCategoryGroup | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenKey(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fixedGroups = tagGroups.filter((g) => FIXED_CATEGORIES.includes(g.categoryName));
  const otherGroups = tagGroups.filter((g) => !FIXED_CATEGORIES.includes(g.categoryName));

  const toggle = (id: number) => {
    onChange(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter((v) => v !== id)
        : [...selectedTagIds, id],
    );
  };

  const removeTag = (id: number) => onChange(selectedTagIds.filter((v) => v !== id));
  const clearAll = () => onChange([]);

  const allTags = tagGroups.flatMap((g) => g.tags);
  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));

  // 기타에서 선택된 태그 수
  const otherSelectedCount = otherGroups.flatMap((g) => g.tags).filter((t) => selectedTagIds.includes(t.id)).length;

  const toggleOpen = (key: number | "other") => {
    if (openKey === key) {
      setOpenKey(null);
    } else {
      setOpenKey(key);
      if (key === "other") setOtherSub(null);
    }
  };

  if (tagGroups.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm">
      <div ref={containerRef} className="flex flex-wrap items-center gap-2">
        {/* 고정 4개 카테고리 — 각각 단일 드롭다운 */}
        {fixedGroups.map((group) => {
          const count = countSelected(group, selectedTagIds);
          const isOpen = openKey === group.categoryId;
          return (
            <div key={group.categoryId} className="relative">
              <button
                onClick={() => toggleOpen(group.categoryId)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  count > 0
                    ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {group.categoryName}
                {count > 0 && (
                  <span className="rounded-full bg-[#5F8F7B] px-1.5 py-0.5 text-[11px] font-bold text-white leading-none">
                    {count}
                  </span>
                )}
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-50 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                  <p className="mb-2 px-1 text-[11px] font-semibold text-gray-400">
                    {group.categoryName}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map((tag) => {
                      const selected = selectedTagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          onClick={() => toggle(tag.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                            selected
                              ? "bg-[#5F8F7B] text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* 기타 — 2단계 드롭다운 */}
        {otherGroups.length > 0 && (
          <div className="relative">
            <button
              onClick={() => toggleOpen("other")}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                otherSelectedCount > 0
                  ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              기타
              {otherSelectedCount > 0 && (
                <span className="rounded-full bg-[#5F8F7B] px-1.5 py-0.5 text-[11px] font-bold text-white leading-none">
                  {otherSelectedCount}
                </span>
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${openKey === "other" ? "rotate-180" : ""}`}
              />
            </button>

            {openKey === "other" && (
              <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-56 rounded-xl border border-gray-200 bg-white shadow-lg">
                {otherSub === null ? (
                  /* 1단계: 서브카테고리 목록 */
                  <div className="p-2">
                    <p className="px-3 pb-1 pt-2 text-[11px] font-semibold text-gray-400">
                      카테고리를 선택하세요
                    </p>
                    {otherGroups.map((group) => {
                      const cnt = countSelected(group, selectedTagIds);
                      return (
                        <button
                          key={group.categoryId}
                          onClick={() => setOtherSub(group)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <span>
                            {group.categoryName}
                            {cnt > 0 && (
                              <span className="ml-1.5 text-xs font-bold text-[#5F8F7B]">({cnt})</span>
                            )}
                          </span>
                          <ChevronDown className="h-3.5 w-3.5 -rotate-90 text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* 2단계: 선택된 서브카테고리 태그 */
                  <div className="p-2">
                    <button
                      onClick={() => setOtherSub(null)}
                      className="mb-1 flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      돌아가기
                    </button>
                    <p className="px-3 pb-1.5 text-[11px] font-semibold text-gray-400">
                      {otherSub.categoryName}
                    </p>
                    <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                      {otherSub.tags.map((tag) => {
                        const selected = selectedTagIds.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggle(tag.id)}
                            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              selected
                                ? "bg-[#5F8F7B] text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 선택된 태그 표시 */}
      {selectedTags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
          <span className="text-xs text-gray-400">선택됨:</span>
          {selectedTags.map((t) => (
            <span
              key={t.id}
              className="flex items-center gap-1 rounded-full bg-[#5F8F7B] px-2.5 py-1 text-xs font-medium text-white"
            >
              {t.name}
              <button onClick={() => removeTag(t.id)}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <button
            onClick={clearAll}
            className="ml-auto text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
          >
            전체 해제
          </button>
        </div>
      )}
    </div>
  );
}
