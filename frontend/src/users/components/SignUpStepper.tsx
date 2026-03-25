interface Props {
  currentStep: 2 | 3;
}

const steps = ['소셜 인증 완료', '추가 정보 입력', '온보딩'];

export default function SignUpStepper({ currentStep }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isDone = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={label} style={{ display: 'contents' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: isDone || isActive ? '#111' : '#e5e5e5',
                  color: isDone || isActive ? 'white' : '#aaa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {isDone ? '✓' : stepNum}
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: isActive ? '#111' : isDone ? '#555' : '#aaa',
                  fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginBottom: 18,
                  marginLeft: 6,
                  marginRight: 6,
                  backgroundColor: isDone ? '#111' : '#e5e5e5',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
