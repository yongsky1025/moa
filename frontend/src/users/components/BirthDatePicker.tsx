import { useEffect, useMemo, useRef, useState } from "react";

interface BirthDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  style?: React.CSSProperties;
}

const MIN_YEAR = 1920;
const MAX_AGE_YEAR_OFFSET = 14;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

type ActiveCol = "year" | "month" | "day" | null;

export default function BirthDatePicker({ value, onChange, style }: BirthDatePickerProps) {
  const today = useMemo(() => new Date(), []);
  const maxYear = today.getFullYear() - MAX_AGE_YEAR_OFFSET;

  const parsed = value ? value.split("-").map(Number) : [0, 0, 0];
  const [year, setYear] = useState(parsed[0] || 0);
  const [month, setMonth] = useState(parsed[1] || 0);
  const [day, setDay] = useState(parsed[2] || 0);
  const [activeCol, setActiveCol] = useState<ActiveCol>(null);
  const [warning, setWarning] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split("-").map(Number);
      setYear(y);
      setMonth(m);
      setDay(d);
    }
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setActiveCol(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = maxYear; y >= MIN_YEAR; y--) arr.push(y);
    return arr;
  }, [maxYear]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const dayCount = useMemo(() => {
    if (!year || !month) return 31;
    return getDaysInMonth(year, month);
  }, [year, month]);

  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => i + 1), [dayCount]);

  useEffect(() => {
    if (year && month && day && day > dayCount) setDay(dayCount);
  }, [dayCount, year, month, day]);

  const tryEmit = (y: number, m: number, d: number) => {
    setWarning("");
    if (!y || !m || !d) return;
    const selected = new Date(y, m - 1, d);
    const limit = new Date(today.getFullYear() - MAX_AGE_YEAR_OFFSET, today.getMonth(), today.getDate());
    if (selected > limit) {
      setWarning(`만 ${MAX_AGE_YEAR_OFFSET}세 이상만 가입할 수 있습니다.`);
      return;
    }
    onChange(`${y}-${pad(m)}-${pad(d)}`);
  };

  const selectYear = (y: number) => {
    setYear(y);
    tryEmit(y, month, day);
    setActiveCol("month");
  };
  const selectMonth = (m: number) => {
    setMonth(m);
    tryEmit(year, m, day);
    setActiveCol("day");
  };
  const selectDay = (d: number) => {
    setDay(d);
    tryEmit(year, month, d);
    setActiveCol(null);
  };

  const toggle = (col: ActiveCol) => setActiveCol((prev) => (prev === col ? null : col));

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      {/* 3칸 트리거 + 라벨 */}
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <FieldTrigger active={activeCol === "year"} onClick={() => toggle("year")} placeholder="년(4자)" value={year ? `${year}` : ""} />
        <Unit>년</Unit>
        <FieldTrigger active={activeCol === "month"} onClick={() => toggle("month")} placeholder="월" value={month ? `${month}` : ""} />
        <Unit>월</Unit>
        <FieldTrigger active={activeCol === "day"} onClick={() => toggle("day")} placeholder="일" value={day ? `${day}` : ""} />
        <Unit>일</Unit>
      </div>

      {/* 스크롤 드롭다운 (3열 동시) */}
      {activeCol && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderRadius: 14,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
            padding: "10px 8px",
            zIndex: 50,
            animation: "bdpFadeIn 0.15s ease-out",
          }}
        >
          <div style={{ display: "flex", gap: 6 }}>
            <ScrollColumn items={years} selected={year} onSelect={selectYear} highlight={activeCol === "year"} />
            <ScrollColumn items={months} selected={month} onSelect={selectMonth} highlight={activeCol === "month"} />
            <ScrollColumn items={days} selected={day} onSelect={selectDay} highlight={activeCol === "day"} />
          </div>
          <style>{`
            @keyframes bdpFadeIn {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {warning && <p style={{ fontSize: 12, color: "#ff4d4f", marginTop: 6, marginBottom: 0 }}>{warning}</p>}
    </div>
  );
}

function Unit({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 13, fontWeight: 600, color: "#888", flexShrink: 0, margin: "0 11px 0 2px" }}>{children}</span>;
}

function FieldTrigger({ active, onClick, placeholder, value }: { active: boolean; onClick: () => void; placeholder: string; value: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        height: 44,
        padding: "0 8px",
        border: active ? "1.5px solid #111" : "1.5px solid #e0e0e0",
        borderRadius: 10,
        backgroundColor: "#fafafa",
        fontSize: 14,
        fontWeight: value ? 600 : 400,
        color: value ? "#111" : "#aaa",
        cursor: "pointer",
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.15s",
        textAlign: "center",
      }}
    >
      {value || placeholder}
    </button>
  );
}

function ScrollColumn({
  items,
  selected,
  onSelect,
  highlight,
}: {
  items: number[];
  selected: number;
  onSelect: (item: number) => void;
  highlight: boolean;
}) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current || !selected) return;
    const idx = items.indexOf(selected);
    if (idx < 0) return;
    const itemH = 36;
    listRef.current.scrollTop = idx * itemH - (listRef.current.clientHeight / 2 - itemH / 2);
  }, [selected, items]);

  return (
    <div
      ref={listRef}
      className="bdp-scroll-col"
      style={{
        flex: 1,
        height: 200,
        overflowY: "auto",
        borderRadius: 10,
        backgroundColor: highlight ? "#f0f0f2" : "#f5f5f7",
        scrollbarWidth: "none",
        transition: "background-color 0.15s",
      }}
    >
      <style>{`.bdp-scroll-col::-webkit-scrollbar { display: none; }`}</style>
      {items.map((item) => {
        const isSelected = item === selected;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 36,
              border: "none",
              backgroundColor: isSelected ? "#111" : "transparent",
              color: isSelected ? "#fff" : "#555",
              fontSize: 14,
              fontWeight: isSelected ? 700 : 400,
              borderRadius: 8,
              cursor: "pointer",
              transition: "all 0.12s",
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
