import type { AdminMainDTO, PostActivitySummaryDTO } from '../../../types/admin.types';

interface Props {
  mainData: AdminMainDTO | null;
  postData: PostActivitySummaryDTO | null;
  loading: boolean;
}

function fmtNum(n: number) {
  return n.toLocaleString('ko-KR');
}

const ACCENT_COLORS = [
  'border-t-blue-400',
  'border-t-emerald-400',
  'border-t-amber-400',
  'border-t-emerald-400',
  'border-t-rose-400',
  'border-t-violet-400',
];

function SkeletonCard({ accent }: { accent: string }) {
  return (
    <div className={`admin-card border-t-2 ${accent}`}>
      <div className="skeleton h-3.5 w-1/2 mb-3" />
      <div className="skeleton h-8 w-2/3 mb-2" />
      <div className="skeleton h-3 w-2/5" />
    </div>
  );
}

export default function KpiCards({ mainData, postData, loading }: Props) {
  const uc = mainData?.userCountDTO;
  const us = mainData?.userStatusDTO;
  const cs = mainData?.circleSummaryDTO;

  const joinRate = uc ? Math.round((uc.countJoinUser / uc.countTotalUser) * 100) : 0;
  const todayActivity = (postData?.todayPostCount ?? 0) + (postData?.todayReplyCount ?? 0);

  const cards = [
    {
      label: '전체 유저',
      value: uc ? fmtNum(uc.countTotalUser) : '-',
      sub: uc ? `남 ${uc.maleRatio}% · 여 ${uc.femaleRatio}%` : '',
    },
    {
      label: '모임 참여율',
      value: uc ? `${joinRate}%` : '-',
      sub: uc ? `${fmtNum(uc.countJoinUser)}명 참여 중` : '',
    },
    {
      label: '전체 모임 수',
      value: cs ? fmtNum(cs.circleCount) : '-',
      sub: cs ? `카테고리 ${cs.circleDataDTOs.length}개` : '',
    },
    {
      label: `${us?.month ?? '-'}월 신규 가입`,
      value: us ? fmtNum(us.signUpCount) : '-',
      sub: us ? `${us.month}월 ${us.date}일 기준` : '',
    },
    {
      label: `${us?.month ?? '-'}월 탈퇴`,
      value: us ? fmtNum(us.withdrawnCount) : '-',
      sub: us ? `순증 +${fmtNum(us.signUpCount - us.withdrawnCount)}명` : '',
    },
    {
      label: '오늘 활동',
      value: postData ? fmtNum(todayActivity) : '-',
      sub: postData
        ? `게시글 ${postData.todayPostCount} · 댓글 ${postData.todayReplyCount}`
        : '',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-6 gap-3.5 mb-4">
        {ACCENT_COLORS.map((accent, i) => <SkeletonCard key={i} accent={accent} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-3.5 mb-4">
      {cards.map((card, i) => (
        <div key={card.label} className={`admin-card border-t-2 ${ACCENT_COLORS[i]}`}>
          <p className="text-xs text-gray-400 mb-2">{card.label}</p>
          <p className="text-2xl font-black text-gray-900 tracking-tight leading-tight">{card.value}</p>
          <p className="text-xs text-gray-400 mt-1.5">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
