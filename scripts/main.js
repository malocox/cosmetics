// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || []; // Single declaration of cart
window.cart = cart; // Expose cart to global scope for other scripts

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

// Cart Display Functions
// Display Cart Items
function displayCartItems() {
    const cartItemsContainer = document.querySelector('#cart-items');
    const cartTotalElement = document.querySelector('#cart-total');
    if (!cartItemsContainer || !cartTotalElement) return;

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

    // Add Event Listeners for Quantity and Remove
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

// Update Quantity
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

// Remove Item from Cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
}

// Proceed to Payment
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
    const products = document.querySelectorAll('.product');

    if (!searchInput || !searchResults) return;

    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    searchResults.classList.remove('active');

    if (query.length < 1) {
        products.forEach(product => product.style.display = 'block');
        return;
    }

    // Filter products on current page
    products.forEach(product => {
        const name = product.dataset.name.toLowerCase();
        const description = product.dataset.description.toLowerCase();
        const isMatch = name.includes(query) || description.includes(query);
        product.style.display = isMatch ? 'block' : 'none';
        if (isMatch) {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            const words = product.dataset.name.split(' ');
            const highlightedName = words
                .map(word => {
                    const lowerWord = word.toLowerCase();
                    return lowerWord.includes(query) ? `<span class="highlight">${word}</span>` : word;
                })
                .join(' ');
            resultItem.innerHTML = `
                <img src="${product.dataset.image}" alt="${product.dataset.name}">
                <span>${highlightedName} - Ksh ${product.dataset.price}</span>
            `;
            resultItem.addEventListener('click', () => {
                product.scrollIntoView({ behavior: 'smooth' });
                product.style.border = '2px solid #28a745';
                setTimeout(() => {
                    product.style.border = '';
                }, 2000);
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
                searchInput.value = '';
            });
            searchResults.appendChild(resultItem);
        }
    });

    // Fetch products from other categories
    const categories = ['skincare', 'haircare', 'deodorants', 'beautytool'];
    let allProducts = [];

    for (const category of categories) {
        try {
            const response = await fetch(`../pages/${category}.html`);
            const text = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');
            const categoryProducts = doc.querySelectorAll('.product');
            categoryProducts.forEach(product => {
                const id = product.getAttribute('data-id');
                const name = product.getAttribute('data-name').toLowerCase();
                const description = product.getAttribute('data-description').toLowerCase();
                if (name.includes(query) || description.includes(query)) {
                    allProducts.push({
                        id,
                        name: product.getAttribute('data-name'),
                        image: product.getAttribute('data-image'),
                        price: product.getAttribute('data-price'),
                        url: `../pages/${category}.html#${id}`
                    });
                }
            });
        } catch (error) {
            console.error(`Error fetching ${category}.html:`, error);
        }
    }

    // Include index.html (Beauty Tools) in search
    try {
        const response = await fetch(`../index.html`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const categoryProducts = doc.querySelectorAll('.product');
        categoryProducts.forEach(product => {
            const id = product.getAttribute('data-id');
            const name = product.getAttribute('data-name').toLowerCase();
            const description = product.getAttribute('data-description').toLowerCase();
            if (name.includes(query) || description.includes(query)) {
                allProducts.push({
                    id,
                    name: product.getAttribute('data-name'),
                    image: product.getAttribute('data-image'),
                    price: product.getAttribute('data-price'),
                    url: `../index.html#${id}`
                });
            }
        });
    } catch (error) {
        console.error('Error fetching index.html:', error);
    }

    // Display dropdown results from other categories
    allProducts.forEach(product => {
        if (!document.querySelector(`[data-id="${product.id}"]`)) {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            const words = product.name.split(' ');
            const highlightedName = words
                .map(word => {
                    const lowerWord = word.toLowerCase();
                    return lowerWord.includes(query) ? `<span class="highlight">${word}</span>` : word;
                })
                .join(' ');
            resultItem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <span>${highlightedName} - Ksh ${product.price}</span>
            `;
            resultItem.addEventListener('click', () => {
                window.location.href = product.url;
                setTimeout(() => {
                    const element = document.getElementById(product.id);
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
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
    const slideCount = slides.length;
    let currentIndex = 0;

    if (slideshow && slides.length) {
        const firstClone = slides[0].cloneNode(true);
        slideshow.appendChild(firstClone);

        function goToSlide(index) {
            slideshow.style.transition = 'transform 0.6s ease-in-out';
            slideshow.style.transform = `translateX(-${index * 100}%)`;
        }

        function nextSlide() {
            currentIndex++;
            goToSlide(currentIndex);
            if (currentIndex === slideCount) {
                setTimeout(() => {
                    slideshow.style.transition = 'none';
                    slideshow.style.transform = 'translateX(0)';
                    currentIndex = 0;
                }, 600);
            }
        }

        setInterval(nextSlide, 4000);
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
            if (searchBarContainer.style.display === 'block') {
                searchBarContainer.querySelector('input').focus();
            }
        });
    }

    // Mobile Menu Toggle
    const nav = document.querySelector('.navbar');
    const mobileToggleBtn = document.createElement('button');
    mobileToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileToggleBtn.classList.add('mobile-menu-toggle');
    if (nav) {
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

    // Add to Cart (Single event listener)
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
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
            } else {
                console.warn('Product element not found for button:', button);
            }
        });
    });

    // Search Input
    const searchInput = document.querySelector('#search-input');
    const clearSearch = document.querySelector('#clear-search');
    if (searchInput) {
        searchInput.addEventListener('input', searchProducts);
    }
    if (clearSearch) {
        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            const searchResults = document.querySelector('#search-results');
            if (searchResults) {
                searchResults.classList.remove('active');
                searchResults.innerHTML = '';
            }
            const products = document.querySelectorAll('.product');
            products.forEach(product => product.style.display = 'block');
        });
    }

    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            alert('Thank you for reaching out. We\'ll get back to you soon!');
            contactForm.reset();
        });
    }

    // Star Rating
    const stars = document.querySelectorAll('#starRating i');
    const ratingValue = document.getElementById('ratingValue');
    if (stars && ratingValue) {
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const selected = parseInt(star.dataset.value);
                stars.forEach((s, i) => {
                    s.className = i < selected ? 'fa-solid fa-star' : 'fa-regular fa-star';
                });
                ratingValue.textContent = selected === 5 ? '4.5' : selected;
                if (selected === 5) stars[4].className = 'fa-solid fa-star-half-stroke';
            });
        });
    }

    // Initialize
    updateCart();
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
    initializeSlideshow();
});

// Expose functions for use in other scripts (e.g., cart.html)
window.updateCart = updateCart;
window.displayCartItems = displayCartItems;
window.proceedToPayment = proceedToPayment;
