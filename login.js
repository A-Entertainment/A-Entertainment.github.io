
/* =========================================================
   A - ENTERTAINMENT
   LOGIN
========================================================= */

import { auth } from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/* =========================================================
   DOM
========================================================= */

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginButton =
    document.getElementById("loginButton");

const loginMessage =
    document.getElementById("loginMessage");

const togglePassword =
    document.getElementById("togglePassword");

const forgotPassword =
    document.getElementById("forgotPassword");


/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(auth, user => {

    if (user) {

        window.location.replace("admin.html");

    }

});


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            showMessage(
                "Please enter your email and password.",
                "error"
            );

            return;

        }


        setLoading(true);


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            showMessage(
                "Login successful. Redirecting...",
                "success"
            );


            setTimeout(() => {

                window.location.replace(
                    "admin.html"
                );

            }, 500);


        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            showMessage(
                getAuthError(error),
                "error"
            );


        } finally {

            setLoading(false);

        }

    }
);


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

if (togglePassword) {

    togglePassword.addEventListener(
        "click",
        () => {

            const isPassword =
                passwordInput.type === "password";


            passwordInput.type =
                isPassword
                    ? "text"
                    : "password";


            togglePassword.textContent =
                isPassword
                    ? "Hide"
                    : "Show";

        }
    );

}


/* =========================================================
   FORGOT PASSWORD
========================================================= */

if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            const email =
                emailInput.value.trim();


            if (!email) {

                showMessage(
                    "Enter your email address first.",
                    "error"
                );

                emailInput.focus();

                return;

            }


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                showMessage(
                    "Password reset email sent.",
                    "success"
                );


            } catch (error) {

                console.error(
                    "Password reset error:",
                    error
                );


                showMessage(
                    getAuthError(error),
                    "error"
                );

            }

        }
    );

}


/* =========================================================
   LOADING
========================================================= */

function setLoading(loading) {

    loginButton.disabled =
        loading;


    loginButton.textContent =
        loading
            ? "Signing in..."
            : "Login";

}


/* =========================================================
   MESSAGE
========================================================= */

function showMessage(
    message,
    type
) {

    loginMessage.textContent =
        message;


    loginMessage.className =
        `login-message ${type}`;

}


/* =========================================================
   FIREBASE AUTH ERRORS
========================================================= */

function getAuthError(error) {

    switch (error.code) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/invalid-email":
            return "Please enter a valid email address.";

        case "auth/user-not-found":
            return "No account found with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        default:
            return (
                error.message ||
                "Login failed. Please try again."
            );

    }

}

