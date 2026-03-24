import { useEffect, useState } from "react";
import { fetchTagsGrouped } from "../../api/adminPlaceApi";
import type { TagCategoryGroupDTO } from "../../types/adminTypes";

interface Props {
  selectedTagIds: Set<number>;
  onToggle: (tagId: number) => void;
}

export default function PlaceTagSelector({ selectedTagIds, onToggle }: Props) {
  const [tagGroups, setTagGroups] = useState<TagCategoryGroupDTO[]>([]);

  useEffect(() => {
    fetchTagsGrouped()
      .then(setTagGroups)
      .catch(() => console.error("태그 로드 실패"));
  }, []);

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-800">태그 선택</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            선택된 태그: {selectedTagIds.size}개
          </p>
        </div>
        {/* AI 태그 추천 버튼 자리 (Step 3에서 추가) */}
      </div>

      <div className="flex max-h-96 flex-col gap-4 overflow-y-auto pr-1">
        {tagGroups.map((group) => (
          <div key={group.categoryId}>
            <p className="mb-2 text-sm font-semibold text-gray-700">
              {group.categoryName}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {group.tags.map((tag) => {
                const active = selectedTagIds.has(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => onToggle(tag.id)}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition ${
                      active
                        ? "border-[#5F8F7B] bg-[#EAF4F0] text-[#4E7C69]"
                        : "border-gray-200 bg-white text-gray-500 hover:border-[#5F8F7B] hover:text-[#5F8F7B]"
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
    </section>
  );
}
