// Set backend URL
const backendURL = "https://visa-login-signup.onrender.com/api/auth";

// Switch Forms
function switchToSignup() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "block";
}

function switchToLogin() {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "block";
}

// Signup Form Submission
document.getElementById("signup").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const message = document.getElementById("signupMessage");

    const response = await fetch(`${backendURL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    message.textContent = data.message;
    message.style.color = response.ok ? "green" : "red";

    if (response.ok) setTimeout(() => switchToLogin(), 1000);
});

// Login Form Submission
document.getElementById("login").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    const response = await fetch(`${backendURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    message.textContent = data.message;
    message.style.color = response.ok ? "green" : "red";

    if (response.ok) {
        localStorage.setItem("token", data.token); // Store token
        setTimeout(() => window.location.href = "dashboard.html", 1000);
    }
});
