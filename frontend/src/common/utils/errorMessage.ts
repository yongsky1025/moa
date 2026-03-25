// 백엔드 ErrorResponseDTO: { status, error, message }
// Spring Boot 기본 에러 JSON: { timestamp, status, error, message, path }
// 둘 다 message 필드를 가지므로 통일해서 추출
export function getErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: { message?: string } | string } };
  const data = err.response?.data;
  if (!data) return '요청 실패';
  if (typeof data === 'string') return data;
  if (data.message) return data.message;
  return '요청 실패';
}
