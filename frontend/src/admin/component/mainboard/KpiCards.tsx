import type {
  AdminMainDTO,
  PostActivitySummaryDTO,
} from '../../types/adminTypes';

interface Props {
  mainData: AdminMainDTO | null;
  postData: PostActivitySummaryDTO | null;
  loading: boolean;
}

function fmtNum(n: number) {
  return n.toLocaleString('ko-KR');
}

const ACCENT_COLORS = [
  'border-t-[#D07856]',
  'border-t-[#F2935C]',
  'border-t-[#F2BB9B]',
  'border-t-[#B8643D]',
  'border-t-[#D07856]',
  'border-t-[#F24405]',
];

function SkeletonCard({ accent }: { accent: string }) {
  return (
    <div className={`admin-card border-t-2 ${accent}`}>
      <div className="skeleton mb-3 h-3.5 w-1/2" />
      <div className="skeleton mb-2 h-8 w-2/3" />
      <div className="skeleton h-3 w-2/5" />
    </div>
  );
}

export default function KpiCards({ mainData, postData, loading }: Props) {
  const uc = mainData?.userCountDTO;
  const us = mainData?.userStatusDTO;
  const cs = mainData?.circleSummaryDTO;

  const joinRate = uc
    ? Math.round((uc.countJoinUser / uc.countTotalUser) * 100)
    : 0;
  const todayActivity =
    (postData?.todayPostCount ?? 0) + (postData?.todayReplyCount ?? 0);

  const cards = [
    {
      label: '전체 유저',
      value: uc ? fmtNum(uc.countTotalUser) : '-',
      sub: uc ? `남 ${(+uc.maleRatio).toFixed(1)}% · 여 ${(+uc.femaleRatio).toFixed(1)}%` : '',
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
      <div className="mb-4 grid grid-cols-6 gap-3.5">
        {ACCENT_COLORS.map((accent, i) => (
          <SkeletonCard key={i} accent={accent} />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-4 grid grid-cols-6 gap-3.5">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`admin-card border-t-2 ${ACCENT_COLORS[i]}`}
        >
          <p className="mb-2 text-xs text-[#9B7B6A]">{card.label}</p>
          <p className="text-2xl leading-tight font-black tracking-tight text-[#262626]">
            {card.value}
          </p>
          <p className="mt-1.5 text-xs text-[#9B7B6A]">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
