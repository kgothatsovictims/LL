// Load cart from localStorage on page load
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const miniCartItemsEl = document.getElementById("mini-cart-items");
const miniCartTotalEl = document.getElementById("mini-cart-total");
const miniCartEl = document.getElementById("mini-cart");
const miniCartOverlayEl = document.getElementById("mini-cart-overlay");
const cartCountMobileEl = document.getElementById("cart-count-mobile");
const cartCountDesktopEl = document.getElementById("cart-count-desktop");

// Update cart count display (for both pages)
function updateCartCount() {
    let totalItems = 0;
    cart.forEach(item => {
        totalItems += item.qty;
    });
    if (cartCountMobileEl) cartCountMobileEl.textContent = totalItems;
    if (cartCountDesktopEl) cartCountDesktopEl.textContent = totalItems;
}

// Carousel Functionality (Click to Cycle Images, only on home page)
document.querySelectorAll('.carousel').forEach((carousel) => {
    const images = carousel.querySelectorAll('img');
    let currentIndex = 0;

    // Initialize first image as active
    images[currentIndex].classList.add('active');

    carousel.addEventListener('click', () => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    });
});

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Generate PayFast signature (if passphrase is set)
function generatePayFastSignature(data, passphrase) {
    // Sort data by key
    const sortedKeys = Object.keys(data).sort();
    let signatureString = '';
    sortedKeys.forEach(key => {
        if (data[key] !== '' && key !== 'signature') {
            signatureString += `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}&`;
        }
    });
    // Append passphrase if provided
    if (passphrase) {
        signatureString += `passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`;
    } else {
        signatureString = signatureString.slice(0, -1); // Remove trailing &
    }
    // Generate MD5 hash
    return md5(signatureString).toUpperCase();
}

// Update Cart Display (Mini Cart, only on home page)
function updateCart() {
    if (!miniCartItemsEl || !miniCartTotalEl) return; // Skip if not on home page

    miniCartItemsEl.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        // Mini Cart
        const miniLi = document.createElement('li');
        miniLi.className = 'list-group-item d-flex justify-content-between align-items-center';
        miniLi.innerHTML = `
            <span>${item.name}</span>
            <div class="d-flex align-items-center">
                <div class="quantity-input">
                    <button class="decrease" data-index="${index}">-</button>
                    <input type="number" value="${item.qty}" min="1" class="item-quantity" data-index="${index}" readonly>
                    <button class="increase" data-index="${index}">+</button>
                </div>
                <span class="ms-2">R${item.price * item.qty}</span>
                <button class="remove-btn ms-2" data-index="${index}">Remove</button>
            </div>
        `;
        miniCartItemsEl.appendChild(miniLi);

        total += item.price * item.qty;
        totalItems += item.qty;
    });

    miniCartTotalEl.textContent = total;
    // Update both cart count elements
    updateCartCount();
    
    // Update PayFast form amount
    const payfastAmountEl = document.getElementById('payfast-amount');
    if (payfastAmountEl) {
        payfastAmountEl.value = total.toFixed(2); // Set amount to cart total

        // Generate PayFast signature (replace 'YOUR_PASSPHRASE' with your actual passphrase or null if not used)
        const passphrase = 'YOUR_PASSPHRASE'; // Set to null if no passphrase is configured
        const payfastForm = document.getElementById('payfast-payment-form');
        if (payfastForm) {
            const formData = {
                merchant_id: payfastForm.querySelector('[name="merchant_id"]').value,
                merchant_key: payfastForm.querySelector('[name="merchant_key"]').value,
                return_url: payfastForm.querySelector('[name="return_url"]').value,
                cancel_url: payfastForm.querySelector('[name="cancel_url"]').value,
                amount: payfastAmountEl.value,
                item_name: payfastForm.querySelector('[name="item_name"]').value
            };
            const signature = generatePayFastSignature(formData, passphrase);
            let signatureInput = payfastForm.querySelector('[name="signature"]');
            if (!signatureInput) {
                signatureInput = document.createElement('input');
                signatureInput.type = 'hidden';
                signatureInput.name = 'signature';
                payfastForm.appendChild(signatureInput);
            }
            signatureInput.value = signature;
        }
    }

    // Save cart to localStorage after updating
    saveCart();
}

// Add to Cart (only on home page)
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const name = button.dataset.name;
        const price = parseInt(button.dataset.price);
        const qty = 1; // Default quantity when adding

        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ name, price, qty });
        }

        updateCart();
    });
});

// Quantity Input Handling (In Mini Cart, only on home page)
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('increase')) {
        const index = parseInt(e.target.dataset.index);
        cart[index].qty += 1;
        updateCart();
    }

    if (e.target.classList.contains('decrease')) {
        const index = parseInt(e.target.dataset.index);
        if (cart[index].qty > 1) {
            cart[index].qty -= 1;
            updateCart();
        }
    }

    if (e.target.classList.contains('remove-btn')) {
        const index = parseInt(e.target.dataset.index);
        cart.splice(index, 1);
        updateCart();
    }
});

// Show Mini Cart (On Cart Icon Click for both mobile and desktop)
document.querySelectorAll('.cart-icon').forEach(cartIcon => {
    cartIcon.addEventListener('click', () => {
        if (miniCartEl && miniCartOverlayEl) {
            miniCartEl.classList.add('show');
            miniCartOverlayEl.classList.add('show');
        }
    });
});

// Hide Mini Cart
const closeMiniCartBtn = document.getElementById('close-mini-cart');
if (closeMiniCartBtn) {
    closeMiniCartBtn.addEventListener('click', () => {
        if (miniCartEl && miniCartOverlayEl) {
            miniCartEl.classList.remove('show');
            miniCartOverlayEl.classList.remove('show');
        }
    });
}

// Checkout
const checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Validate contact info
        const email = document.getElementById('email').value;
        const phoneNumber = document.getElementById('phone-number').value;

        if (!email || !phoneNumber) {
            alert("Please fill in all required fields.");
            return;
        }

        // Basic phone number validation
        const phoneRegex = /^(0|\+27)\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            alert("Please enter a valid phone number (e.g., +27 123 456 789).");
            return;
        }

        alert("Please complete the payment by clicking the PayFast button below.");
        
        // Clear cart and localStorage after initiating checkout
        cart.length = 0;
        localStorage.removeItem('cart');
        updateCart();
    });
}

// MD5 function for signature generation (include a proper MD5 library in production)
function md5(string) {
    // Note: This is a placeholder. In production, include a proper MD5 library like:
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.19.0/js/md5.min.js"></script>
    // Then use: return md5(string);
    console.warn('MD5 function is a placeholder. Include an MD5 library for production.');
    return string; // Replace with actual MD5 implementation
}

// Initialize cart count on page load
updateCartCount();