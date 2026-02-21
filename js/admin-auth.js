// ========================================
// TrendStore - Admin Authentication
// ========================================

const AdminAuth = {
    // Check if user is logged in
    isAuthenticated() {
        return sessionStorage.getItem('adminLoggedIn') === 'true';
    },

    // Get current admin user
    getCurrentUser() {
        if (!this.isAuthenticated()) return null;

        return {
            email: sessionStorage.getItem('adminEmail'),
            role: sessionStorage.getItem('adminRole')
        };
    },

    // Check if user is owner
    isOwner() {
        const user = this.getCurrentUser();
        return user && user.role === 'owner';
    },

    // Logout
    logout() {
        sessionStorage.clear();
        window.location.href = '/admin/login.html';
    },

    // Require authentication (call on protected pages)
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/admin/login.html';
            return false;
        }
        return true;
    },

    // Initialize auth UI
    initAuthUI() {
        const user = this.getCurrentUser();
        if (!user) return;

        // Update user info in sidebar
        const adminNameEl = document.getElementById('admin-name');
        const adminEmailEl = document.getElementById('admin-email');

        if (adminNameEl) {
            adminNameEl.textContent = user.role === 'owner' ? 'Owner' : 'Admin';
        }

        if (adminEmailEl) {
            adminEmailEl.textContent = user.email;
        }
    }
};

// Check authentication on admin pages
if (window.location.pathname.startsWith('/admin/') &&
    !window.location.pathname.endsWith('/login.html')) {

    // Require authentication
    if (AdminAuth.requireAuth()) {
        // Initialize auth UI when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            AdminAuth.initAuthUI();
        });
    }
}

// Make AdminAuth available globally
window.AdminAuth = AdminAuth;
