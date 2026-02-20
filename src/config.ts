export const CONFIG = {
    // Discord RPC
    DISCORD_CLIENT_ID: '1473719075006841007',

    // SoundCloud
    SOUNDCLOUD_CLIENT_ID: 'CkCiIyf14rHi27fhk7HxhPOzc85okfSJ', // Public ID (mimics browser)
    SOUNDCLOUD_CLIENT_SECRET: '', // Not needed for public ID flow 
    
    // Auto Update
    AUTO_UPDATE: {
        ENABLED: true,
        REPO_OWNER: 'jozefbosi9821',
        REPO_NAME: 'Songify',
        CHECK_INTERVAL: 1000 * 60 * 60, // 1 hour
    },

    // Backend
    BACKEND: {
        URL: 'http://212.227.64.179:12268', // Change this to your VPS IP/Domain
    }
};
