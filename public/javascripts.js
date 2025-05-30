// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements with null checks
const elements = {
    miniCartItems: document.getElementById('mini-cart-items'),
    miniCartTotal: document.getElementById('mini-cart-total'),
    miniCart: document.getElementById('mini-cart'),
    miniCartOverlay: document.getElementById('mini-cart-overlay'),
    cartCountMobile: document.getElementById('cart-count-mobile'),
    cartCountDesktop: document.getElementById('cart-count-desktop'),
    selectionPopup: document.getElementById('selection-popup'),
    selectionPopupOverlay: document.getElementById('selection-popup-overlay'),
    confirmSelection: document.getElementById('confirm-selection'),
    cancelSelection: document.getElementById('cancel-selection'),
    closeMiniCart: document.getElementById('close-mini-cart'),
    orderNow: document.getElementById('order-now-btn')
};

// Check for missing DOM elements
for (const [key, el] of Object.entries(elements)) {
    if (!el) console.error(`Element not found: ${key}`);
}

// Carousel functionality
document.querySelectorAll('.carousel').forEach(carousel => {
    const images = carousel.querySelectorAll('img');
    if (!images.length) {
        console.warn('No images in carousel:', carousel);
        return;
    }
    let currentIndex = 0;
    images[currentIndex].classList.add('active');
    carousel.addEventListener('click', () => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');
    });
});

// Cart management
let pendingItem = null;
let selectedSize = null;
let selectedColor = null;

function saveCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('Cart saved:', cart);
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

function updateCart() {
    if (!elements.miniCartItems || !elements.miniCartTotal || !elements.cartCountMobile || !elements.cartCountDesktop) {
        console.error('Cart display elements missing');
        return;
    }

    elements.miniCartItems.innerHTML = '';
    let total = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            <span>${item.name} (Size: ${item.size}, Color: ${item.color})</span>
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
        elements.miniCartItems.appendChild(li);
        total += item.price * item.qty;
        totalItems += item.qty;
    });

    elements.miniCartTotal.textContent = total;
    elements.cartCountMobile.textContent = totalItems;
    elements.cartCountDesktop.textContent = totalItems;
    saveCart();
    console.log('Cart updated. Total: R', total, 'Items:', totalItems);
}

// Add to cart
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        pendingItem = {
            name: button.dataset.name,
            price: parseInt(button.dataset.price),
            qty: 1
        };
        console.log('Add to cart:', pendingItem);
        if (elements.selectionPopup && elements.selectionPopupOverlay) {
            elements.selectionPopup.classList.add('show');
            elements.selectionPopupOverlay.classList.add('show');
            selectedSize = null;
            selectedColor = null;
            document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
            document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
        }
    });
});

// Size and color selection
document.querySelectorAll('.size-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedSize = button.dataset.size;
        console.log('Size:', selectedSize);
    });
});

document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedColor = button.dataset.color;
        console.log('Color:', selectedColor);
    });
});

// Confirm selection
if (elements.confirmSelection) {
    elements.confirmSelection.addEventListener('click', () => {
        if (!selectedSize || !selectedColor) {
            alert('Please select a size and color.');
            console.warn('Incomplete selection:', { size: selectedSize, color: selectedColor });
            return;
        }

        const itemId = `${pendingItem.name}-${selectedSize}-${selectedColor}`;
        const existing = cart.find(item => item.id === itemId);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({
                id: itemId,
                name: pendingItem.name,
                price: pendingItem.price,
                qty: pendingItem.qty,
                size: selectedSize,
                color: selectedColor
            });
        }
        console.log('Added to cart:', cart[cart.length - 1]);
        elements.selectionPopup.classList.remove('show');
        elements.selectionPopupOverlay.classList.remove('show');
        pendingItem = null;
        updateCart();
    });
}

// Cancel selection
if (elements.cancelSelection) {
    elements.cancelSelection.addEventListener('click', () => {
        elements.selectionPopup.classList.remove('show');
        elements.selectionPopupOverlay.classList.remove('show');
        pendingItem = null;
        selectedSize = null;
        selectedColor = null;
        document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('selected'));
        document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
        console.log('Selection cancelled');
    });
}

// Show/hide mini cart
document.querySelectorAll('.cart-icon').forEach(cartIcon => {
    cartIcon.addEventListener('click', () => {
        if (elements.miniCart && elements.miniCartOverlay) {
            elements.miniCart.classList.add('show');
            elements.miniCartOverlay.classList.add('show');
            console.log('Mini cart opened');
        }
    });
});

if (elements.closeMiniCart) {
    elements.closeMiniCart.addEventListener('click', () => {
        elements.miniCart.classList.remove('show');
        elements.miniCartOverlay.classList.remove('show');
        console.log('Mini cart closed');
    });
}

// Quantity and remove handling
document.addEventListener('click', e => {
    const index = parseInt(e.target.dataset.index);
    if (isNaN(index) || !cart[index]) return;

    if (e.target.classList.contains('increase')) {
        cart[index].qty += 1;
        updateCart();
    } else if (e.target.classList.contains('decrease') && cart[index].qty > 1) {
        cart[index].qty -= 1;
        updateCart();
    } else if (e.target.classList.contains('remove-btn')) {
        cart.splice(index, 1);
        updateCart();
    }
});

// Order Now
if (elements.orderNow) {
    elements.orderNow.addEventListener('click', () => {
        if (!cart.length) {
            alert('Your cart is empty!');
            console.warn('Empty cart order attempt');
            return;
        }

        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const phoneNumber = document.getElementById('phone-number')?.value;

        if (!name || !email || !phoneNumber) {
            alert('Please fill in all required fields.');
            console.warn('Incomplete form:', { name, email, phoneNumber });
            return;
        }

        if (!/^(0|\+27)\d{9}$/.test(phoneNumber)) {
            alert('Please enter a valid phone number (e.g., +27123456789 or 0123456789).');
            console.warn('Invalid phone:', phoneNumber);
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address.');
            console.warn('Invalid email:', email);
            return;
        }

        const orderDetails = cart.map(item =>
            `${item.name} (Size: ${item.size}, Color: ${item.color}, Quantity: ${item.qty}, Price: R${item.price * item.qty})`
        ).join('\n');
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

        const data = {
            from_name: name,
            from_email: email,
            phone_number: phoneNumber,
            order_details: orderDetails,
            total: `R${total}`
        };

        console.log('Sending order to backend:', data);

        fetch('https://ll-dnlb.onrender.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                if (result.error) {
                    throw new Error(result.error);
                }
                alert('Your order has been submitted successfully! Our agents will contact you soon.');
                console.log('Order sent:', result.message);
                cart.length = 0;
                localStorage.removeItem('cart');
                document.getElementById('name').value = '';
                document.getElementById('email').value = '';
                document.getElementById('phone-number').value = '';
                updateCart();
                elements.miniCart.classList.remove('show');
                elements.miniCartOverlay.classList.remove('show');
            })
            .catch(error => {
                alert('Error submitting order. Please try again or contact support.');
                console.error('Backend error:', error);
            });
    });
}
app.use(cors({
    origin: 'https://ll-dnlb.onrender.com'
}));
// Initialize cart
updateCart();