import { getUploadUrl } from "./getUploadUrl";

export async function uploadFile(file: File, key: string) {
  try {
    // Get the pre-signed URL for upload
    const uploadUrl = await getUploadUrl(key);
    
    // Upload the file using the pre-signed URL
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return true;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
} 