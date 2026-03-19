import type { ActionType } from '../../types/adminTypes';

const BADGE_CONFIG: Record<ActionType, { label: string; bg: string; color: string }> = {
  CREATE:       { label: 'CREATE',  bg: '#DCFCE7', color: '#15803D' },
  UPDATE:       { label: 'UPDATE',  bg: '#DBEAFE', color: '#1D4ED8' },
  DELETE:       { label: 'DELETE',  bg: '#FEE2E2', color: '#B91C1C' },
  LOGIN:        { label: 'LOGIN',   bg: '#EDE9FE', color: '#6D28D9' },
  LOGOUT:       { label: 'LOGOUT',  bg: '#F1F5F9', color: '#475569' },
  WITHDRAW:     { label: 'WITHDRAW',bg: '#FFEDD5', color: '#C2410C' },
  JOIN_CIRCLE:  { label: 'JOIN',    bg: '#CFFAFE', color: '#0E7490' },
  LEAVE_CIRCLE: { label: 'LEAVE',   bg: '#FEF9C3', color: '#A16207' },
  UNKNOWN:      { label: 'UNKNOWN', bg: '#F1F5F9', color: '#94A3B8' },
};

export default function ActionTypeBadge({ type }: { type: ActionType }) {
  const cfg = BADGE_CONFIG[type] ?? BADGE_CONFIG.UNKNOWN;
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-widest"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}
