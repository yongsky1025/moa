import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface TagItem {
  id: number;
  name: string;
}

export interface TagCategoryGroup {
  categoryId: number;
  categoryName: string;
  tags: TagItem[];
}

interface Props {
  tagGroups: TagCategoryGroup[];
  selectedTagIds: number[];
  onChange: (ids: number[]) => void;
}

const MAX_VISIBLE_TAGS = 3;

export default function PlaceTagFilterDropdown({ tagGroups, selectedTagIds, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const allTags = tagGroups.flatMap((g) => g.tags);
  const selectedTags = allTags.filter((t) => selectedTagIds.includes(t.id));

  const toggle = (id: number) => {
    onChange(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter((v) => v !== id)
        : [...selectedTagIds, id],
    );
  };

  const removeTag = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedTagIds.filter((v) => v !== id));
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const visibleTags = selectedTags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = selectedTags.length - MAX_VISIBLE_TAGS;

  return (
    <div ref={ref} className="relative">
      {/* 트리거 버튼 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex min-w-[140px] items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
          selectedTagIds.length > 0
            ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
        }`}
      >
        <span className="font-medium">
          태그{selectedTagIds.length > 0 ? ` (${selectedTagIds.length})` : ""}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* 드롭다운 패널 */}
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-80 rounded-xl border border-gray-200 bg-white shadow-lg">
          {/* 선택된 태그 표시 영역 */}
          {selectedTags.length > 0 && (
            <div className="border-b border-gray-100 px-4 py-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">선택된 태그</span>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
                >
                  전체 해제
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visibleTags.map((t) => (
                  <span
                    key={t.id}
                    className="flex items-center gap-1 rounded-full bg-[#5F8F7B] px-2.5 py-1 text-xs font-medium text-white"
                  >
                    {t.name}
                    <button onClick={(e) => removeTag(t.id, e)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {hiddenCount > 0 && (
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                    +{hiddenCount}개
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 카테고리별 태그 목록 */}
          <div className="max-h-72 overflow-y-auto p-3">
            {tagGroups.map((group) => (
              <div key={group.categoryId} className="mb-3 last:mb-0">
                <p className="mb-1.5 px-1 text-xs font-bold text-gray-400">{group.categoryName}</p>
                <div className="flex flex-wrap gap-1.5">
                  {group.tags.map((tag) => {
                    const selected = selectedTagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggle(tag.id)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
