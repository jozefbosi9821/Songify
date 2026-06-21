import { CONFIG } from '../config';
import { secureStorage } from './secure-storage';

// Password validation helper functions
export const isValidPassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*()]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*())' };
  }
  return { valid: true, message: 'Password is strong' };
};

// Input sanitization helper
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// HTTPS check
const checkHttps = (url: string): boolean => {
  return url.startsWith('https://') || url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1');
};

const API_URL = CONFIG.BACKEND.URL;

if (!checkHttps(API_URL)) {
  console.warn('WARNING: API URL is not HTTPS! This is insecure!');
}

// Generate a unique device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};

// Track if we're already refreshing a token to avoid duplicate refreshes
let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }
  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      const refreshToken = await secureStorage.get('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_URL}/api/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh token');
      }

      await secureStorage.set('token', data.accessToken);
      return data.accessToken;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  let token = await secureStorage.get('token');

  const makeRequest = async (accessToken: string) => {
    const headers = new Headers(options.headers);
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return fetch(url, { ...options, headers });
  };

  let response = await makeRequest(token || '');

  // If unauthorized, try to refresh the token and retry once
  if (response.status === 401) {
    try {
      const newToken = await refreshAccessToken();
      response = await makeRequest(newToken);
    } catch (refreshError) {
      await api.logout();
      window.location.reload();
      throw refreshError;
    }
  }

  return response;
};

export const api = {
  async login(username: string, password: string) {
    const sanitizedUsername = sanitizeInput(username);
    const deviceId = getDeviceId();
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: sanitizedUsername, password, deviceId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Login failed');
    
    await secureStorage.set('token', data.accessToken);
    await secureStorage.set('refreshToken', data.refreshToken);
    await secureStorage.set('username', data.username);
    return data;
  },

  async register(username: string, email: string, password: string) {
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);
    const validation = isValidPassword(password);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: sanitizedUsername, email: sanitizedEmail, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async verifyEmail(token: string) {
    const response = await fetch(`${API_URL}/api/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Verification failed');
    return data;
  },

  async forgotPassword(email: string) {
    const sanitizedEmail = sanitizeInput(email);
    const response = await fetch(`${API_URL}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: sanitizedEmail })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to send reset email');
    return data;
  },

  async resetPassword(token: string, newPassword: string) {
    const validation = isValidPassword(newPassword);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const response = await fetch(`${API_URL}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  async syncLibrary(libraryData: any) {
    const response = await authenticatedFetch(`${API_URL}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: libraryData })
    });
    
    if (!response.ok) throw new Error('Sync failed');
    return await response.json();
  },

  async logPlay(song: { id: string, title: string, artist: string }) {
    try {
      const res = await authenticatedFetch(`${API_URL}/api/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          songId: song.id,
          title: song.title,
          artist: song.artist
        })
      });
      if (res.status === 401) {
        // Token invalid or user deleted, already handled by authenticatedFetch
      }
    } catch (err) {
      console.error('Failed to log play:', err);
    }
  },

  async getLibrary() {
    const response = await authenticatedFetch(`${API_URL}/api/sync`);

    if (!response.ok) return null;
    const result = await response.json();
    return result.data;
  },

  async getStats() {
    const response = await authenticatedFetch(`${API_URL}/api/me/stats`);

    if (!response.ok) {
      let body: any = null;
      try {
        body = await response.json();
      } catch {
        // Ignore JSON parse errors; we'll fall back to status text.
      }

      const serverError =
        (body && (body.error || body.message)) ||
        (typeof body === 'string' ? body : null) ||
        response.statusText ||
        'Request failed';

      const status = response.status;
      const isAuthError = status === 401 || status === 403;

      if (isAuthError) {
        await this.logout();
      }

      throw new Error(isAuthError ? 'Please sign in again to load stats.' : `Stats request failed: ${serverError}`);
    }

    return await response.json();
  },

  async getGlobalStats() {
    try {
      const response = await fetch(`${API_URL}/api/stats/global`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch global stats:', error);
      return null;
    }
  },

  async changePassword(password: string, newPassword: string) {
    const newPasswordValidation = isValidPassword(newPassword);
    if (!newPasswordValidation.valid) {
      throw new Error(newPasswordValidation.message);
    }

    const response = await authenticatedFetch(`${API_URL}/api/me/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, newPassword })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  },

  async updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = await secureStorage.get('token');
    const response = await fetch(`${API_URL}/api/me/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update avatar');
    return data;
  },

  async logout() {
    try {
      const refreshToken = await secureStorage.get('refreshToken');
      if (refreshToken) {
        await authenticatedFetch(`${API_URL}/api/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (e) {
      // Ignore logout errors, we still need to clear local storage
    }
    await secureStorage.delete('token');
    await secureStorage.delete('refreshToken');
    await secureStorage.delete('username');
  },

  async isAuthenticated() {
    const token = await secureStorage.get('token');
    return !!token;
  },

  async getUsername() {
    return await secureStorage.get('username');
  },

  async getChangelog() {
    try {
      const response = await fetch(`${API_URL}/api/changelog`);
      if (!response.ok) throw new Error('Failed to fetch changelog');
      return await response.json();
    } catch (error) {
      console.error('Error fetching changelog:', error);
      return { content: 'Failed to load changelog.' };
    }
  }
};
