// ===== Books Data - API Only (No Demo Data) =====

// Dynamic API URL (same as api.js)
const BOOKS_DATA_API_BASE = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? '/api'
    : 'http://localhost:3001/api';

// ===== Book Cache =====
let _cachedBooks = null;
let _cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===== Fetch All Books from Database API =====
async function fetchAllBooks() {
    const now = Date.now();
    if (_cachedBooks && (now - _cacheTimestamp) < CACHE_DURATION) {
        return _cachedBooks;
    }

    try {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('API timeout')), 5000)
        );
        const response = await Promise.race([
            fetch(`${BOOKS_DATA_API_BASE}/books?limit=1000`), // Fetch all books
            timeoutPromise
        ]);

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();
        if (data && data.books && data.books.length > 0) {
            _cachedBooks = data.books.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                price: parseFloat(book.price) || 0,
                originalPrice: parseFloat(book.original_price) || parseFloat(book.price) || 0,
                image: book.image,
                description: book.description,
                category: book.category,
                subcategory: book.subcategory,
                language: book.language,
                rating: parseFloat(book.rating) || 4.5,
                isbn: book.isbn,
                year: book.publish_year,
                publisher: book.publisher,
                sections: book.sections || [] // Mapped from backend
            }));
            _cacheTimestamp = now;
            console.log(`📚 Loaded ${_cachedBooks.length} books from database`);
            return _cachedBooks;
        }
        return [];
    } catch (error) {
        console.warn('⚠️ Failed to fetch books:', error.message);
        return _cachedBooks || [];
    }
}

// ===== Get Books for a Specific Section =====
async function getBooksForSection(section) {
    const allBooks = await fetchAllBooks();
    if (!allBooks || allBooks.length === 0) return [];

    // 1. Explicit Manual Assignment (from Admin Panel)
    // Map 'featured' to include 'editors' choice from Admin
    let dbSections = [section];
    if (section === 'featured') dbSections = ['featured', 'editors'];

    // Filter books that have this section assigned
    const explicitBooks = allBooks.filter(b => b.sections && dbSections.some(s => b.sections.includes(s)));

    // 2. Automatic Rule-based Fallback
    const sortedByNewest = [...allBooks].sort((a, b) => b.id - a.id);
    const sortedByRating = [...allBooks].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    let autoBooks = [];
    let sliceStart = 0;
    let limit = 6;

    switch (section) {
        case 'featured':
            autoBooks = sortedByNewest;
            break;

        case 'trending':
            autoBooks = sortedByRating;
            break;

        case 'newReleases':
            autoBooks = sortedByNewest;
            break;

        case 'indianAuthors': {
            // Priority: Urdu/Hindi
            const urduBooks = allBooks.filter(b => b.language === 'Urdu' || b.language === 'Hindi');
            if (urduBooks.length > 0) {
                autoBooks = urduBooks;
            } else {
                autoBooks = sortedByNewest;
                sliceStart = 6; // Offset if falling back
            }
            break;
        }

        case 'boxSets':
            autoBooks = sortedByNewest;
            sliceStart = 12;
            limit = 4;
            break;

        case 'children': {
            const childBooks = allBooks.filter(b =>
                b.category === 'General' ||
                (b.subcategory && b.subcategory.toLowerCase().includes('children'))
            );
            if (childBooks.length > 0) {
                autoBooks = childBooks;
            } else {
                autoBooks = sortedByNewest;
                sliceStart = 18;
            }
            break;
        }

        case 'fiction': {
            const engBooks = allBooks.filter(b => b.language === 'English');
            if (engBooks.length > 0) {
                autoBooks = engBooks;
            } else {
                autoBooks = sortedByNewest;
                sliceStart = 24;
            }
            break;
        }

        case 'sidebar':
            return allBooks;

        case 'top100':
            return sortedByRating.slice(0, Math.min(allBooks.length, 50));

        case 'hero':
            // Hero section is strictly manual. No automatic fallback.
            // If explicitBooks is empty, we return empty [], so script.js keeps the static image.
            return explicitBooks;

        default:
            autoBooks = sortedByNewest;
    }

    // Merge: Top priority = Explicit, then Auto
    // Ensure checking for duplicates by ID
    let combined = [...explicitBooks];

    // Get appropriate candidates based on slice logic
    const autoCandidates = autoBooks.slice(sliceStart);

    for (let book of autoCandidates) {
        if (!combined.find(cb => cb.id === book.id)) {
            combined.push(book);
        }
        if (combined.length >= limit) break;
    }

    return combined.slice(0, limit);
}

// ===== UI Rendering Functions =====

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = fullStars + (halfStar ? 1 : 0); i < 5; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

// Render book card for carousel
function createBookCard(book) {
    const discount = book.originalPrice && book.price
        ? Math.floor(((book.originalPrice - book.price) / book.originalPrice) * 100)
        : 0;

    // Truncate description for overlay
    const shortDescription = book.description
        ? (book.description.length > 100 ? book.description.substring(0, 100) + '...' : book.description)
        : 'Discover this amazing book from our collection.';

    // Escape quotes properly for JSON in onclick
    const bookJSON = JSON.stringify(book).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
        <div class="book-card" data-book-id="${book.id}">
            <div class="book-cover" onclick="viewBookDetail('${book.id}')" style="cursor: pointer;">
                <img src="${book.image}" alt="${book.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%22%23e8e8e8%22 width=%22200%22 height=%22300%22/%3E%3Cpath d=%22M80 110h40v80H80z%22 fill=%22%23ccc%22/%3E%3Cpath d=%22M85 115h30v70H85z%22 fill=%22%23fff%22/%3E%3Cpath d=%22M90 125h20v2H90zm0 8h20v2H90zm0 8h15v2H90z%22 fill=%22%23ddd%22/%3E%3C/svg%3E'">
                ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
                
                <!-- Quick Action Buttons -->
                <div class="book-actions">
                    <button class="btn-wishlist wishlist-btn" title="Add to Wishlist" onclick="event.stopPropagation(); addToWishlistCard(this, '${book.id}', '${bookJSON}')">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="btn-cart add-to-cart-btn" title="Add to Cart" onclick="event.stopPropagation(); addToCartCard('${book.id}', '${bookJSON}')">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>

                <!-- Hover Overlay with Description -->
                <div class="book-overlay">
                    <div class="overlay-title">${book.title}</div>
                    <div class="overlay-description">${shortDescription}</div>
                    <div class="overlay-price">
                        <span class="current">₹${book.price}</span>
                        ${book.originalPrice && book.originalPrice > book.price ? `<span class="original">₹${book.originalPrice}</span>` : ''}
                        ${discount > 0 ? `<span style="color: #4ade80; font-size: 11px; font-weight: 600;">${discount}% OFF</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="book-info" onclick="viewBookDetail('${book.id}')" style="cursor: pointer;">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <div class="book-rating">
                    ${generateStars(book.rating || 4.5)}
                    <span class="rating-text">(${book.rating || '4.5'})</span>
                </div>
                <div class="book-price">
                    <span class="price-current">₹${book.price}</span>
                    ${book.originalPrice && book.originalPrice > book.price ? `<span class="price-original">₹${book.originalPrice}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}


// Navigate to book detail page
function viewBookDetail(bookId) {
    window.location.href = `pages/book-detail.html?id=${bookId}`;
}

// ===== Card-Specific Action Functions =====

// Check if user is logged in using JWT token OR localStorage
function isUserLoggedIn() {
    // Method 1: Check API token (if API is loaded)
    if (typeof API !== 'undefined' && API.Token && API.Token.isValid()) {
        return true;
    }

    // Method 2: Check localStorage user (fallback for pages without API)
    const currentUser = JSON.parse(localStorage.getItem('abc_books_current_user') || 'null');
    if (currentUser && currentUser.email) {
        return true;
    }

    return false;
}

// Show login required notification and modal
function requireLogin(action) {
    showNotification(`Please login to ${action}`, 'info');

    // Show login modal if available
    if (typeof showLoginModal === 'function') {
        setTimeout(() => {
            showLoginModal();
        }, 500);
    }
}

// Add to wishlist with button animation
async function addToWishlistCard(btn, bookId, bookData) {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        requireLogin('add to wishlist');
        return;
    }

    // Parse book data if it's a string
    const book = typeof bookData === 'string' ? JSON.parse(bookData.replace(/&quot;/g, '"')) : bookData;

    try {
        // Call the API-integrated addToWishlist function
        if (typeof addToWishlist === 'function') {
            // Use bookId directly (no need to fetch from DB again as bookId IS the DB id)
            await addToWishlist(bookId, book);

            // Update button visual state
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.remove('far');
                icon.classList.add('fas');
            }
            btn.classList.add('active');
        }
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showNotification('Error adding to wishlist. Please try again.', 'error');
    }
}

// Add to cart from card with animation
async function addToCartCard(bookId, bookData) {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        // ✅ SAVE PENDING ACTION for auto-continue after login
        localStorage.setItem('abc_pending_action', 'add_to_cart');
        localStorage.setItem('abc_pending_book', JSON.stringify({
            bookId: bookId,
            bookData: bookData,
            quantity: 1,
            source: 'homepage_card'
        }));

        requireLogin('add to cart');
        return;
    }

    // Parse book data if it's a string
    const book = typeof bookData === 'string' ? JSON.parse(bookData.replace(/&quot;/g, '"')) : bookData;

    try {
        // Call the API-integrated addToCart function directly
        if (typeof addToCart === 'function') {
            await addToCart(bookId, book);
        } else {
            throw new Error('addToCart function not available');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart. Please try again.', 'error');
    }
}

// Buy Now - Add to cart and go to checkout
async function buyNow(bookId, bookData) {
    // Check if user is logged in
    if (!isUserLoggedIn()) {
        // ✅ SAVE PENDING ACTION for auto-continue after login
        localStorage.setItem('abc_pending_action', 'buy_now');
        localStorage.setItem('abc_pending_book', JSON.stringify({
            bookId: bookId,
            bookData: bookData,
            quantity: 1,
            source: 'homepage_card'
        }));

        requireLogin('buy this book');
        return;
    }

    // Parse book data if it's a string
    const book = typeof bookData === 'string' ? JSON.parse(bookData.replace(/&quot;/g, '"')) : bookData;

    try {
        // Add to cart directly
        if (typeof addToCart === 'function') {
            await addToCart(bookId, book);

            // Show success message before redirect
            showNotification('Redirecting to checkout...', 'success');

            // Redirect to checkout after adding to cart
            setTimeout(() => {
                window.location.href = 'pages/checkout.html';
            }, 1000);
        } else {
            throw new Error('addToCart function not available');
        }
    } catch (error) {
        console.error('Error in buy now:', error);
        showNotification('Error processing request. Please try again.', 'error');
    }
}

// ===== Cart & Wishlist Functions =====

function addToCart(bookId, book) {
    // ✅ CHECK IF USER IS LOGGED IN FIRST
    if (!isUserLoggedIn()) {
        // Save pending action for auto-continue after login
        localStorage.setItem('abc_pending_action', 'add_to_cart');
        localStorage.setItem('abc_pending_book', JSON.stringify({
            bookId: bookId,
            bookData: book,
            quantity: 1,
            source: 'homepage'
        }));

        requireLogin('add to cart');
        return;
    }

    // User is logged in - proceed with adding to cart
    let cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');

    const existingIndex = cart.findIndex(item => item.id === bookId);
    if (existingIndex >= 0) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({ ...book, id: bookId, quantity: 1 });
    }

    localStorage.setItem('abc_cart', JSON.stringify(cart));
    updateCartBadge();
    showNotification(`${book.title || 'Book'} added to cart!`, 'success');
}

function addToWishlist(bookId, book) {
    // ✅ CHECK IF USER IS LOGGED IN FIRST
    if (!isUserLoggedIn()) {
        // Save pending action for auto-continue after login
        localStorage.setItem('abc_pending_action', 'add_to_wishlist');
        localStorage.setItem('abc_pending_book', JSON.stringify({
            bookId: bookId,
            bookData: book,
            quantity: 1,
            source: 'homepage'
        }));

        requireLogin('add to wishlist');
        return;
    }

    // User is logged in - proceed with adding to wishlist
    let wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');

    if (!wishlist.some(item => item.id === bookId)) {
        wishlist.push({ ...book, id: bookId });
        localStorage.setItem('abc_wishlist', JSON.stringify(wishlist));
        updateWishlistBadge();
        showNotification(`${book.title || 'Book'} added to wishlist!`, 'success');
    } else {
        showNotification('Already in wishlist', 'info');
    }
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = count;
}

function updateWishlistBadge() {
    const wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');
    const badge = document.getElementById('wishlistCount');
    if (badge) badge.textContent = wishlist.length;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2500);
}

// Initialize badges on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    updateWishlistBadge();
});
