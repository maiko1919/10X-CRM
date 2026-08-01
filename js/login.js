const loginForm =
    document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const emailInput =
                document.getElementById("email");

            const passwordInput =
                document.getElementById("password");

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const password =
                passwordInput.value;

            const emailError =
                document.getElementById(
                    "emailError"
                );

            const passwordError =
                document.getElementById(
                    "passwordError"
                );

            emailError.textContent = "";
            passwordError.textContent = "";

            let isValid = true;

            if (email === "") {
                emailError.textContent =
                    "Email is required";

                isValid = false;
            }

            if (password === "") {
                passwordError.textContent =
                    "Password is required";

                isValid = false;
            }

            if (!isValid) {
                return;
            }

            const users =
                getStorageItem(
                    STORAGE_KEYS.USERS
                ) || [];

            const user =
                users.find(function (item) {
                    return (
                        item.email === email &&
                        item.password === password
                    );
                });

            if (!user) {
                passwordError.textContent =
                    "Invalid email or password";

                return;
            }

            const session = {
                userId: user.id,
                email: user.email,
                loginAt:
                    new Date().toISOString()
            };

            setStorageItem(
                STORAGE_KEYS.SESSION,
                session
            );

            showToast(
                "Login successful!",
                "success"
            );

            setTimeout(function () {
                window.location.href =
                    "dashboard.html";
            }, 500);
        }
    );
}