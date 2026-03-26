import { useRef, useState } from "react";
import { Image as ImageIcon, Plus, X } from "lucide-react";
import { requestUploadUrl, uploadImageFile } from "../../api/adminPlaceApi";

const API_HOST = "http://localhost:8080";
const MAX_IMAGES = 15;

interface Props {
  value: string[];
  onChange: (paths: string[]) => void;
  maxImages?: number;
}

export default function PlaceImageUploader({
  value,
  onChange,
  maxImages = MAX_IMAGES,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = maxImages - value.length;
    const toUpload = files.slice(0, remaining);

    if (files.length > remaining) {
      setError(`최대 ${maxImages}장까지 등록 가능합니다. ${remaining}장만 업로드됩니다.`);
    } else {
      setError("");
    }

    setUploading(true);
    try {
      const newPaths: string[] = [];
      for (const file of toUpload) {
        const { uploadUrl } = await requestUploadUrl(
          file.name,
          file.type || "image/jpeg",
        );
        const path = await uploadImageFile(uploadUrl, file);
        newPaths.push(path);
      }
      onChange([...value, ...newPaths]);
    } catch {
      setError("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUploading(false);
      // 같은 파일 재선택 허용을 위해 초기화
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-800">
        <ImageIcon className="h-4 w-4 text-[#5F8F7B]" />
        장소 이미지
        <span className="text-xs font-normal text-gray-400">
          ({value.length}/{maxImages}장)
        </span>
      </h2>

      {error && (
        <p className="mb-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {/* 업로드된 이미지 */}
        {value.map((path, idx) => (
          <div
            key={path}
            className="group relative aspect-square overflow-hidden rounded-lg border border-gray-100"
          >
            <img
              src={`${API_HOST}${path}`}
              alt={`이미지 ${idx + 1}`}
              className="h-full w-full object-cover"
            />
            {/* 대표이미지 배지 */}
            {idx === 0 && (
              <span className="absolute left-1 top-1 rounded bg-[#5F8F7B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                대표
              </span>
            )}
            {/* 삭제 버튼 */}
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100 hover:bg-red-500"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* 추가 버튼 */}
        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 transition hover:border-[#5F8F7B] hover:text-[#5F8F7B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-[#5F8F7B]" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span className="text-[10px]">추가</span>
              </>
            )}
          </button>
        )}
      </div>

      {value.length > 0 && (
        <p className="mt-2 text-xs text-gray-400">
          첫 번째 이미지가 대표 이미지로 사용됩니다.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />
    </section>
  );
}
