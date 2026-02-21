// ========================================
// TrendStore - Shopping Cart JavaScript
// ========================================

const Cart = {
    // Get cart items from localStorage
    getItems() {
        const cartData = localStorage.getItem('trendstore_cart');
        return cartData ? JSON.parse(cartData) : [];
    },

    // Save cart items to localStorage
    saveItems(items) {
        localStorage.setItem('trendstore_cart', JSON.stringify(items));
        this.updateCount();
    },

    // Add item to cart
    addItem(product, quantity = 1) {
        const items = this.getItems();
        const existingItem = items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity,
                image: product.images?.[0] || null
            });
        }

        this.saveItems(items);
        this.showNotification(`${product.name} added to cart!`);
    },

    // Remove item from cart
    removeItem(productId) {
        const items = this.getItems();
        const filtered = items.filter(item => item.id !== productId);
        this.saveItems(filtered);
    },

    // Update item quantity
    updateQuantity(productId, quantity) {
        const items = this.getItems();
        const item = items.find(item => item.id === productId);

        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveItems(items);
            }
        }
    },

    // Clear entire cart
    clear() {
        localStorage.removeItem('trendstore_cart');
        this.updateCount();
    },

    // Get cart total
    getTotal() {
        const items = this.getItems();
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    // Get cart item count
    getCount() {
        const items = this.getItems();
        return items.reduce((sum, item) => sum + item.quantity, 0);
    },

    // Update cart count in UI
    updateCount() {
        const countEl = document.getElementById('cart-count');
        if (countEl) {
            countEl.textContent = this.getCount();
        }
    },

    // Show notification
    showNotification(message) {
        // Simple notification (could be enhanced with a modal/toast)
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #51CF66;
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    },

    // Render cart items (for cart page)
    renderCart() {
        const cartItemsEl = document.getElementById('cart-items');
        const emptyCartEl = document.getElementById('empty-cart');
        const cartSummaryEl = document.getElementById('cart-summary');

        const items = this.getItems();

        if (items.length === 0) {
            if (cartItemsEl) cartItemsEl.style.display = 'none';
            if (emptyCartEl) emptyCartEl.style.display = 'block';
            if (cartSummaryEl) cartSummaryEl.style.display = 'none';
            return;
        }

        if (cartItemsEl) cartItemsEl.style.display = 'flex';
        if (emptyCartEl) emptyCartEl.style.display = 'none';
        if (cartSummaryEl) cartSummaryEl.style.display = 'block';

        // Render items
        if (cartItemsEl) {
            cartItemsEl.innerHTML = items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image"></div>
                    <div class="cart-item-details">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <div class="cart-item-controls">
                            <div class="qty-control">
                                <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                            <button class="remove-btn" onclick="Cart.removeItem('${item.id}'); Cart.renderCart();">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Update summary
        this.updateSummary();
    },

    // Update cart summary
    updateSummary() {
        const subtotal = this.getTotal();
        const shipping = subtotal >= 50 ? 0 : 5.99;
        const tax = (subtotal + shipping) * 0.08;
        const total = subtotal + shipping + tax;

        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');

        if (subtotalEl) subtotalEl.textContent = '$' + subtotal.toFixed(2);
        if (shippingEl) {
            shippingEl.textContent = shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2);
        }
        if (taxEl) taxEl.textContent = '$' + tax.toFixed(2);
        if (totalEl) totalEl.textContent = '$' + total.toFixed(2);

        // Update checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = '/checkout.html';
            });
        }
    },

    // Render checkout items
    renderCheckout() {
        const orderItemsEl = document.getElementById('order-items');
        const items = this.getItems();

        if (items.length === 0) {
            window.location.href = '/cart.html';
            return;
        }

        if (orderItemsEl) {
            orderItemsEl.innerHTML = items.map(item => `
                <div class="order-item">
                    <div>
                        <p class="order-item-name">${item.name}</p>
                        <p class="order-item-qty">Qty: ${item.quantity}</p>
                    </div>
                    <p>$${(item.price * item.quantity).toFixed(2)}</p>
                </div>
            `).join('');
        }

        // Update checkout summary
        const subtotal = this.getTotal();
        const shipping = 5.99;
        const tax = (subtotal + shipping) * 0.08;
        const total = subtotal + shipping + tax;

        const checkoutSubtotalEl = document.getElementById('checkout-subtotal');
        const checkoutShippingEl = document.getElementById('checkout-shipping');
        const checkoutTaxEl = document.getElementById('checkout-tax');
        const checkoutTotalEl = document.getElementById('checkout-total');

        if (checkoutSubtotalEl) checkoutSubtotalEl.textContent = '$' + subtotal.toFixed(2);
        if (checkoutShippingEl) checkoutShippingEl.textContent = '$' + shipping.toFixed(2);
        if (checkoutTaxEl) checkoutTaxEl.textContent = '$' + tax.toFixed(2);
        if (checkoutTotalEl) checkoutTotalEl.textContent = '$' + total.toFixed(2);
    }
};

// Initialize cart on page load
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateCount();

    // If on cart page, render cart
    if (document.getElementById('cart-items')) {
        Cart.renderCart();
    }

    // If on checkout page, render checkout
    if (document.getElementById('order-items')) {
        Cart.renderCheckout();
    }
});

// Make Cart available globally
window.Cart = Cart;

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
