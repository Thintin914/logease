import { fetchServer } from "./fetchServer";

interface UploadUrlResponse {
  uploadUrl: string;
}

export async function getUploadUrl(key: string) {
  const response = await fetchServer<UploadUrlResponse>('/documents/upload-url', {
    method: 'POST',
    body: { 
      bucket: 'logease',
      key: key
    }
  });

  if (response.error || !response.data?.uploadUrl) {
    throw new Error(response.error || 'Failed to get upload URL');
  }

  return response.data.uploadUrl;
} 