/**
 * Base service for API requests
 *
 * This class provides a standardized way to make API requests to our backend.
 * It handles common concerns like error handling, authentication, and request formatting.
 */
export class ApiService {
  /**
   * Make a GET request to the specified endpoint
   */
  async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a POST request to the specified endpoint
   */
  async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a PUT request to the specified endpoint
   */
  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a PATCH request to the specified endpoint
   */
  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: this.getHeaders(),
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Make a DELETE request to the specified endpoint
   */
  async delete<T = any>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    return this.handleResponse<T>(response);
  }

  /**
   * Get common headers for all requests
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;

    const url = new URL(endpoint, window.location.origin);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * Handle API response and handle errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        if (errorData.message || errorData.error) {
          errorMessage = errorData.message || errorData.error;
        }
      } catch (e) {
        // If parsing JSON fails, use the default error message
      }

      // Special handling for auth errors
      if (response.status === 401) {
        // Could redirect to login or refresh token here
        console.warn('Authentication required');
      }

      throw new Error(errorMessage);
    }

    // For 204 No Content responses, return empty object
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }
}
