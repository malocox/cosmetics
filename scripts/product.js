// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Cart Management Functions
// Update Cart Count
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('#cart-count');
    if (cartCountElement) cartCountElement.textContent = cartCount;
}

// Update Cart in Local Storage
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Add Item to Cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
    // Update Add to Cart Button to Show Tick
    const button = document.querySelector(`[data-id="${product.id}"].add-to-cart`);
    if (button) {
        button.textContent = '✓ Added';
        button.classList.add('added');
        setTimeout(() => {
            button.textContent = 'Add to Cart';
            button.classList.remove('added');
        }, 2000);
    }
}

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

    // Add to Cart
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const productElement = e.target.closest('.product');
            const product = {
                id: productElement.dataset.id,
                name: productElement.dataset.name,
                price: parseFloat(productElement.dataset.price),
                image: productElement.dataset.image,
                description: productElement.dataset.description
            };
            addToCart(product);
        }
    });

    // Initialize
    updateCartCount();
});


// Product Page Specific Logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart count
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('#cart-count');
    if (cartCountElement) cartCountElement.textContent = cartCount;
});