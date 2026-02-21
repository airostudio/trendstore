// ========================================
// TrendStore - Products JavaScript
// ========================================

const Products = {
    allProducts: [],

    // Initialize products
    async init() {
        this.allProducts = await App.loadProducts();

        // Render products based on current page
        if (document.getElementById('trending-products')) {
            this.renderTrendingProducts();
        }

        if (document.getElementById('viral-products')) {
            this.renderViralProducts();
        }

        if (document.getElementById('products-grid')) {
            this.renderAllProducts();
        }

        // Update stats
        this.updateStats();
    },

    // Render trending products (homepage)
    renderTrendingProducts() {
        const container = document.getElementById('trending-products');
        if (!container) return;

        const trending = this.allProducts.filter(p => p.trending).slice(0, 4);
        container.innerHTML = trending.map(p => this.createProductCard(p)).join('');
    },

    // Render viral products (homepage)
    renderViralProducts() {
        const container = document.getElementById('viral-products');
        if (!container) return;

        const viral = this.allProducts.filter(p => p.viral).slice(0, 4);
        container.innerHTML = viral.map(p => this.createProductCard(p)).join('');
    },

    // Render all products (products page)
    renderAllProducts() {
        const container = document.getElementById('products-grid');
        const noResultsEl = document.getElementById('no-results');
        if (!container) return;

        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const trending = urlParams.get('trending');
        const viral = urlParams.get('viral');

        // Filter products
        let products = [...this.allProducts];

        if (category) {
            products = products.filter(p => p.category === category);
        }

        if (trending === 'true') {
            products = products.filter(p => p.trending);
        }

        if (viral === 'true') {
            products = products.filter(p => p.viral);
        }

        // Update page title
        this.updatePageTitle(category, trending, viral);

        // Render
        if (products.length === 0) {
            container.style.display = 'none';
            if (noResultsEl) noResultsEl.style.display = 'block';
        } else {
            container.style.display = 'grid';
            if (noResultsEl) noResultsEl.style.display = 'none';
            container.innerHTML = products.map(p => this.createProductCard(p)).join('');
        }

        // Update count
        const countEl = document.getElementById('products-count');
        if (countEl) {
            countEl.textContent = `${products.length} ${products.length === 1 ? 'product' : 'products'} found`;
        }

        // Set up filters
        this.setupFilters();
        this.setupSorting();
    },

    // Update page title based on filters
    updatePageTitle(category, trending, viral) {
        const titleEl = document.getElementById('page-title');
        if (!titleEl) return;

        let title = 'All Products';

        if (trending === 'true') {
            title = '🔥 Trending Products';
        } else if (viral === 'true') {
            title = '⚡ Viral Products';
        } else if (category) {
            title = this.getCategoryName(category);
        }

        titleEl.textContent = title;
    },

    // Get category display name
    getCategoryName(category) {
        const names = {
            'home-decor': 'Home Decor',
            'kitchen': 'Kitchen',
            'beauty': 'Beauty',
            'tech': 'Tech',
            'fitness': 'Fitness',
            'office': 'Office'
        };
        return names[category] || 'All Products';
    },

    // Create product card HTML
    createProductCard(product) {
        const discount = product.originalPrice ?
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        return `
            <div class="product-card" onclick="Products.viewProduct('${product.id}')">
                <div class="product-image">
                    <div class="product-badges">
                        ${product.viral ? '<span class="badge badge-viral">Viral</span>' : ''}
                        ${product.trending ? '<span class="badge badge-trending">Trending</span>' : ''}
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <div class="product-meta">
                        <span>⭐ ${product.rating.toFixed(1)}</span>
                        <span>👁️ ${this.formatViews(product.views)}</span>
                    </div>
                    <div class="product-price">
                        <span class="price-current">$${product.price.toFixed(2)}</span>
                        ${product.originalPrice ? `<span class="price-original">$${product.originalPrice.toFixed(2)}</span>` : ''}
                    </div>
                    <button class="btn btn-primary add-to-cart-btn" onclick="event.stopPropagation(); Products.addToCart('${product.id}')">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
    },

    // Format views count
    formatViews(views) {
        if (views >= 1000000) {
            return (views / 1000000).toFixed(1) + 'M';
        } else if (views >= 1000) {
            return (views / 1000).toFixed(1) + 'K';
        }
        return views.toString();
    },

    // View product (placeholder - could navigate to product detail page)
    viewProduct(productId) {
        // In a full implementation, this would navigate to a product detail page
        console.log('View product:', productId);
        // For now, just scroll to top or show an alert
        alert('Product detail page coming soon! For now, just add to cart to purchase.');
    },

    // Add product to cart
    addToCart(productId) {
        const product = this.allProducts.find(p => p.id === productId);
        if (product) {
            Cart.addItem(product);
        }
    },

    // Setup filters
    setupFilters() {
        const checkboxes = document.querySelectorAll('.filter-option input[type="checkbox"]');
        const clearBtn = document.getElementById('clear-filters');

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.applyFilters());
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                checkboxes.forEach(cb => cb.checked = false);
                this.applyFilters();
            });
        }
    },

    // Apply filters
    applyFilters() {
        const container = document.getElementById('products-grid');
        const noResultsEl = document.getElementById('no-results');
        if (!container) return;

        // Get selected filters
        const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
            .map(cb => cb.value);
        const selectedPrices = Array.from(document.querySelectorAll('input[name="price"]:checked'))
            .map(cb => cb.value);
        const selectedTags = Array.from(document.querySelectorAll('input[name="tag"]:checked'))
            .map(cb => cb.value);

        // Filter products
        let filtered = [...this.allProducts];

        // Apply category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(p => selectedCategories.includes(p.category));
        }

        // Apply price filter
        if (selectedPrices.length > 0) {
            filtered = filtered.filter(p => {
                return selectedPrices.some(range => {
                    const [min, max] = range.split('-').map(Number);
                    return p.price >= min && (max ? p.price <= max : true);
                });
            });
        }

        // Apply tag filter
        if (selectedTags.length > 0) {
            filtered = filtered.filter(p => {
                return selectedTags.some(tag => {
                    if (tag === 'trending') return p.trending;
                    if (tag === 'viral') return p.viral;
                    return p.tags?.includes(tag);
                });
            });
        }

        // Render filtered products
        if (filtered.length === 0) {
            container.style.display = 'none';
            if (noResultsEl) noResultsEl.style.display = 'block';
        } else {
            container.style.display = 'grid';
            if (noResultsEl) noResultsEl.style.display = 'none';
            container.innerHTML = filtered.map(p => this.createProductCard(p)).join('');
        }

        // Update count
        const countEl = document.getElementById('products-count');
        if (countEl) {
            countEl.textContent = `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'} found`;
        }
    },

    // Setup sorting
    setupSorting() {
        const sortSelect = document.getElementById('sort-select');
        if (!sortSelect) return;

        sortSelect.addEventListener('change', () => {
            this.sortProducts(sortSelect.value);
        });
    },

    // Sort products
    sortProducts(sortBy) {
        const container = document.getElementById('products-grid');
        if (!container) return;

        let sorted = [...this.allProducts];

        switch (sortBy) {
            case 'price-low':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'views':
                sorted.sort((a, b) => b.views - a.views);
                break;
            case 'popular':
            default:
                sorted.sort((a, b) => b.sales - a.sales);
                break;
        }

        container.innerHTML = sorted.map(p => this.createProductCard(p)).join('');
    },

    // Update homepage stats
    updateStats() {
        const totalProductsEl = document.getElementById('total-products');
        if (totalProductsEl) {
            totalProductsEl.textContent = this.allProducts.length;
        }
    }
};

// Initialize products when app is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for App to initialize
    setTimeout(() => Products.init(), 100);
});

// Make Products available globally
window.Products = Products;
