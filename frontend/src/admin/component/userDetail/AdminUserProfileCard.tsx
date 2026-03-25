import type { UserGender, UserRole, UserStatus } from '../../types/adminTypes';

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return '-';
  const d = new Date(date);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-';
  const d = new Date(date);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
};

const genderLabel = (g?: UserGender) => (g === 'MALE' ? '남성' : g === 'FEMALE' ? '여성' : '미상');
const roleLabel = (r?: UserRole) => (r === 'ADMIN' ? '관리자' : '일반');
const statusLabel = (s?: UserStatus) =>
  s === 'ACTIVE' ? '활성' : s === 'WITHDRAWN' ? '탈퇴' : s === 'SUSPENDED' ? '정지' : s === 'BANNED' ? '영구정지' : '-';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-moa-subtle text-xs font-semibold">{label}</span>
      <span className="text-moa-text text-sm font-semibold">{value}</span>
    </div>
  );
}

export default function AdminUserProfileCard({
  name,
  userId,
  age,
  birthDate,
  gender,
  role,
  status,
  createDate,
}: {
  name: string;
  userId: number;
  age: number;
  birthDate: string;
  gender?: UserGender;
  role?: UserRole;
  status?: UserStatus;
  createDate?: string;
}) {
  return (
    <section className="border-moa-border overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b border-moa-border bg-linear-to-r from-moa-light to-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="bg-moa-primary flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black text-white shadow-sm">
            {name?.charAt(0) ?? '?'}
          </div>
          <div className="min-w-0">
            <h2 className="text-moa-text truncate text-lg font-extrabold tracking-tight">{name}</h2>
            <p className="text-moa-subtle mt-0.5 text-xs font-mono">USER #{userId}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-6 py-5">
        <Row label="나이" value={`${age}세`} />
        <Row label="생일" value={formatDate(birthDate)} />
        <Row label="성별" value={genderLabel(gender)} />
        <Row label="Role" value={roleLabel(role)} />
        <Row label="Status" value={statusLabel(status)} />
        <Row label="가입일" value={formatDateTime(createDate)} />
      </div>
    </section>
  );
}

