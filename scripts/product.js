// product.js only handles page-specific functionality (e.g., hamburger menu)
// No cart-related code to avoid duplicate event listeners

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navbar = document.querySelector('.navbar');
    if (hamburger && navbar) {
        hamburger.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }
});