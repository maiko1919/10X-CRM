function protectPage() {
    const session = getStorageItem(STORAGE_KEYS.SESSION);

    if (!session) {
        window.location.href = "index.html";
    }
}

function redirectAuthenticatedUser() {
    const session = getStorageItem(STORAGE_KEYS.SESSION);

    if (session) {
        window.location.href = "dashboard.html";
    }
}