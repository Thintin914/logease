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

// Download document
export const downloadDocument = async (key: string) => {
  const url = await getSignedUrl(key);
  const link = document.createElement('a');
  link.href = url;
  link.download = key.split('/').pop() || 'document'; // Get filename from key
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Get URL for iframe or direct viewing
export const getDocumentUrl = async (key: string) => {
  return await getSignedUrl(key);
};