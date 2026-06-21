// Secure storage with Electron fallback!

let isElectronCached: boolean | null = null;

export const secureStorage = {
  async isElectron(): Promise<boolean> {
    if (typeof window.electron === 'undefined') {
      return false;
    }
    if (isElectronCached === null) {
      try {
        isElectronCached = await window.electron.isElectron();
      } catch {
        isElectronCached = false;
      }
    }
    return isElectronCached !== null ? isElectronCached : false;
  },

  async set(key: string, value: string): Promise<void> {
    if (await this.isElectron() && window.electron) {
      await window.electron.secureStorageSet(key, value);
    } else {
      // Fallback to localStorage in web mode
      localStorage.setItem(key, value);
    }
  },

  async get(key: string): Promise<string | null> {
    if (await this.isElectron() && window.electron) {
      return window.electron.secureStorageGet(key);
    } else {
      return localStorage.getItem(key);
    }
  },

  async delete(key: string): Promise<void> {
    if (await this.isElectron() && window.electron) {
      await window.electron.secureStorageDelete(key);
    } else {
      localStorage.removeItem(key);
    }
  },
};
