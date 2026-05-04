const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://heartfelt-celebration-production.up.railway.app/api';

export const BASE_URL = configuredBaseUrl.replace(/\/+$/, '');

export const apiClient = async (endpoint, options = {}) => {
  const token = localStorage.getItem('farm_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Prevent infinite loop if already on login page
        if (window.location.pathname !== '/login') {
          localStorage.removeItem('farm_token');
          localStorage.removeItem('farm_user');
          window.location.href = '/login';
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API request failed with status ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("API Client Error:", error);
    throw error;
  }
};
