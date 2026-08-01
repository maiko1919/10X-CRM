const signupForm =
    document.getElementById("signupForm");

function isValidEmail(email) {
    const atIndex = email.indexOf("@");
    const dotIndex = email.lastIndexOf(".");

    return (
        atIndex > 0 &&
        dotIndex > atIndex + 1 &&
        dotIndex < email.length - 1
    );
}

function isValidPassword(password) {
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return (
        password.length >= 8 &&
        hasLetter &&
        hasNumber
    );
}

if (signupForm) {
    signupForm.addEventListener(
        "submit",
        function (event) {
            event.preventDefault();

            const fullNameInput =
                document.getElementById("fullName");

            const emailInput =
                document.getElementById("email");

            const companyInput =
                document.getElementById("company");

            const passwordInput =
                document.getElementById("password");

            const confirmPasswordInput =
                document.getElementById(
                    "confirmPassword"
                );

            const fullName =
                fullNameInput.value.trim();

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const company =
                companyInput.value.trim();

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;

            const fullNameError =
                document.getElementById(
                    "fullNameError"
                );

            const emailError =
                document.getElementById(
                    "emailError"
                );

            const passwordError =
                document.getElementById(
                    "passwordError"
                );

            const confirmPasswordError =
                document.getElementById(
                    "confirmPasswordError"
                );

            fullNameError.textContent = "";
            emailError.textContent = "";
            passwordError.textContent = "";
            confirmPasswordError.textContent = "";

            let isValid = true;

            if (fullName.length < 3) {
                fullNameError.textContent =
                    "Full name must be at least 3 characters";

                isValid = false;
            }

            if (!isValidEmail(email)) {
                emailError.textContent =
                    "Please enter a valid email address";

                isValid = false;
            }

            if (!isValidPassword(password)) {
                passwordError.textContent =
                    "Password must be at least 8 characters and contain a letter and a number";

                isValid = false;
            }

            if (password !== confirmPassword) {
                confirmPasswordError.textContent =
                    "Passwords do not match";

                isValid = false;
            }

            const users =
                getStorageItem(
                    STORAGE_KEYS.USERS
                ) || [];

            const emailExists =
                users.some(function (user) {
                    return user.email === email;
                });

            if (emailExists) {
                emailError.textContent =
                    "An account with this email already exists";

                isValid = false;
            }

            if (!isValid) {
                return;
            }

            const newUser = {
                id: Date.now(),
                fullName: fullName,
                email: email,
                password: password,
                company: company,
                createdAt:
                    new Date().toISOString()
            };

            users.push(newUser);

            setStorageItem(
                STORAGE_KEYS.USERS,
                users
            );

            showToast(
                "Account created successfully! Please log in.",
                "success"
            );

            signupForm.reset();

            setTimeout(function () {
                window.location.href =
                    "index.html";
            }, 1500);
        }
    );
}