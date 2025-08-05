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

// Cart Display Functions
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
            <td data-label="Image"><img src="${item.image}" alt="${item.name}"></td>
            <td data-label="Product">${item.name}</td>
            <td data-label="Description">${item.description}</td>
            <td data-label="Price" class="price">Ksh ${item.price.toFixed(2)}</td>
            <td data-label="Quantity">
                <div class="quantity-controls">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease" ${item.quantity === 1 ? 'disabled' : ''}>-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
            </td>
            <td data-label="Total" class="total">Ksh ${(item.price * item.quantity).toFixed(2)}</td>
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

// Search Products
function searchProducts() {
    const searchInput = document.querySelector('#search-input');
    const products = document.querySelectorAll('.product');
    if (!searchInput || !products.length) return;

    const searchTerm = searchInput.value.toLowerCase().trim();

    products.forEach(product => {
        const name = product.dataset.name.toLowerCase();
        const description = product.dataset.description.toLowerCase();
        product.style.display = (name.includes(searchTerm) || description.includes(searchTerm)) ? 'block' : 'none';
    });
}


document.addEventListener('DOMContentLoaded', () => {
  const searchToggle = document.querySelector('.search-toggle');
  const searchBarContainer = document.querySelector('.search-bar-container');

  searchToggle.addEventListener('click', () => {
    // Toggle visibility
    if (searchBarContainer.style.display === 'block') {
      searchBarContainer.style.display = 'none';
    } else {
      searchBarContainer.style.display = 'block';
      // Focus the input when shown
      searchBarContainer.querySelector('input').focus();
    }
  });
});


// Slideshow Functionality
document.addEventListener("DOMContentLoaded", () => {
    const slideshow = document.querySelector(".slideshow");
    const slides = document.querySelectorAll(".slideshow li");
    const slideCount = slides.length;
    let currentIndex = 0;

    // Clone first slide and append it to end for smooth loop
    const firstClone = slides[0].cloneNode(true);
    slideshow.appendChild(firstClone);

    function goToSlide(index) {
        slideshow.style.transition = "transform 0.6s ease-in-out";
        slideshow.style.transform = `translateX(-${index * 100}%)`;
    }

    function nextSlide() {
        currentIndex++;
        goToSlide(currentIndex);

        // Loop back to start (after clone)
        if (currentIndex === slideCount) {
            setTimeout(() => {
                slideshow.style.transition = "none";
                slideshow.style.transform = "translateX(0)";
                currentIndex = 0;
            }, 600); // match transition duration
        }
    }

    // Auto-slide
    setInterval(nextSlide, 4000);
});



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

    // Search Functionality
    const searchInput = document.querySelector('#search-input');
    const searchIcon = document.querySelector('.search-bar .fa-search');
    if (searchInput && searchIcon) {
        searchIcon.addEventListener('click', searchProducts);
        searchInput.addEventListener('input', searchProducts);
    }

    // Initialize Page-Specific Logic
    updateCart();
    if (window.location.pathname.includes('cart.html')) {
        displayCartItems();
    }
    if (window.location.pathname.includes('homepage.html')) {
        initSlideshow();
    }
});






document.addEventListener("DOMContentLoaded", () => {
    // Toggle Mobile Menu
    const nav = document.querySelector(".navbar");
    const mobileToggleBtn = document.createElement("button");
    mobileToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileToggleBtn.classList.add("mobile-menu-toggle");

    document.querySelector("header").insertBefore(mobileToggleBtn, nav);

    mobileToggleBtn.addEventListener("click", () => {
        nav.classList.toggle("active");
        mobileToggleBtn.classList.toggle("open");
        mobileToggleBtn.innerHTML = mobileToggleBtn.classList.contains("open")
            ? '<i class="fas fa-times"></i>'
            : '<i class="fas fa-bars"></i>';
    });

    // Close menu on link click (mobile)
    document.querySelectorAll(".navbar a").forEach(link => {
        link.addEventListener("click", () => {
            if (nav.classList.contains("active")) {
                nav.classList.remove("active");
                mobileToggleBtn.classList.remove("open");
                mobileToggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    // Cart Functionality
    let cartCount = 0;
    const cartCountElement = document.getElementById("cart-count");

    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            cartCount++;
            cartCountElement.textContent = cartCount;
            button.textContent = "Added!";
            setTimeout(() => {
                button.textContent = "Add to Cart";
            }, 1000);
        });
    });

    // Search (Basic Implementation)
    const searchInput = document.getElementById("search-input");
    const products = document.querySelectorAll(".product");

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();

        products.forEach(product => {
            const name = product.dataset.name.toLowerCase();
            product.style.display = name.includes(query) ? "block" : "none";
        });
    });

    // Contact Form Submission (front-end only)
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", e => {
            e.preventDefault();
            alert("Thank you for reaching out. We'll get back to you soon!");
            contactForm.reset();
        });
    }

});
