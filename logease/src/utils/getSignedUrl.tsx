import { fetchServer } from "./fetchServer";

interface SignedUrlResponse {
  signedUrl: string;
}

export async function getSignedUrl(key: string) {
  const response = await fetchServer<SignedUrlResponse>('/documents/url', {
    method: 'POST',
    body: { 
      bucket: 'logease',
      key: key
    }
  });

  if (response.error || !response.data?.signedUrl) {
    throw new Error(response.error || 'Failed to get signed URL');
  }

  return response.data.signedUrl;
}