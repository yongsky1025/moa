import axios from "axios";
import api from "./axiosInstance";

export interface UploadUrlRequest {
  domain: string;
  fileName: string;
  contentType: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  thumbnailUrl?: string;
  thumbnailKey?: string;
  method: string;
}

export async function requestUploadUrl(payload: UploadUrlRequest): Promise<UploadUrlResponse> {
  const response = await api.post<UploadUrlResponse>("/api/images/upload-url", payload);
  return response.data;
}

export async function uploadByContract(metadata: UploadUrlResponse, file: File): Promise<void> {
  const method = (metadata.method || "POST").toUpperCase();

  if (method === "POST") {
    const formData = new FormData();
    formData.append("file", file);
    await uploadRequest(metadata.uploadUrl, "POST", formData);
    return;
  }

  if (method === "PUT") {
    await uploadRequest(metadata.uploadUrl, "PUT", file, {
      "Content-Type": file.type || "application/octet-stream",
    });
    return;
  }

  throw new Error(`지원하지 않는 업로드 메서드입니다: ${metadata.method}`);
}

async function uploadRequest(
  uploadUrl: string,
  method: "POST" | "PUT",
  data: FormData | File,
  extraHeaders: Record<string, string> = {},
): Promise<void> {
  const headers = {
    ...extraHeaders,
    ...buildAuthHeaderIfNeeded(uploadUrl),
  };

  await axios.request({
    url: uploadUrl,
    method,
    data,
    headers,
  });
}

function buildAuthHeaderIfNeeded(url: string): Record<string, string> {
  if (!isInternalUrl(url)) {
    return {};
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

function isInternalUrl(url: string): boolean {
  if (url.startsWith("/")) {
    return true;
  }

  try {
    const target = new URL(url, window.location.origin);
    return target.origin === window.location.origin;
  } catch {
    return false;
  }
}
