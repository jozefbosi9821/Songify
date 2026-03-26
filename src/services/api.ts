import { CONFIG } from '../config';

const API_URL = CONFIG.BACKEND.URL;

export const api = {
    async login(username: string, password: string) {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        return data;
    },

    async register(username: string, password: string) {
        const response = await fetch(`${API_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        return data;
    },

    async syncLibrary(libraryData: any) {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_URL}/api/sync`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ data: libraryData })
        });
        
        if (!response.ok) throw new Error('Sync failed');
        return await response.json();
    },

    async logPlay(song: { id: string, title: string, artist: string }) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/play`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    songId: song.id,
                    title: song.title,
                    artist: song.artist
                })
            });

            if (res.status === 401) {
                // Token invalid or user deleted
                this.logout();
                window.location.reload();
            }
        } catch (err) {
            console.error('Failed to log play:', err);
        }
    },

    async getLibrary() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await fetch(`${API_URL}/api/sync`, {
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) return null;
        const result = await response.json();
        return result.data;
    },

    async getStats() {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/api/me/stats`, {
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });

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
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const response = await fetch(`${API_URL}/api/me/password`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ password, newPassword })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to change password');
        return data;
    },

    async updateAvatar(file: File) {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const formData = new FormData();
        formData.append('avatar', file);

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

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

   getUsername() {
        return localStorage.getItem('username');
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
