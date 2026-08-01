document.addEventListener("DOMContentLoaded", () => {
    protectPage();
    applySavedTheme();
    setActiveNavigation();

    const profileAvatar = document.getElementById("profileAvatar");
    const profileFullName = document.getElementById("profileFullName");
    const profileEmail = document.getElementById("profileEmail");
    const profileCompany = document.getElementById("profileCompany");
    const profileMemberSince = document.getElementById(
        "profileMemberSince"
    );

    const profileForm = document.getElementById("profileForm");
    const fullNameInput = document.getElementById("fullName");
    const companyInput = document.getElementById("company");
    const fullNameError = document.getElementById("fullNameError");

    const passwordForm = document.getElementById("passwordForm");
    const currentPasswordInput = document.getElementById(
        "currentPassword"
    );
    const newPasswordInput = document.getElementById("newPassword");
    const confirmNewPasswordInput = document.getElementById(
        "confirmNewPassword"
    );

    const currentPasswordError = document.getElementById(
        "currentPasswordError"
    );
    const newPasswordError = document.getElementById(
        "newPasswordError"
    );
    const confirmNewPasswordError = document.getElementById(
        "confirmNewPasswordError"
    );

    const themeToggle = document.getElementById("themeToggle");
    const logoutButton = document.getElementById("logoutButton");
    const resetDataButton = document.getElementById("resetDataButton");

    function getCurrentUser() {
        const session = getStorageItem("crm_session");
        const users = getStorageItem("crm_users") || [];

        if (!session) {
            return null;
        }

        return users.find((user) => user.id === session.userId) || null;
    }

    function getInitials(fullName) {
        const nameParts = fullName
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (nameParts.length === 0) {
            return "?";
        }

        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }

        const firstInitial = nameParts[0].charAt(0);
        const lastInitial = nameParts[nameParts.length - 1].charAt(0);

        return `${firstInitial}${lastInitial}`.toUpperCase();
    }

    function formatMemberSince(createdAt) {
        if (!createdAt) {
            return "—";
        }

        const date = new Date(createdAt);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function renderProfile() {
        const currentUser = getCurrentUser();

        if (!currentUser) {
            removeStorageItem("crm_session");
            window.location.href = "index.html";
            return;
        }

        profileAvatar.textContent = getInitials(currentUser.fullName);
        profileFullName.textContent = currentUser.fullName;
        profileEmail.textContent = currentUser.email;
        profileCompany.textContent = currentUser.company || "—";
        profileMemberSince.textContent = formatMemberSince(
            currentUser.createdAt
        );

        fullNameInput.value = currentUser.fullName;
        companyInput.value = currentUser.company || "";
    }

    function clearProfileErrors() {
        fullNameError.textContent = "";
    }

    function clearPasswordErrors() {
        currentPasswordError.textContent = "";
        newPasswordError.textContent = "";
        confirmNewPasswordError.textContent = "";
    }

    profileForm.addEventListener("submit", (event) => {
        event.preventDefault();
        clearProfileErrors();

        const fullName = fullNameInput.value.trim();
        const company = companyInput.value.trim();

        if (fullName.length < 3) {
            fullNameError.textContent =
                "Full name must be at least 3 characters";
            return;
        }

        const session = getStorageItem("crm_session");
        const users = getStorageItem("crm_users") || [];

        const userIndex = users.findIndex(
            (user) => user.id === session.userId
        );

        if (userIndex === -1) {
            return;
        }

        users[userIndex] = {
            ...users[userIndex],
            fullName,
            company
        };

        setStorageItem("crm_users", users);

        renderProfile();
        showToast("Profile updated ✓");
    });

    passwordForm.addEventListener("submit", (event) => {
        event.preventDefault();
        clearPasswordErrors();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;

        const currentUser = getCurrentUser();

        if (!currentUser) {
            return;
        }

        if (currentPassword !== currentUser.password) {
            currentPasswordError.textContent =
                "Current password is incorrect";
            return;
        }

        const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

        if (!passwordPattern.test(newPassword)) {
            newPasswordError.textContent =
                "Password must be at least 8 characters and contain a letter and a number";
            return;
        }

        if (newPassword === currentUser.password) {
            newPasswordError.textContent =
                "New password must be different from the current one";
            return;
        }

        if (newPassword !== confirmNewPassword) {
            confirmNewPasswordError.textContent =
                "Passwords do not match";
            return;
        }

        const users = getStorageItem("crm_users") || [];

        const userIndex = users.findIndex(
            (user) => user.id === currentUser.id
        );

        if (userIndex === -1) {
            return;
        }

        users[userIndex] = {
            ...users[userIndex],
            password: newPassword
        };

        setStorageItem("crm_users", users);

        passwordForm.reset();
        showToast("Password changed ✓");
    });

    resetDataButton.addEventListener("click", async () => {
        const shouldReset = confirm("Reset all CRM client data?");

        if (!shouldReset) {
            return;
        }

        try {
            await resetClientsData();
            showToast("CRM data reset successfully ✓");
        } catch (error) {
            console.error("CRM reset failed:", error);
            showToast("Failed to reset CRM data");
        }
    });

    themeToggle.addEventListener("click", () => {
        toggleTheme();
    });

    logoutButton.addEventListener("click", () => {
        logout();
    });

    renderProfile();
});