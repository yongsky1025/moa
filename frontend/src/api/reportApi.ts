import api from './axiosInstance';

export type ReportTargetType = 'USER' | 'POST' | 'REPLY' | 'CIRCLE' | 'CHAT_MESSAGE';

export type ReportCategory =
  | 'SPAM'
  | 'OBSCENE'
  | 'ABUSE'
  | 'FRAUD'
  | 'PRIVACY'
  | 'INAPPROPRIATE'
  | 'OTHER';

export interface ReportRequest {
  targetType: ReportTargetType;
  targetId: number;
  category: ReportCategory;
  description: string;
}

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  SPAM: '스팸/도배',
  OBSCENE: '음란/불건전',
  ABUSE: '욕설/혐오',
  FRAUD: '사기/허위정보',
  PRIVACY: '개인정보 침해',
  INAPPROPRIATE: '부적절한 콘텐츠',
  OTHER: '기타',
};

export const reportApi = {
  submit: (dto: ReportRequest) =>
    api.post('/api/admin/reports', dto),
};
