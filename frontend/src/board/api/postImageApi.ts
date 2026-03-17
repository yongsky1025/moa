import api from '../../users/utils/jwtUtil';

export interface PostTempImageUploadResponse {
  imageId: number;
  tempKey: string;
  imageUrl: string;
  ord: number;
}

export const postImageApi = {
  async uploadTempImage(
    file: File,
    tempKey: string,
    ord: number,
  ): Promise<PostTempImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tempKey', tempKey);
    formData.append('ord', String(ord));

    const response = await api.post('/api/post-images/temp', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data as PostTempImageUploadResponse;
  },
};

