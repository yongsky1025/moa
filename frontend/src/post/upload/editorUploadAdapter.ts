import { requestUploadUrl, uploadByContract } from "../../api/uploadUrlApi";
import { Plugin, type Editor } from "ckeditor5";

interface EditorLoader {
  file: Promise<File | null>;
}

interface EditorUploadResult {
  default: string;
  [key: string]: unknown;
}

class UnifiedUploadAdapter {
  private readonly loader: EditorLoader;
  private readonly domain: string;

  constructor(loader: EditorLoader, domain: string) {
    this.loader = loader;
    this.domain = domain;
  }

  async upload(): Promise<EditorUploadResult> {
    const file = await this.loader.file;
    if (!file) {
      throw new Error("업로드할 파일이 없습니다.");
    }

    const metadata = await this.requestUploadUrl(file);
    await uploadByContract(metadata, file);

    return { default: resolveEditorImageUrl(metadata.fileUrl, metadata.key) };
  }

  abort(): void {
    // axios abort는 현재 어댑터에서 사용하지 않음
  }

  private async requestUploadUrl(file: File) {
    try {
      return await requestUploadUrl({
        domain: this.domain,
        fileName: resolveUploadFileName(file),
        contentType: resolveUploadContentType(file),
      });
    } catch {
      throw new Error("업로드 URL 발급에 실패했습니다.");
    }
  }
}

function resolveUploadFileName(file: File): string {
  const trimmed = (file.name ?? "").trim();
  if (trimmed) {
    return trimmed;
  }
  const ext = inferExtensionFromMime(file.type);
  return ext ? `upload.${ext}` : "upload.bin";
}

function resolveUploadContentType(file: File): string {
  const type = (file.type ?? "").trim().toLowerCase();
  if (type.startsWith("image/")) {
    return type;
  }

  const ext = extractExtension(file.name);
  const inferred = inferMimeFromExtension(ext);
  if (inferred) {
    return inferred;
  }

  return "image/png";
}

function resolveEditorImageUrl(fileUrl?: string, key?: string): string {
  const normalizedFileUrl = (fileUrl ?? "").trim();
  if (normalizedFileUrl) {
    const idx = normalizedFileUrl.indexOf("/uploads/");
    if (idx >= 0) {
      return normalizedFileUrl.substring(idx);
    }
    return normalizedFileUrl;
  }

  const normalizedKey = (key ?? "").replace(/^\/+/, "");
  if (normalizedKey) {
    return `/uploads/${normalizedKey}`;
  }

  throw new Error("업로드 결과 URL이 없습니다.");
}

function extractExtension(fileName?: string): string {
  const normalized = (fileName ?? "").trim().toLowerCase();
  const dotIndex = normalized.lastIndexOf(".");
  if (dotIndex < 0 || dotIndex === normalized.length - 1) {
    return "";
  }
  return normalized.substring(dotIndex + 1);
}

function inferMimeFromExtension(ext: string): string | null {
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "bmp":
      return "image/bmp";
    case "svg":
      return "image/svg+xml";
    default:
      return null;
  }
}

function inferExtensionFromMime(mime?: string): string {
  const normalized = (mime ?? "").trim().toLowerCase();
  switch (normalized) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "image/bmp":
      return "bmp";
    case "image/svg+xml":
      return "svg";
    default:
      return "";
  }
}

export function createEditorUploadAdapterPlugin(domain: string) {
  return class EditorUploadAdapterPlugin extends Plugin {
    static get pluginName() {
      return "EditorUploadAdapterPlugin";
    }

    init() {
      const fileRepository = (
        this.editor as Editor & {
          plugins: {
            get: (name: string) => {
              createUploadAdapter: (loader: EditorLoader) => UnifiedUploadAdapter;
            };
          };
        }
      ).plugins.get("FileRepository");

      fileRepository.createUploadAdapter = (loader: EditorLoader) =>
        new UnifiedUploadAdapter(loader, domain);
    }
  };
}

export const EDITOR_UPLOAD_DOMAINS = {
  POST: "post",
  PLACE: "place",
  SCHEDULE_REVIEW: "schedule_review",
} as const;
