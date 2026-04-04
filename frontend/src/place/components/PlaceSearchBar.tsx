import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  value: string;
  onChange: (keyword: string) => void;
  onSearch: () => void;
}

export default function PlaceSearchBar({ value, onChange, onSearch }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  const handleClear = () => {
    onChange("");
    onSearch();
    inputRef.current?.focus();
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-full border-2 bg-white px-5 py-3.5 shadow-sm transition-all duration-200 ${
        focused
          ? "border-[#5F8F7B] shadow-md shadow-[#5F8F7B]/10"
          : "border-gray-200"
      }`}
    >
      <Search
        className={`h-5 w-5 shrink-0 transition-colors ${focused ? "text-[#5F8F7B]" : "text-gray-400"}`}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="장소명, 주소, 동네로 검색해보세요"
        className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
      />
      {value && (
        <button
          onClick={handleClear}
          className="rounded-full p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={onSearch}
        className="rounded-full bg-[#5F8F7B] px-5 py-1.5 text-sm font-semibold text-white transition hover:bg-[#4E7C69] active:scale-95"
      >
        검색
      </button>
    </div>
  );
}
