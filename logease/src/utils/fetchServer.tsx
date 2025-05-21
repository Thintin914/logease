interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface ServerResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export async function fetchServer<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ServerResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
  } = options;

  try {
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'An error occurred',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Network error occurred',
      status: 500,
    };
  }
}

// Example usage:
/*
// Get signed URL
const getSignedUrl = async (bucket: string, key: string) => {
  const response = await fetchServer<{ signedUrl: string }>('/api/documents/url', {
    method: 'POST',
    body: { bucket, key },
  });
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data?.signedUrl;
};

// Download document
const downloadDocument = async (bucket: string, key: string) => {
  const response = await fetchServer<Blob>('/api/documents/download', {
    method: 'POST',
    body: { bucket, key },
  });
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response.data;
};
*/