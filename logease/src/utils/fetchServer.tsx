interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  responseType?: 'json' | 'blob';
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
    responseType = 'json',
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

    // Handle 204 No Content
    if (response.status === 204) {
      return { status: 204 };
    }

    if (!response.ok) {
      let errorData = {};
      try {
        // Only try to parse JSON if there is content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        }
      } catch {
        // Ignore JSON parse errors for empty or invalid bodies
      }
      return {
        error: (errorData as any).error || 'An error occurred',
        status: response.status,
      };
    }

    let data;
    if (responseType === 'blob') {
      data = await response.blob();
    } else {
      data = await response.json();
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