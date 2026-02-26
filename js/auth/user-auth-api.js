// ===== ABC Books - API-Integrated Authentication & Shop Functionality =====
// This version uses the backend API instead of localStorage

// Check if API is available
if (typeof API === 'undefined') {
    console.error('❌ API service not loaded! Make sure api.js is included before this file.');
}

// Current user state (cached from API)
let currentUserCache = null;

// ===== GLOBAL UI HELPERS =====
// Show notification if not already defined in another script
if (typeof showNotification === 'undefined') {
    window.showNotification = function (message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle')}"></i>
            <span>${message}</span>
        `;

        // Base styles for notification
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' :
                (type === 'error' ? 'linear-gradient(135deg, #e74c3c, #ff4757)' : 'linear-gradient(135deg, #3498db, #5dade2)')};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    };

    // Add required keyframes if not present
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100px); opacity: 0; } }
        `;
        document.head.appendChild(style);
    }
}

// ===== HELPER FUNCTIONS =====
async function getCurrentUser() {
    // 1. Definitively check physical token presence FIRST to avoid any async/cache race conditions
    const directToken = localStorage.getItem('accessToken') || localStorage.getItem('token') || localStorage.getItem('jwt_token');

    if (!directToken) {
        // If no token physically exists, absolutely force unauthenticated state immediately
        currentUserCache = null;
        return null;
    }

    // 2. Return cached user if available
    if (currentUserCache) {
        return currentUserCache;
    }

    // 3. We have a token. Let's try to get fresh data from the API
    try {
        if (typeof API !== 'undefined' && API.Auth) {
            const response = await API.Auth.getCurrentUser();
            const user = response.user || response;
            if (user && user.id) {
                currentUserCache = user;
                localStorage.setItem('abc_books_current_user', JSON.stringify(user));
                return user;
            }
        }
    } catch (error) {
        console.warn('⚠️ Could not fetch user from API, trying localStorage fallback...', error);
    }

    // 4. API failed, but we DO have a literal token. Fallback to local storage user object.
    const savedUser = localStorage.getItem('abc_books_current_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            currentUserCache = user;
            return user;
        } catch (e) {
            console.error('Error parsing saved user:', e);
        }
    }

    return null;
}

function clearUserCache() {
    currentUserCache = null;
}

// ===== MODAL FUNCTIONS =====
function showLoginModal() {
    if (typeof resetFormErrors === 'function') resetFormErrors('loginForm');
    document.getElementById('loginModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.body.style.overflow = '';
}

function showSignupModal() {
    if (typeof resetFormErrors === 'function') resetFormErrors('signupForm');
    document.getElementById('signupModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSignupModal() {
    document.getElementById('signupModal').classList.remove('active');
    document.body.style.overflow = '';
}

function switchToSignup() {
    closeLoginModal();
    showSignupModal();
}

function switchToLogin() {
    closeSignupModal();
    showLoginModal();
}

// ----- Forgot Password Modal Functions -----
function showForgotModal(event) {
    if (event) event.preventDefault();
    closeLoginModal();
    if (typeof resetFormErrors === 'function') resetFormErrors('forgotForm');

    // Reset borders and success messages
    const successBanner = document.getElementById('forgotFormSuccess');
    if (successBanner) successBanner.style.display = 'none';

    document.getElementById('forgotModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeForgotModal() {
    document.getElementById('forgotModal').classList.remove('active');
    document.body.style.overflow = '';
}

function switchToLoginReset() {
    closeForgotModal();
    showLoginModal();
}

// ===== AUTHENTICATION FUNCTIONS =====
// ===== VALIDATION HELPERS =====
function showInputError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorSpan = document.getElementById(inputId + 'Error');
    if (input && errorSpan) {
        input.parentElement.classList.add('error');
        errorSpan.textContent = message;
        errorSpan.style.display = 'block';
    }
}

function showFormBannerError(formId, message) {
    const banner = document.getElementById(formId + 'Error');
    if (banner) {
        banner.querySelector('span').textContent = message;
        banner.style.display = 'flex';
    }
}

function resetFormErrors(formId) {
    const banner = document.getElementById(formId + 'Error');
    if (banner) banner.style.display = 'none';

    const form = document.getElementById(formId);
    if (form) {
        form.querySelectorAll('.form-group').forEach(group => group.classList.remove('error'));
        form.querySelectorAll('.error-message').forEach(span => {
            span.textContent = '';
            span.style.display = 'none';
        });
    }
}

function setLoadingState(btn, isLoading) {
    if (!btn) return;
    if (isLoading) {
        btn.classList.add('loading');
        btn.dataset.originalText = btn.innerHTML;
        btn.style.width = btn.offsetWidth + 'px'; // Maintain width
    } else {
        btn.classList.remove('loading');
        if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
        btn.style.width = '';
    }
}

// ===== AUTHENTICATION FUNCTIONS =====
async function handleLogin(event) {
    event.preventDefault();

    const formId = 'loginForm';
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    resetFormErrors(formId);

    // Validation
    let isValid = true;
    if (!emailInput.value.trim()) {
        showInputError('loginEmail', 'Email is required');
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
        showInputError('loginEmail', 'Please enter a valid email address');
        isValid = false;
    }

    if (!passwordInput.value) {
        showInputError('loginPassword', 'Password is required');
        isValid = false;
    }

    if (!isValid) return;

    // API Call
    setLoadingState(submitBtn, true);

    try {
        const response = await API.Auth.login({
            email: emailInput.value,
            password: passwordInput.value
        });

        if (response.user) {
            currentUserCache = response.user;

            // ✅ CRITICAL RUNTIME FIX: Directly force token write to localStorage 
            // Ensures persistence even if TokenManager fails to sync
            if (response.token || response.accessToken) {
                const finalToken = response.accessToken || response.token;
                localStorage.setItem('accessToken', finalToken);
                localStorage.setItem('token', finalToken);
                localStorage.setItem('jwt_token', finalToken);
                console.log('✅ Tokens securely written to localStorage:', finalToken.substring(0, 15) + '...');
            }

            localStorage.setItem('abc_books_current_user', JSON.stringify(response.user));
            console.log('✅ User saved to localStorage:', response.user);

            closeLoginModal();
            await updateUserUI();
            await loadUserData();

            if (typeof showNotification === 'function') {
                showNotification(`Welcome back, ${response.user.name}!`, 'success');
            }

            await processPendingAction();
        }
    } catch (error) {
        console.error('Login error:', error);

        // Wipe local ghosts on failed login attempts to prevent UI desync
        clearUserCache();
        localStorage.removeItem('abc_books_current_user');
        if (typeof updateUserUI === 'function') updateUserUI();

        if (error.message.toLowerCase().includes('password')) {
            showInputError('loginPassword', 'Incorrect password');
        } else if (error.message.toLowerCase().includes('found')) {
            showInputError('loginEmail', 'No account found with this email');
        } else {
            showFormBannerError(formId, error.message || 'Login failed. Please try again.');
        }
    } finally {
        setLoadingState(submitBtn, false);
    }
}

async function handleSignup(event) {
    event.preventDefault();

    const formId = 'signupForm';
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const phoneInput = document.getElementById('signupPhone');
    const passwordInput = document.getElementById('signupPassword');
    const confirmInput = document.getElementById('signupConfirmPassword');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    resetFormErrors(formId);

    // Validation
    let isValid = true;
    if (!nameInput.value.trim()) {
        showInputError('signupName', 'Full Name is required');
        isValid = false;
    }

    if (!emailInput.value.trim()) {
        showInputError('signupEmail', 'Email is required');
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
        showInputError('signupEmail', 'Please enter a valid email address');
        isValid = false;
    }

    if (!phoneInput.value.trim()) {
        showInputError('signupPhone', 'Phone number is required');
        isValid = false;
    } else if (!/^\d{10}$/.test(phoneInput.value.replace(/[- ]/g, ''))) {
        showInputError('signupPhone', 'Please enter a valid 10-digit phone number');
        isValid = false;
    }

    if (passwordInput.value.length < 6) {
        showInputError('signupPassword', 'Password must be at least 6 characters');
        isValid = false;
    }

    if (passwordInput.value !== confirmInput.value) {
        showInputError('signupConfirmPassword', 'Passwords do not match');
        isValid = false;
    }

    if (!isValid) return;

    setLoadingState(submitBtn, true);

    try {
        const response = await API.Auth.register({
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
            password: passwordInput.value
        });

        if (response.user) {
            currentUserCache = response.user;
            // ✅ CRITICAL: Save user to localStorage for checkout to recognize the session
            localStorage.setItem('abc_books_current_user', JSON.stringify(response.user));
            console.log('✅ User saved to localStorage:', response.user);
            closeSignupModal();
            await updateUserUI();

            if (typeof showNotification === 'function') {
                showNotification(`Welcome to ABC Books, ${response.user.name}!`, 'success');
            }

            await processPendingAction();
        }
    } catch (error) {
        console.error('Signup error:', error);
        if (error.message.toLowerCase().includes('email')) {
            showInputError('signupEmail', 'This email is already registered');
        } else {
            showFormBannerError(formId, error.message || 'Registration failed. Please try again.');
        }
    } finally {
        setLoadingState(submitBtn, false);
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();

    const formId = 'forgotForm';
    const emailInput = document.getElementById('forgotEmail');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const successBanner = document.getElementById('forgotFormSuccess');

    resetFormErrors(formId);
    if (successBanner) successBanner.style.display = 'none';

    // Validation
    if (!emailInput.value.trim()) {
        showInputError('forgotEmail', 'Email is required');
        return;
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
        showInputError('forgotEmail', 'Please enter a valid email address');
        return;
    }

    setLoadingState(submitBtn, true);

    try {
        const response = await API.Auth.forgotPassword(emailInput.value);

        if (successBanner) {
            successBanner.querySelector('span').textContent = response.message || 'Reset link sent! Please check your email inbox.';
            successBanner.style.display = 'flex';
            emailInput.value = ''; // Clear input on success
        } else {
            if (typeof showNotification === 'function') {
                showNotification('Password reset link sent to your email!', 'success');
            }
            closeForgotModal();
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        if (error.message.toLowerCase().includes('found')) {
            showInputError('forgotEmail', 'No account found with this email');
        } else {
            showFormBannerError(formId, error.message || 'Failed to send reset link. Please try again.');
        }
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// ===== PENDING ACTION EXECUTION =====

/**
 * Get correct path to checkout based on current location
 */
function getCheckoutPath() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pages/')) {
        return 'checkout.html';
    }
    return 'pages/checkout.html';
}

/**
 * Process pending action after login/signup
 */
async function processPendingAction() {
    const pendingAction = localStorage.getItem('abc_books_pending_action');
    const pendingBookData = localStorage.getItem('abc_books_pending_book');

    if (!pendingAction || !pendingBookData) {
        return;
    }

    try {
        const pending = JSON.parse(pendingBookData);
        const user = await getCurrentUser();

        if (!user) {
            return;
        }

        // Clear pending data first
        localStorage.removeItem('abc_books_pending_action');
        localStorage.removeItem('abc_books_pending_book');

        const { bookId, bookData, quantity } = pending;

        // Wait a moment before executing
        await new Promise(resolve => setTimeout(resolve, 500));

        if (pendingAction === 'buy_now') {
            // Add to cart and redirect to checkout
            try {
                // Save to localStorage first (backup)
                let localCart = JSON.parse(localStorage.getItem('abc_books_cart') || '[]');
                const existingIndex = localCart.findIndex(item => item.id === bookId);

                if (existingIndex >= 0) {
                    localCart[existingIndex].quantity = (localCart[existingIndex].quantity || 1) + (quantity || 1);
                } else {
                    localCart.push({
                        id: bookId,
                        title: bookData?.title || 'Book',
                        author: bookData?.author || 'Unknown Author',
                        price: bookData?.price || 0,
                        image: bookData?.image || '',
                        quantity: quantity || 1
                    });
                }
                localStorage.setItem('abc_books_cart', JSON.stringify(localCart));
                console.log('✅ Buy Now: Saved to localStorage cart');

                // Try API as well
                try {
                    await API.Cart.add({
                        user_id: user.id,
                        book_id: bookId,
                        quantity: quantity || 1
                    });
                    console.log('✅ Buy Now: Saved to API cart');
                } catch (apiErr) {
                    console.log('⚠️ API cart add failed:', apiErr.message);
                }

                await updateCartCount();

                if (typeof showNotification === 'function') {
                    showNotification('Redirecting to checkout...', 'success');
                }

                setTimeout(() => {
                    window.location.href = getCheckoutPath();
                }, 800);
            } catch (error) {
                console.error('Error in pending buy now:', error);
                // Fallback: just redirect to checkout
                window.location.href = getCheckoutPath();
            }

        } else if (pendingAction === 'add_to_cart') {
            // Just add to cart - save to localStorage first
            try {
                // Save to localStorage first (backup)
                let localCart = JSON.parse(localStorage.getItem('abc_books_cart') || '[]');
                const existingIndex = localCart.findIndex(item => item.id === bookId);

                if (existingIndex >= 0) {
                    localCart[existingIndex].quantity = (localCart[existingIndex].quantity || 1) + (quantity || 1);
                } else {
                    localCart.push({
                        id: bookId,
                        title: bookData?.title || 'Book',
                        author: bookData?.author || 'Unknown Author',
                        price: bookData?.price || 0,
                        image: bookData?.image || '',
                        quantity: quantity || 1
                    });
                }
                localStorage.setItem('abc_books_cart', JSON.stringify(localCart));
                console.log('✅ Pending action: Saved to localStorage cart');

                // Try API as well
                try {
                    await API.Cart.add({
                        user_id: user.id,
                        book_id: bookId,
                        quantity: quantity || 1
                    });
                    console.log('✅ Pending action: Saved to API cart');
                } catch (apiErr) {
                    console.log('⚠️ API cart add failed:', apiErr.message);
                }

                await updateCartCount();

                if (typeof showNotification === 'function') {
                    showNotification(`${bookData?.title || 'Book'} added to cart!`, 'success');
                }
            } catch (error) {
                console.error('Error in pending add to cart:', error);
            }

        } else if (pendingAction === 'add_to_wishlist') {
            // Add to wishlist
            try {
                await API.Wishlist.add({
                    user_id: user.id,
                    book_id: bookId
                });
                await updateWishlistCount();

                if (typeof showNotification === 'function') {
                    showNotification(`${bookData?.title || 'Book'} added to wishlist!`, 'success');
                }
            } catch (error) {
                console.error('Error in pending add to wishlist:', error);
            }
        }

    } catch (error) {
        console.error('Error processing pending action:', error);
    }
}

async function userLogout() {
    if (confirm('Are you sure you want to logout?')) {
        API.Auth.logout();
        clearUserCache();
        await updateUserUI();
        alert('You have been logged out successfully.');
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('active');
}

// ===== WISHLIST FUNCTIONS =====
async function toggleWishlist() {
    const user = await getCurrentUser();
    if (!user) {
        alert('Please login to view your wishlist');
        showLoginModal();
        return;
    }

    document.getElementById('wishlistOverlay').classList.add('active');
    document.getElementById('wishlistPanel').classList.add('active');
    document.body.style.overflow = 'hidden';
    await loadWishlistItems();
}

function closeWishlist() {
    document.getElementById('wishlistOverlay').classList.remove('active');
    document.getElementById('wishlistPanel').classList.remove('active');
    document.body.style.overflow = '';
}

async function loadWishlistItems() {
    const user = await getCurrentUser();
    if (!user) return;

    const content = document.getElementById('wishlistContent');

    try {
        const response = await API.Wishlist.get(user.id);
        const wishlist = response.wishlist || response || [];

        if (!Array.isArray(wishlist) || wishlist.length === 0) {
            content.innerHTML = '<p class="empty-message"><i class="fas fa-heart-broken"></i> Your wishlist is empty</p>';
            return;
        }

        content.innerHTML = wishlist.map(item => `
            <div class="wishlist-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-details">
                    <h4>${item.title}</h4>
                    <p>${item.author}</p>
                    <div class="item-price">₹${item.price}</div>
                </div>
                <div class="item-actions">
                    <button class="btn-icon" onclick="addToCartFromWishlist(${item.book_id})" title="Add to Cart">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                    <button class="btn-icon" onclick="removeFromWishlist(${item.id})" title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading wishlist:', error);
        content.innerHTML = '<p class="empty-message">Error loading wishlist</p>';
    }

    await updateWishlistCount();
}

async function addToWishlist(bookId, bookData) {
    const user = await getCurrentUser();
    if (!user) {
        // ✅ SAVE PENDING ACTION for auto-continue after login
        localStorage.setItem('abc_books_pending_action', 'add_to_wishlist');
        localStorage.setItem('abc_books_pending_book', JSON.stringify({
            bookId: bookId,
            bookData: bookData,
            quantity: 1,
            source: 'homepage'
        }));

        if (typeof showNotification === 'function') {
            showNotification('Please login to add items to wishlist', 'info');
        } else {
            alert('Please login to add items to wishlist');
        }
        showLoginModal();
        return;
    }

    try {
        await API.Wishlist.add({
            user_id: user.id,
            book_id: bookId
        });

        await updateWishlistCount();
        if (typeof showNotification === 'function') {
            showNotification(`${bookData?.title || 'Book'} added to wishlist!`, 'success');
        } else {
            alert('Book added to wishlist!');
        }
    } catch (error) {
        if (error.message.includes('already exists')) {
            if (typeof showNotification === 'function') {
                showNotification('This book is already in your wishlist', 'info');
            } else {
                alert('This book is already in your wishlist');
            }
        } else {
            alert('Error adding to wishlist. Please try again.');
        }
    }
}

async function removeFromWishlist(wishlistId) {
    try {
        await API.Wishlist.remove(wishlistId);
        await updateWishlistCount();
        await loadWishlistItems();
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        alert('Error removing from wishlist');
    }
}

async function addToCartFromWishlist(bookId) {
    try {
        const user = await getCurrentUser();
        await API.Cart.add({
            user_id: user.id,
            book_id: bookId,
            quantity: 1
        });

        // Remove from wishlist after adding to cart
        const wishlist = await API.Wishlist.get(user.id);
        const wishlistItem = wishlist.find(item => item.book_id === bookId);
        if (wishlistItem) {
            await removeFromWishlist(wishlistItem.id);
        }

        await updateCartCount();
        alert('Book added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding to cart');
    }
}

// ===== CART FUNCTIONS =====
async function toggleCart() {
    const user = await getCurrentUser();
    if (!user) {
        alert('Please login to view your cart');
        showLoginModal();
        return;
    }

    document.getElementById('cartOverlay').classList.add('active');
    document.getElementById('cartPanel').classList.add('active');
    document.body.style.overflow = 'hidden';
    await loadCartItems();
}

function closeCart() {
    document.getElementById('cartOverlay').classList.remove('active');
    document.getElementById('cartPanel').classList.remove('active');
    document.body.style.overflow = '';
}

async function loadCartItems() {
    const user = await getCurrentUser();
    if (!user) return;

    const content = document.getElementById('cartContent');

    try {
        const response = await API.Cart.get(user.id);
        const cart = response.cart || response || [];

        if (!Array.isArray(cart) || cart.length === 0) {
            content.innerHTML = '<p class="empty-message"><i class="fas fa-shopping-cart"></i> Your cart is empty</p>';
            document.getElementById('cartTotal').textContent = '₹0';
            return;
        }

        content.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="item-details">
                    <h4>${item.title}</h4>
                    <p>${item.author}</p>
                    <div class="item-price">₹${item.price}</div>
                    <div class="item-quantity">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                </div>
                <button class="btn-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        updateCartTotal(cart);
    } catch (error) {
        console.error('Error loading cart:', error);
        content.innerHTML = '<p class="empty-message">Error loading cart</p>';
    }
}

async function addToCart(bookId, bookData) {
    const user = await getCurrentUser();
    if (!user) {
        // ✅ SAVE PENDING ACTION for auto-continue after login
        localStorage.setItem('abc_books_pending_action', 'add_to_cart');
        localStorage.setItem('abc_books_pending_book', JSON.stringify({
            bookId: bookId,
            bookData: bookData,
            quantity: 1,
            source: 'homepage'
        }));

        if (typeof showNotification === 'function') {
            showNotification('Please login to add items to cart', 'info');
        } else {
            alert('Please login to add items to cart');
        }
        showLoginModal();
        return;
    }

    try {
        // ✅ ALWAYS save to localStorage first (as backup)
        let localCart = JSON.parse(localStorage.getItem('abc_books_cart') || '[]');
        const existingIndex = localCart.findIndex(item => item.id === bookId);

        if (existingIndex >= 0) {
            localCart[existingIndex].quantity = (localCart[existingIndex].quantity || 1) + 1;
        } else {
            localCart.push({
                id: bookId,
                title: bookData?.title || 'Book',
                author: bookData?.author || 'Unknown Author',
                price: bookData?.price || 0,
                image: bookData?.image || '',
                quantity: 1
            });
        }
        localStorage.setItem('abc_books_cart', JSON.stringify(localCart));
        console.log('✅ Saved to localStorage cart:', localCart);

        // Try to save to API as well
        try {
            const response = await API.Cart.add({
                user_id: user.id,
                book_id: bookId,
                quantity: 1
            });
            console.log('✅ API Cart add response:', response);
        } catch (apiError) {
            console.log('⚠️ API cart add failed (using localStorage only):', apiError.message);
        }

        await updateCartCount();
        if (typeof showNotification === 'function') {
            showNotification(`${bookData?.title || 'Book'} added to cart!`, 'success');
        } else {
            alert('Book added to cart!');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding to cart. Please try again.');
    }
}

async function removeFromCart(cartId) {
    try {
        await API.Cart.remove(cartId);
        await updateCartCount();
        await loadCartItems();
    } catch (error) {
        console.error('Error removing from cart:', error);
        alert('Error removing from cart');
    }
}

async function updateQuantity(cartId, newQuantity) {
    if (newQuantity < 1) {
        await removeFromCart(cartId);
        return;
    }

    try {
        await API.Cart.update(cartId, newQuantity);
        await loadCartItems();
    } catch (error) {
        console.error('Error updating quantity:', error);
        alert('Error updating quantity');
    }
}

function updateCartTotal(cart) {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = `₹${total.toFixed(2)}`;
}

async function proceedToCheckout() {
    const user = await getCurrentUser();
    if (!user) {
        alert('Please login to proceed to checkout');
        showLoginModal();
        return;
    }

    try {
        const cart = await API.Cart.get(user.id);

        if (cart.length === 0) {
            alert('Your cart is empty. Please add items before checkout.');
            return;
        }

        // Redirect to checkout page
        window.location.href = 'pages/checkout.html';
    } catch (error) {
        console.error('Error checking cart:', error);
        alert('Error loading cart. Please try again.');
    }
}

// ===== UI UPDATE FUNCTIONS =====
async function updateUserUI() {
    const user = await getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userAccount = document.getElementById('userAccount');
    const userName = document.getElementById('userName');

    // Only update UI if elements exist (they might not exist on all pages)
    if (authButtons && userAccount) {
        if (user) {
            authButtons.style.display = 'none';
            userAccount.style.display = 'block';
            if (userName) {
                userName.textContent = user.name.split(' ')[0];
            }
        } else {
            authButtons.style.display = 'flex';
            userAccount.style.display = 'none';
        }
    }

    await updateWishlistCount();
    await updateCartCount();
}

async function updateWishlistCount() {
    const user = await getCurrentUser();
    const countElement = document.getElementById('wishlistCount');

    if (!countElement) return; // Element doesn't exist on this page

    if (!user) {
        countElement.textContent = '0';
        return;
    }

    try {
        const response = await API.Wishlist.get(user.id);
        // API might return {wishlist: [...]} or just [...]
        const wishlist = response.wishlist || response || [];
        countElement.textContent = Array.isArray(wishlist) ? wishlist.length : 0;
    } catch (error) {
        console.error('Error updating wishlist count:', error);
        countElement.textContent = '0';
    }
}

async function updateCartCount() {
    const user = await getCurrentUser();
    const countElement = document.getElementById('cartCount');

    if (!countElement) return; // Element doesn't exist on this page

    if (!user) {
        countElement.textContent = '0';
        return;
    }

    try {
        const response = await API.Cart.get(user.id);
        // API returns {cart: [...], itemCount: ..., total: ...}
        const cart = response.cart || response || [];

        // Calculate total items - ensure quantity is a number, default to 1 if missing
        let totalItems = 0;
        if (Array.isArray(cart)) {
            totalItems = cart.reduce((total, item) => {
                const qty = parseInt(item.quantity) || 1;
                return total + qty;
            }, 0);
        }

        countElement.textContent = totalItems || 0;
    } catch (error) {
        console.error('Error updating cart count:', error);
        countElement.textContent = '0';
    }
}

// ===== LOAD USER DATA =====
async function loadUserData() {
    await updateWishlistCount();
    await updateCartCount();
}

// ===== USER MENU FUNCTIONS =====
function viewOrders() {
    alert('Order history feature coming soon!');
}

function viewWishlist() {
    toggleUserMenu();
    toggleWishlist();
}

function viewProfile() {
    alert('Profile editing feature coming soon!');
}

// ===== INITIALIZE ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🔄 Initializing ABC Books with API integration...');

    // Check if user is logged in
    if (API.Token.isValid()) {
        try {
            await getCurrentUser();
            await updateUserUI();
            console.log('✅ User session restored');
        } catch (error) {
            console.error('❌ Error restoring session:', error);
            API.Token.remove();
            await updateUserUI();
        }
    } else {
        await updateUserUI();
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function (e) {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown && !e.target.closest('.user-account')) {
            userDropdown.classList.remove('active');
        }
    });

    // Close modals on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeLoginModal();
            closeSignupModal();
            closeForgotModal();
            closeWishlist();
            closeCart();
        }
    });

    console.log('✅ ABC Books initialized with API integration');
});
