import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ImageOff } from "lucide-react";
import { toAssetUrl } from "../../common/utils/assetUrl";

interface Props {
  images: string[];
  name: string;
}

export default function PlaceImageGallery({ images, name }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const resolvedImages = images.map((image) => toAssetUrl(image));

  if (resolvedImages.length === 0) {
    return (
      <div
        style={{
          width: "100%", height: 420,
          backgroundColor: "#f3f4f6",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          color: "#9ca3af", gap: 8,
        }}
      >
        <ImageOff style={{ width: 48, height: 48 }} />
        <span style={{ fontSize: 14 }}>등록된 이미지가 없습니다</span>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + resolvedImages.length) % resolvedImages.length);
  const next = () => setCurrent((c) => (c + 1) % resolvedImages.length);

  return (
    <>
      {/* 메인 갤러리 */}
      <div style={{ display: "flex", gap: 8, height: 420 }}>
        {/* 메인 이미지 */}
        <div
          style={{
            flex: "0 0 65%", position: "relative", overflow: "hidden",
            borderRadius: 12, cursor: "pointer", backgroundColor: "#f3f4f6",
          }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={resolvedImages[current]}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {resolvedImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                style={{
                  position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                  width: 36, height: 36, borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <ChevronLeft style={{ width: 18, height: 18, color: "#111" }} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  width: 36, height: 36, borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <ChevronRight style={{ width: 18, height: 18, color: "#111" }} />
              </button>
              <div style={{
                position: "absolute", bottom: 12, right: 12,
                backgroundColor: "rgba(0,0,0,0.5)", color: "white",
                fontSize: 12, fontWeight: 600,
                padding: "3px 10px", borderRadius: 999,
              }}>
                {current + 1} / {resolvedImages.length}
              </div>
            </>
          )}
        </div>

        {/* 썸네일 열 (최대 4개) */}
        {resolvedImages.length > 1 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            {resolvedImages.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                onClick={() => setCurrent(idx)}
                style={{
                  flex: 1, position: "relative", overflow: "hidden",
                  borderRadius: 8, cursor: "pointer", backgroundColor: "#f3f4f6",
                  border: current === idx ? "2.5px solid #5F8F7B" : "2.5px solid transparent",
                }}
              >
                <img
                  src={img}
                  alt={`${name} ${idx + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {/* 마지막 썸네일에 +N 표시 */}
                {idx === 3 && resolvedImages.length > 4 && (
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundColor: "rgba(0,0,0,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontSize: 18, fontWeight: 700,
                  }}>
                    +{resolvedImages.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 라이트박스 */}
      {lightbox && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.9)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            style={{
              position: "absolute", top: 20, right: 20,
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: 40, height: 40, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X style={{ width: 22, height: 22, color: "white" }} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{
              position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: 48, height: 48, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft style={{ width: 26, height: 26, color: "white" }} />
          </button>
          <img
            src={resolvedImages[current]}
            alt={name}
            onClick={(e) => e.stopPropagation()}
            style={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain", borderRadius: 8 }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            style={{
              position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: 48, height: 48, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronRight style={{ width: 26, height: 26, color: "white" }} />
          </button>
          <div style={{
            position: "absolute", bottom: 20,
            color: "rgba(255,255,255,0.7)", fontSize: 13,
          }}>
            {current + 1} / {resolvedImages.length}
          </div>
        </div>
      )}
    </>
  );
}
