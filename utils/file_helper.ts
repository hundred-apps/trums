import type { UploadRawFile } from "element-plus";

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
