import Navbar from '../../common/layout/Navbar';
import Footer from '../../common/layout/Footer';

interface AdminDashboardPageProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
  isAdmin?: boolean;
}

export default function AdminDashboardPage1({
  isLoggedIn,
  onToggleLogin,
  isAdmin,
}: AdminDashboardPageProps) {
  return (
    <div
      style={{ minHeight: '100vh', backgroundColor: '#f7f7f8', color: '#111' }}
    >
      <Navbar
        isLoggedIn={isLoggedIn}
        // onToggleLogin={onToggleLogin}
        isAdmin={isAdmin}
      />

      <div
        style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 20px 80px' }}
      >
        <div style={{ marginBottom: 36 }}>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: '#111',
              letterSpacing: -0.5,
              margin: '0 0 6px',
            }}
          >
            관리자 페이지
          </h1>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
            moa 서비스 관리 대시보드
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 40,
          }}
        >
          {[
            { label: '전체 모임', value: '8', desc: '등록된 모임 수' },
            { label: '전체 회원', value: '1,240', desc: '가입 회원 수' },
            { label: '이번 달 신청', value: '324', desc: '이번 달 신청 건수' },
            { label: '등록 장소', value: '5', desc: '추천 장소 수' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: 'white',
                borderRadius: 14,
                border: '1px solid #ebebeb',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                padding: '24px 20px',
              }}
            >
              <div style={{ fontSize: 13, color: '#aaa', marginBottom: 8 }}>
                {stat.desc}
              </div>
              <div
                style={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: '#111',
                  letterSpacing: -1,
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}
        >
          {[
            {
              title: '모임 관리',
              items: [
                '모임 목록 보기',
                '모임 추가',
                '모임 수정/삭제',
                '신청 현황',
              ],
            },
            {
              title: '회원 관리',
              items: ['회원 목록', '회원 정보 수정', '탈퇴 처리', '권한 관리'],
            },
            {
              title: '장소 관리',
              items: ['장소 목록', '장소 추가', '장소 수정/삭제'],
            },
            {
              title: '콘텐츠 관리',
              items: ['배너 관리', '공지사항', '에너지 테스트 관리'],
            },
          ].map((section) => (
            <div
              key={section.title}
              style={{
                backgroundColor: 'white',
                borderRadius: 14,
                border: '1px solid #ebebeb',
                padding: '24px',
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: '#111',
                  marginBottom: 16,
                }}
              >
                {section.title}
              </div>
              {section.items.map((item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #f5f5f5',
                    fontSize: 14,
                    color: '#444',
                    textDecoration: 'none',
                  }}
                >
                  {item}
                  <span style={{ color: '#ccc', fontSize: 16 }}>›</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
