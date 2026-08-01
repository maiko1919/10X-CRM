const STORAGE_KEYS = {
    USERS: "crm_users",
    SESSION: "crm_session",
    CLIENTS: "crm_clients",
    THEME: "crm_theme"
};

function getStorageItem(key) {
    const data = localStorage.getItem(key);

    if (!data) {
        return null;
    }

    return JSON.parse(data);
}

function setStorageItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function removeStorageItem(key) {
    localStorage.removeItem(key);
}