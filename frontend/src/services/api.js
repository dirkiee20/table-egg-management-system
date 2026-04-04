import { apiClient, BASE_URL } from './apiClient';

export const api = {
  // --- Authentication ---
  auth: {
    login: async (credentials) => {
      // FastAPI OAuth2PasswordRequestForm expects URLSearchParams
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (!response.ok) {
        throw new Error('Invalid email or password');
      }

      const data = await response.json();
      localStorage.setItem('farm_token', data.access_token);
      
      // Immediately retrieve user profile bound to this token
      return api.auth.getCurrentUser();
    },
    logout: async () => {
      localStorage.removeItem('farm_token');
      localStorage.removeItem('farm_user');
    },
    getCurrentUser: async () => {
      const token = localStorage.getItem('farm_token');
      if (!token) return null;
      
      try {
        const user = await apiClient('/auth/me');
        localStorage.setItem('farm_user', JSON.stringify(user));
        return user;
      } catch (err) {
        // Token likely expired or invalid
        localStorage.removeItem('farm_token');
        localStorage.removeItem('farm_user');
        return null;
      }
    }
  },

  // --- Core Farm Modules ---
  flocks: {
    getAll: () => apiClient('/flocks'),
    create: (data) => apiClient('/flocks', { method: 'POST', body: JSON.stringify(data) })
  },
  feed: {
    getAll: () => apiClient('/feed'),
    create: (data) => apiClient('/feed', { method: 'POST', body: JSON.stringify(data) }),
    getForecast: (flockId) => apiClient(`/forecast/feed/${flockId}`)
  },
  production: {
    getAll: () => apiClient('/production'),
    create: (data) => apiClient('/production', { method: 'POST', body: JSON.stringify(data) })
  },
  eggInventory: {
    getSummary: () => apiClient('/inventory/summary')
  },
  sales: {
    getAll: () => apiClient('/sales'),
    create: (data) => apiClient('/sales', { method: 'POST', body: JSON.stringify(data) })
  },
  income: {
    getAll: () => apiClient('/income'),
    create: (data) => apiClient('/income', { method: 'POST', body: JSON.stringify(data) })
  },
  expenses: {
    getAll: () => apiClient('/expenses'),
    create: (data) => apiClient('/expenses', { method: 'POST', body: JSON.stringify(data) })
  },
  calendar: {
    getAll: () => apiClient('/calendar'),
    create: (data) => apiClient('/calendar', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiClient(`/calendar/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },
  vaccinations: {
    getAll: () => apiClient('/vaccinations'),
    create: (data) => apiClient('/vaccinations', { method: 'POST', body: JSON.stringify(data) })
  },
  hatchery: {
    getAll: () => apiClient('/hatchery'),
    create: (data) => apiClient('/hatchery', { method: 'POST', body: JSON.stringify(data) })
  },
  staff: {
    getAll: () => apiClient('/staff'),
    create: (data) => apiClient('/staff', { method: 'POST', body: JSON.stringify(data) })
  }
};
