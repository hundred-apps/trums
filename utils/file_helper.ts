import type { UploadRawFile, UploadStatus, UploadUserFile } from "element-plus";
import type { AppFile } from "~/types/file";

export async function urlToFile(
  url: string,
  filename: string,
  mimeType?: string
): Promise<UploadRawFile> {
  const response = await fetch(url);
  const blob = await response.blob();

  // buat File dari Blob
  const file = new File([blob], filename, {
    type: blob.type,
  });

  // tambahkan uid agar sesuai UploadRawFile
  const uploadRawFile = file as UploadRawFile;
  uploadRawFile.uid = Date.now();

  return uploadRawFile;
}

export const getFileUrl = (file: AppFile) => {
  const config = useRuntimeConfig();
  const imageUrl = config.public.baseImageURL;
  return `${imageUrl}/${file.image_path}/${file.filename}`;
};

export const getFirstFileUrl = (files: AppFile[]) => {
  const config = useRuntimeConfig();
  const imageUrl = config.public.baseImageURL;
  if (files != null && files!.length > 0) {
    return `${imageUrl}/${files![0].image_path}/${files![0].filename}`;
  } else {
    return "";
  }
};

export const mapAllAppFileToFileUri = (files: any[]) => {
  const baseUrl = useRuntimeConfig().public.baseImageURL;
  // sesuaikan dengan config kamu

  return files.map((file) => `${baseUrl}${file.image_path}/${file.filename}`);
};

export const mapApiFilesView = (files: any[]): UploadUserFile[] => {
  const baseUrl = useRuntimeConfig().public.baseImageURL;
  // sesuaikan dengan config kamu

  return files.map((file) => ({
    uid: file.unique_id,
    name: file.filename_original || file.filename,
    url: `${baseUrl}${file.image_path}/${file.filename}`,
    status: "success" as UploadStatus,
  }));
};

export const isValidUrl = (urlString: string): boolean => {
  if (!urlString.startsWith("blob:")) return true; // Non-blob URLs valid

  try {
    // Coba fetch URL untuk test validity
    fetch(urlString, { method: "HEAD", mode: "no-cors" });
    return true;
  } catch {
    return false;
  } finally {
    return false;
  }
};
