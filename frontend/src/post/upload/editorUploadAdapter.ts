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

    return { default: metadata.fileUrl };
  }

  abort(): void {
    // axios abort는 현재 어댑터에서 사용하지 않음
  }

  private async requestUploadUrl(file: File) {
    try {
      return await requestUploadUrl({
        domain: this.domain,
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
      });
    } catch {
      throw new Error("업로드 URL 발급에 실패했습니다.");
    }
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
} as const;
