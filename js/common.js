function showToast(message, type = "success") {
    let toastContainer = document.getElementById("toastContainer");

    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toastContainer";
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, 3000);
}

function applySavedTheme() {
    const savedTheme =
        getStorageItem(STORAGE_KEYS.THEME) || "light";

    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    } else {
        document.body.classList.remove("dark-theme");
    }
}

function toggleTheme() {
    const isDark =
        document.body.classList.toggle("dark-theme");

    const theme = isDark ? "dark" : "light";

    setStorageItem(STORAGE_KEYS.THEME, theme);
}

function logout() {
    removeStorageItem(STORAGE_KEYS.SESSION);
    window.location.href = "index.html";
}

function setActiveNavigation() {
    const currentPage =
        window.location.pathname.split("/").pop();

    const navigationLinks =
        document.querySelectorAll(".nav-links a");

    navigationLinks.forEach(function (link) {
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

applySavedTheme();
setActiveNavigation();

const themeButton =
    document.getElementById("themeButton");

if (themeButton) {
    themeButton.addEventListener("click", toggleTheme);
}

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}