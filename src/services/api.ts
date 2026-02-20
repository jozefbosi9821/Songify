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
        if (!token) return null;

        const response = await fetch(`${API_URL}/api/me/stats`, {
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) return null;
        return await response.json();
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
    }
};
