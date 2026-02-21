// ========================================
// TrendStore - Main App JavaScript
// ========================================

// Global App State
const App = {
    products: [],
    settings: {},

    // Initialize the app
    async init() {
        try {
            // Load data
            await this.loadProducts();
            await this.loadSettings();

            // Update cart count
            this.updateCartCount();

            console.log('TrendStore initialized');
        } catch (error) {
            console.error('Error initializing app:', error);
        }
    },

    // Load products from JSON
    async loadProducts() {
        try {
            const response = await fetch('/data/products.json');
            this.products = await response.json();
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    },

    // Load settings from JSON
    async loadSettings() {
        try {
            const response = await fetch('/data/settings.json');
            this.settings = await response.json();
            return this.settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    },

    // Update cart count in header
    updateCartCount() {
        const cartCountEl = document.getElementById('cart-count');
        if (cartCountEl) {
            const cart = Cart.getItems();
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountEl.textContent = count;
        }
    },

    // Format price
    formatPrice(price) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.settings.currency || 'USD'
        }).format(price);
    },

    // Format number
    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Make App available globally
window.App = App;
