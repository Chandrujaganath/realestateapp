import { useAuth } from '@/contexts/auth-context';

export function useApi() {
  const auth = useAuth();
  
  const callApi = async (endpoint: string, method = 'GET', data = null) => {
    if (!auth.user) {
      throw new Error('User not authenticated');
    }
    
    // Get current token - this needs to match how tokens are stored in your auth context
    const token = await auth.user.getIdToken?.() || ''; // Safe access with fallback
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include',
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api/${endpoint}`, options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'API request failed');
    }
    
    return response.json();
  };
  
  return { callApi };
} 
