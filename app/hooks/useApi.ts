import { useAuth } from '@/contexts/auth-context';

export function useApi() {
  const auth = useAuth();

  const callApi = async (_endpoint: string, method = 'GET', data = null) => {
    if (!auth.user) {
      throw new Error('User not authenticated');
    }

    // Get current token - this needs to match how tokens are stored in your auth context
    const _token = (await auth.user.getIdToken?.()) || ''; // Safe access with fallback

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${_token}`,
      },
      credentials: 'include',
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`/api/${_endpoint}`, options);

    if (!response.ok) {
      const _errorData = await response.json().catch(() => ({}));
      throw new Error(_errorData.error || 'API request failed');
    }

    return response.json();
  };

  return { callApi };
}
