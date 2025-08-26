// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
window.cart = cart; // Expose cart globally for cart.html

// Cart Management Functions
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.querySelector('#cart-count');
    if (cartCountElement) cartCountElement.textContent = cartCount;
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function addToCart(product) {
    // Debug log to identify if this function is called twice (potential double-add error)
    console.log('Adding to cart:', product);
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCart();
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

function displayCartItems() {
    // Debug log to check if cart is empty or undefined on Netlify (cart display error)
    console.log('Cart items:', cart);
    const cartItemsContainer = document.querySelector('#cart-items');
    const cartTotalElement = document.querySelector('#cart-total');
    if (!cartItemsContainer || !cartTotalElement) {
        console.error('Cart elements (#cart-items or #cart-total) not found');
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const itemElement = document.createElement('tr');
        itemElement.innerHTML = `
            <td data-label="Product">
                <div class="product-info">
                    <h3>${item.name}</h3>
                    <img src="${item.image}" alt="${item.name}">
                </div>
            </td>
            <td data-label="Details">
                <p>${item.description}</p>
                <p class="price">Ksh ${item.price}</p>
            </td>
            <td data-label="Quantity">
                <div class="quantity-controls">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease" ${item.quantity === 1 ? 'disabled' : ''}>-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
            </td>
            <td data-label="Action"><button class="remove-item" data-id="${item.id}">Remove</button></td>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    cartTotalElement.textContent = `Total: Ksh ${total.toFixed(2)}`;

    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            const action = button.dataset.action;
            updateQuantity(id, action === 'increase' ? 1 : -1);
        });
    });

    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.dataset.id;
            removeFromCart(id);
        });
    });
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== id);
        }
        updateCart();
        if (window.location.pathname.includes('cart.html')) {
            displayCartItems();
        }
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
}

function proceedToPayment() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    window.location.href = 'payments.html';
}

// Search Functionality
async function searchProducts() {
    const searchInput = document.querySelector('#search-input');
    const searchResults = document.querySelector('#search-results');
    if (!searchInput || !searchResults) return;

    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    searchResults.classList.remove('active');

    if (query.length < 1) {
        document.querySelectorAll('.product').forEach(product => product.style.display = 'block');
        return;
    }

    document.querySelectorAll('.product').forEach(product => {
        const name = product.dataset.name.toLowerCase();
        const isMatch = name.includes(query);
        product.style.display = isMatch ? 'block' : 'none';
        if (isMatch) {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `<span>${product.dataset.name} - Ksh ${product.dataset.price}</span>`;
            resultItem.addEventListener('click', () => {
                product.scrollIntoView({ behavior: 'smooth' });
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
                searchInput.value = '';
            });
            searchResults.appendChild(resultItem);
        }
    });

    if (searchResults.children.length > 0) {
        searchResults.classList.add('active');
    }
}

// Slideshow Functionality
function initializeSlideshow() {
    const slideshow = document.querySelector('.slideshow');
    const slides = document.querySelectorAll('.slideshow li');
    if (slideshow && slides.length) {
        let currentIndex = 0;
        setInterval(() => {
            currentIndex = (currentIndex + 1) % slides.length;
            slideshow.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 4000);
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const nav = document.querySelector('.navbar');
    if (nav) {
        const mobileToggleBtn = document.createElement('button');
        mobileToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggleBtn.classList.add('mobile-menu-toggle');
        document.querySelector('header').insertBefore(mobileToggleBtn, nav);
        mobileToggleBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileToggleBtn.classList.toggle('open');
            mobileToggleBtn.innerHTML = mobileToggleBtn.classList.contains('open')
                ? '<i class="fas fa-times"></i>'
                : '<i class="fas fa-bars"></i>';
        });

        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    mobileToggleBtn.classList.remove('open');
                    mobileToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Search Toggle
    const searchToggle = document.querySelector('.search-toggle');
    const searchBarContainer = document.querySelector('.search-bar-container');
    if (searchToggle && searchBarContainer) {
        searchToggle.addEventListener('click', () => {
            searchBarContainer.style.display = searchBarContainer.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Add to Cart (Single event listener with 'once' to prevent double-add)
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productElement = button.closest('.product');
            if (productElement) {
                const product = {
                    id: productElement.dataset.id,
                    name: productElement.dataset.name,
                    price: parseFloat(productElement.dataset.price),
                    image: productElement.dataset.image,
                    description: productElement.dataset.description
                };
                addToCart(product);
            }
        }, { once: true }); // Ensures no duplicate listeners
    });

    // Search Input
    const searchInput = document.querySelector('#search-input');
    const clearSearch = document.querySelector('#clear-search');
    if (searchInput) searchInput.addEventListener('input', searchProducts);
    if (clearSearch) clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        const searchResults = document.querySelector('#search-results');
        if (searchResults) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
        }
        document.querySelectorAll('.product').forEach(product => product.style.display = 'block');
    });

    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            alert('Thank you for reaching out. We\'ll get back to you soon!');
            contactForm.reset();
        });
    }

    // Initialize
    updateCart();
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
    initializeSlideshow();
    toggleMobileMenu(); // Combined from product.js
});

// Expose functions for use in other scripts
window.updateCart = updateCart;
window.displayCartItems = displayCartItems;
window.proceedToPayment = proceedToPayment;