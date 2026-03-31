// ===== API Service Layer =====
// Handles all communication with the backend API

// Automatically detect if we're in production (Vercel) or development (localhost)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction
    ? '/api'  // Same domain in production (Vercel serverless)
    : 'http://localhost:3001/api';  // Local development
window.API_BASE_URL = API_BASE_URL; // Make globally accessible

console.log(`🔗 API Base URL: ${API_BASE_URL} (${isProduction ? 'Production' : 'Development'})`);

// Token management
const isAdminPath = typeof window !== 'undefined' && window.location.pathname.includes('/admin');

const TokenManager = {
    get: () => {
        // Preferred key based on path
        const preferred = isAdminPath ? 'adminToken' : 'accessToken';
        const fallback = isAdminPath ? 'accessToken' : 'adminToken';
        
        let token = localStorage.getItem(preferred);
        
        // If preferred is missing, try fallback
        if (!token) {
            token = localStorage.getItem(fallback) || 
                    localStorage.getItem('token') || 
                    localStorage.getItem('jwt_token');
        }
        
        return token;
    },
    set: (token) => {
        // Always set both in production for maximum reliability across paths
        localStorage.setItem('adminToken', token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('token', token);
        localStorage.setItem('jwt_token', token);
    },
    remove: () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('abc_admin_user');
    },
    isValid: () => {
        const token = TokenManager.get();
        if (!token) return false;

        try {
            // If it's not a 3-part JWT, just check if it exists
            const parts = token.split('.');
            if (parts.length !== 3) {
                return true; // Consider it valid if it exists but isn't a JWT (for dev/demo)
            }

            // Decode JWT to check expiration
            const payload = JSON.parse(atob(parts[1]));
            return payload.exp * 1000 > Date.now();
        } catch (e) {
            console.warn('Token validation error:', e);
            return !!token; // Fallback to existence check
        }
    }
};

// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = TokenManager.get();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };


    try {
        // Add cache-busting timestamp to avoid outdated data
        const timestamp = new Date().getTime();
        const separator = endpoint.includes('?') ? '&' : '?';
        const cacheBustedEndpoint = `${endpoint}${separator}cb=${timestamp}`;
        
        console.log(`🔄 API Request: ${cacheBustedEndpoint}`, config);
        const response = await fetch(`${API_BASE_URL}${cacheBustedEndpoint}`, config);

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Server returned non-JSON response. Status: ${response.status}`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || 'Request failed');
        }

        console.log(`✅ API Response: ${endpoint}`, data);
        return data;
    } catch (error) {
        // Check if it's a network error
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            console.error('❌ Network Error: Cannot connect to backend server at', API_BASE_URL);
            console.error('   Make sure the backend server is running on port 3001');
            console.error('   Original error:', error);
            throw new Error('Cannot connect to server. Please make sure the backend is running.');
        }

        console.error('❌ API Request Error:', error);
        throw error;
    }
}

// ===== Authentication API =====
const AuthAPI = {
    async register(userData) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        const tokenToSet = data.accessToken || data.token;
        if (tokenToSet) {
            TokenManager.set(tokenToSet);
        }

        return data;
    },

    async login(credentials) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        const tokenToSet = data.accessToken || data.token;
        if (tokenToSet) {
            TokenManager.set(tokenToSet);
        }

        return data;
    },

    async googleLogin(credential) {
        const data = await apiRequest('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential })
        });

        const tokenToSet = data.accessToken || data.token;
        if (tokenToSet) {
            TokenManager.set(tokenToSet);
        }

        return data;
    },

    async getCurrentUser() {
        return await apiRequest('/auth/me');
    },

    async forgotPassword(email) {
        return await apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    logout() {
        TokenManager.remove();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('abc_books_current_user');
        localStorage.removeItem('abc_books_cart');
        localStorage.removeItem('abc_books_wishlist');
        localStorage.removeItem('abc_books_pending_action');
        localStorage.removeItem('abc_books_pending_book');
    }
};

// ===== Books API =====
const BooksAPI = {
    async getAll(params = {}) {
        const query = new URLSearchParams(params).toString();
        return await apiRequest(`/books${query ? '?' + query : ''}`);
    },

    async getById(id) {
        return await apiRequest(`/books/${id}`);
    },

    async create(bookData) {
        return await apiRequest('/books', {
            method: 'POST',
            body: JSON.stringify(bookData)
        });
    },

    async update(id, bookData) {
        return await apiRequest(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bookData)
        });
    },

    async delete(id) {
        return await apiRequest(`/books/${id}`, {
            method: 'DELETE'
        });
    },

    async getBySection(section) {
        return await apiRequest(`/books/section/${section}`);
    },

    async getHomeSummary() {
        return await apiRequest('/books/home-summary');
    }
};

// ===== Cart API =====
const CartAPI = {
    async get(userId) {
        return await apiRequest('/cart');
    },

    async add(cartItem) {
        return await apiRequest('/cart', {
            method: 'POST',
            body: JSON.stringify(cartItem)
        });
    },

    async update(id, quantity) {
        return await apiRequest(`/cart/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    },

    async remove(id) {
        return await apiRequest(`/cart/${id}`, {
            method: 'DELETE'
        });
    },

    async clear() {
        return await apiRequest('/cart/actions/clear', {
            method: 'DELETE'
        });
    }
};

// ===== Wishlist API =====
const WishlistAPI = {
    async get() {
        return await apiRequest('/wishlist');
    },

    async add(book_id) {
        return await apiRequest('/wishlist', {
            method: 'POST',
            body: JSON.stringify({ book_id })
        });
    },

    async remove(id) {
        return await apiRequest(`/wishlist/${id}`, {
            method: 'DELETE'
        });
    },

    async removeByBookId(bookId) {
        return await apiRequest(`/wishlist/book/${bookId}`, {
            method: 'DELETE'
        });
    },

    async check(bookId) {
        return await apiRequest(`/wishlist/check/${bookId}`);
    }
};

// ===== Orders API =====
const OrdersAPI = {
    async getAll() {
        return await apiRequest('/orders');
    },

    async getByUser() {
        return await apiRequest('/orders/my-orders');
    },

    async create(orderData) {
        return await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    async updateStatus(orderId, updateData) {
        return await apiRequest(`/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify(updateData)
        });
    },

    async getById(orderId) {
        return await apiRequest(`/orders/${orderId}`);
    },

    async delete(orderId) {
        return await apiRequest(`/orders/${orderId}`, {
            method: 'DELETE'
        });
    }
};

// ===== Users API (Admin) =====
const UsersAPI = {
    async getAll() {
        return await apiRequest('/users');
    },

    async getById(id) {
        return await apiRequest(`/users/${id}`);
    },

    async delete(id) {
        return await apiRequest(`/users/${id}`, {
            method: 'DELETE'
        });
    },

    async updateRole(id, is_admin) {
        return await apiRequest(`/users/${id}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ is_admin })
        });
    }
};

// ===== Categories API =====
const CategoriesAPI = {
    async getAll() {
        return await apiRequest('/categories');
    },

    async getLanguages() {
        return await apiRequest('/categories/languages');
    },

    async getSubcategories(languageSlug) {
        return await apiRequest(`/categories/language/${languageSlug}`);
    },

    async getById(id) {
        return await apiRequest(`/categories/${id}`);
    },

    async create(categoryData) {
        return await apiRequest('/categories', {
            method: 'POST',
            body: JSON.stringify(categoryData)
        });
    },

    async update(id, categoryData) {
        return await apiRequest(`/categories/${id}`, {
            method: 'PUT',
            body: JSON.stringify(categoryData)
        });
    },

    async delete(id) {
        return await apiRequest(`/categories/${id}`, {
            method: 'DELETE'
        });
    }
};

// ===== Contact API =====
const ContactAPI = {
    async sendMessage(contactData) {
        return await apiRequest('/contact', {
            method: 'POST',
            body: JSON.stringify(contactData)
        });
    }
};

// Export all APIs
window.API = {
    fetch: apiRequest,
    Auth: AuthAPI,
    Books: BooksAPI,
    Cart: CartAPI,
    Wishlist: WishlistAPI,
    Orders: OrdersAPI,
    Users: UsersAPI,
    Categories: CategoriesAPI,
    Contact: ContactAPI,
    Token: TokenManager
};


console.log('✅ API Service initialized');
