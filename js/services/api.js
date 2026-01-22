// ===== API Service Layer =====
// Handles all communication with the backend API

// Automatically detect if we're in production (Vercel) or development (localhost)
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction
    ? '/api'  // Same domain in production (Vercel serverless)
    : 'http://localhost:3001/api';  // Local development

console.log(`🔗 API Base URL: ${API_BASE_URL} (${isProduction ? 'Production' : 'Development'})`);

// Token management
const TokenManager = {
    get: () => localStorage.getItem('jwt_token'),
    set: (token) => localStorage.setItem('jwt_token', token),
    remove: () => localStorage.removeItem('jwt_token'),
    isValid: () => {
        const token = TokenManager.get();
        if (!token) return false;

        try {
            // Decode JWT to check expiration
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
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
        console.log(`🔄 API Request: ${endpoint}`, config);
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

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

        if (data.token) {
            TokenManager.set(data.token);
        }

        return data;
    },

    async login(credentials) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (data.token) {
            TokenManager.set(data.token);
        }

        return data;
    },

    async getCurrentUser() {
        return await apiRequest('/auth/me');
    },

    logout() {
        TokenManager.remove();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('abc_books_current_user');
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
    }
};

// ===== Cart API =====
const CartAPI = {
    async get(userId) {
        return await apiRequest(`/cart/${userId}`);
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

    async clear(userId) {
        const items = await this.get(userId);
        await Promise.all(items.map(item => this.remove(item.id)));
    }
};

// ===== Wishlist API =====
const WishlistAPI = {
    async get(userId) {
        return await apiRequest(`/wishlist/${userId}`);
    },

    async add(wishlistItem) {
        return await apiRequest('/wishlist', {
            method: 'POST',
            body: JSON.stringify(wishlistItem)
        });
    },

    async remove(id) {
        return await apiRequest(`/wishlist/${id}`, {
            method: 'DELETE'
        });
    }
};

// ===== Orders API =====
const OrdersAPI = {
    async getAll() {
        return await apiRequest('/orders');
    },

    async getByUser(userId) {
        return await apiRequest(`/orders/user/${userId}`);
    },

    async create(orderData) {
        return await apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    async updateStatus(orderId, status) {
        return await apiRequest(`/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
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
    }
};

// Export all APIs
window.API = {
    Auth: AuthAPI,
    Books: BooksAPI,
    Cart: CartAPI,
    Wishlist: WishlistAPI,
    Orders: OrdersAPI,
    Users: UsersAPI,
    Token: TokenManager
};

console.log('✅ API Service initialized');
