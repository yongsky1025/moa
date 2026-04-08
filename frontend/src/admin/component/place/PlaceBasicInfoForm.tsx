interface Props {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

export default function PlaceBasicInfoForm({
  name,
  description,
  onNameChange,
  onDescriptionChange,
}: Props) {
  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold text-gray-800">기본 정보</h2>

      <label className="mb-1 block text-sm font-medium text-gray-600">장소명</label>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="예) 강남 프리미엄 파티룸"
        className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#5F8F7B] focus:ring-1 focus:ring-[#5F8F7B]"
      />

      <label className="mb-1 block text-sm font-medium text-gray-600">장소 설명</label>
      <p className="mb-2 text-xs text-gray-400">
        <span className="font-semibold text-[#5F8F7B]">[섹션 이름]</span> 형식으로 섹션을 구분하세요.
        항목 구분은 <span className="font-semibold">·</span> 또는 <span className="font-semibold">/</span>로 작성하면 목록으로 표시됩니다.
      </p>
      <textarea
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder="[장소 소개]&#10;내용을 입력해주세요."
        rows={12}
        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#5F8F7B] focus:ring-1 focus:ring-[#5F8F7B] font-mono leading-relaxed"
      />
    </section>
  );
}
