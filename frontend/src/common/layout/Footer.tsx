export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#111',
        color: '#aaa',
        padding: '48px 0 32px',
        marginTop: 64,
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <div
          style={{
            display: 'flex',
            gap: 64,
            flexWrap: 'wrap',
            marginBottom: 40,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: 'white',
                letterSpacing: -0.5,
                marginBottom: 10,
              }}
            >
              moa
            </div>
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.8,
                margin: 0,
                color: '#888',
              }}
            >
              취향이 맞는 사람들과
              <br />
              특별한 경험을 함께하세요.
            </p>
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
                marginBottom: 12,
              }}
            >
              서비스
            </div>
            {['모임 찾기', '장소 추천', '커뮤니티', '에너지 테스트'].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#888',
                    textDecoration: 'none',
                    marginBottom: 8,
                  }}
                >
                  {item}
                </a>
              ),
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'white',
                marginBottom: 12,
              }}
            >
              회사
            </div>
            {['서비스 소개', '이용약관', '개인정보처리방침', '고객센터'].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: '#888',
                    textDecoration: 'none',
                    marginBottom: 8,
                  }}
                >
                  {item}
                </a>
              ),
            )}
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid #222',
            paddingTop: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
            © 2026 moa. All rights reserved.
          </p>
          <p style={{ margin: 0, fontSize: 12, color: '#555' }}>
            사업자등록번호 123-45-67890 | 대표 홍길동
          </p>
        </div>
      </div>
    </footer>
  );
}