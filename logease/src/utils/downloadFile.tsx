import { fetchServer } from "./fetchServer";

export async function downloadFile(key: string) {
  const response = await fetchServer<Blob>('/documents/downloads', {
    method: 'POST',
    responseType: 'blob',
    body: { 
      bucket: 'logease',
      key: key
    }
  });

  if (response.error || !response.data) {
    throw new Error(response.error || 'Failed to download document');
  }

  // Create a URL for the blob
  const url = window.URL.createObjectURL(response.data);
  
  // Create a temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = key; // Use the key as the filename
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL
  window.URL.revokeObjectURL(url);
}