// ===== Book Detail Page JavaScript =====

// Dynamic API URL (same as api.js)
const BOOK_DETAIL_API_BASE = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? '/api'
    : 'http://localhost:3001/api';

let currentBook = null;
let quantity = 1;

// Get book ID from URL
function getBookIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Load book details
function loadBookDetails() {
    const bookId = getBookIdFromUrl();

    if (!bookId) {
        showError('Book not found');
        return;
    }

    // Get books data
    const data = localStorage.getItem('abc_books_data');
    if (data) {
        const parsed = JSON.parse(data);
        currentBook = parsed.books.find(b => b.id === bookId);
    }

    // Fallback to demo data
    if (!currentBook && typeof DEMO_ISLAMIC_BOOKS !== 'undefined') {
        currentBook = DEMO_ISLAMIC_BOOKS.find(b => b.id === bookId);
    }

    if (!currentBook) {
        showError('Book not found');
        return;
    }

    // Populate page with book data
    populateBookDetails();
    loadRelatedBooks();
}

// Populate book details on page
function populateBookDetails() {
    // Update page title
    document.title = `${currentBook.title} | ABC Books`;

    // Breadcrumb
    document.getElementById('breadcrumbTitle').textContent = currentBook.title;

    // Book image
    const bookImage = document.getElementById('bookImage');
    bookImage.src = currentBook.image;
    bookImage.alt = currentBook.title;
    bookImage.onerror = function () {
        this.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%22%23e8e8e8%22 width=%22200%22 height=%22300%22/%3E%3Cpath d=%22M80 110h40v80H80z%22 fill=%22%23ccc%22/%3E%3Cpath d=%22M85 115h30v70H85z%22 fill=%22%23fff%22/%3E%3Cpath d=%22M90 125h20v2H90zm0 8h20v2H90zm0 8h15v2H90z%22 fill=%22%23ddd%22/%3E%3C/svg%3E';
    };

    // Calculate discount
    const discount = currentBook.originalPrice && currentBook.price
        ? Math.floor(((currentBook.originalPrice - currentBook.price) / currentBook.originalPrice) * 100)
        : 0;

    // Discount badge
    const discountBadge = document.getElementById('discountBadge');
    if (discount > 0) {
        discountBadge.textContent = `-${discount}%`;
        discountBadge.style.display = 'block';
    } else {
        discountBadge.style.display = 'none';
    }

    // Book title
    document.getElementById('bookTitle').textContent = currentBook.title;

    // Author
    document.getElementById('bookAuthor').innerHTML = `by <span>${currentBook.author}</span>`;

    // Rating
    const rating = currentBook.rating || 4.5;
    document.getElementById('bookStars').innerHTML = generateStars(rating);
    document.getElementById('ratingText').textContent = `${rating} (${Math.floor(Math.random() * 200 + 50)} reviews)`;

    // Price
    document.getElementById('currentPrice').textContent = `₹${currentBook.price}`;
    if (currentBook.originalPrice && currentBook.originalPrice > currentBook.price) {
        document.getElementById('originalPrice').textContent = `₹${currentBook.originalPrice}`;
        document.getElementById('originalPrice').style.display = 'inline';
        document.getElementById('discountPercent').textContent = `${discount}% OFF`;
        document.getElementById('discountPercent').style.display = 'inline';
    } else {
        document.getElementById('originalPrice').style.display = 'none';
        document.getElementById('discountPercent').style.display = 'none';
    }

    // Meta info
    document.getElementById('bookISBN').textContent = currentBook.isbn || '978-' + Math.random().toString().slice(2, 12);
    document.getElementById('bookYear').textContent = currentBook.year || '2024';

    // Details tab
    document.getElementById('detailTitle').textContent = currentBook.title;
    document.getElementById('detailAuthor').textContent = currentBook.author;
    document.getElementById('detailISBN').textContent = currentBook.isbn || '978-' + Math.random().toString().slice(2, 12);
    document.getElementById('detailYear').textContent = currentBook.year || '2024';

    // Overall rating in reviews
    document.getElementById('overallRating').textContent = rating;
    document.getElementById('overallStars').innerHTML = generateStars(rating);
}

// Generate star rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (halfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';

    return stars;
}

// Load related books
function loadRelatedBooks() {
    const container = document.getElementById('relatedBooks');
    if (!container) return;

    // Get all books
    let allBooks = [];
    const data = localStorage.getItem('abc_books_data');
    if (data) {
        const parsed = JSON.parse(data);
        allBooks = parsed.books || [];
    }

    if (allBooks.length === 0 && typeof DEMO_ISLAMIC_BOOKS !== 'undefined') {
        allBooks = DEMO_ISLAMIC_BOOKS;
    }

    // Filter out current book and get random 4-6 books
    const otherBooks = allBooks.filter(b => b.id !== currentBook?.id);
    const relatedBooks = otherBooks.sort(() => 0.5 - Math.random()).slice(0, 6);

    if (relatedBooks.length === 0) {
        container.innerHTML = '<p style="color: #999;">No related books found</p>';
        return;
    }

    container.innerHTML = relatedBooks.map(book => `
        <div class="related-book-card" onclick="viewBook('${book.id}')">
            <div class="book-cover">
                <img src="${book.image}" alt="${book.title}" 
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%22%23e8e8e8%22 width=%22200%22 height=%22300%22/%3E%3Cpath d=%22M80 110h40v80H80z%22 fill=%22%23ccc%22/%3E%3Cpath d=%22M85 115h30v70H85z%22 fill=%22%23fff%22/%3E%3Cpath d=%22M90 125h20v2H90zm0 8h20v2H90zm0 8h15v2H90z%22 fill=%22%23ddd%22/%3E%3C/svg%3E'">
            </div>
            <div class="book-info">
                <h4 class="book-title">${book.title}</h4>
                <p class="book-author">${book.author}</p>
                <p class="book-price">₹${book.price}</p>
            </div>
        </div>
    `).join('');
}

// View another book
function viewBook(bookId) {
    window.location.href = `book-detail.html?id=${bookId}`;
}

// Quantity controls
function increaseQty() {
    const input = document.getElementById('quantity');
    if (quantity < 10) {
        quantity++;
        input.value = quantity;
    }
}

function decreaseQty() {
    const input = document.getElementById('quantity');
    if (quantity > 1) {
        quantity--;
        input.value = quantity;
    }
}

// Add to cart from detail page
async function addToCartDetail() {
    if (!currentBook) return;

    // Check if user is logged in - Strict check using token
    const token = localStorage.getItem('jwt_token');
    const currentUser = JSON.parse(localStorage.getItem('abc_books_current_user') || 'null');

    if (!token || !currentUser || !currentUser.id) {
        // User is NOT logged in - show login modal
        showNotification('Please login or create an account to add items to cart', 'info');

        // Show login modal if available
        if (typeof showLoginModal === 'function') {
            setTimeout(() => showLoginModal(), 100);
        } else {
            // Fallback: try to find and show the login modal directly
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('active');
                if (document.getElementById('loginTabBtn')) {
                    document.getElementById('loginTabBtn').click();
                }
                document.body.style.overflow = 'hidden';
            }
        }
        return;
    }

    // User IS logged in - proceed with adding to cart
    const qty = parseInt(document.getElementById('quantity').value) || 1;

    try {
        // Try to use API if available
        if (typeof API !== 'undefined' && typeof addToCart === 'function') {
            try {
                // Fetch books from database
                const response = await fetch(`${BOOK_DETAIL_API_BASE}/books`);
                if (response.ok) {
                    const books = await response.json();
                    const dbBook = books.find(b => b.isbn === currentBook.id);

                    if (dbBook) {
                        // Use API-integrated cart
                        for (let i = 0; i < qty; i++) {
                            await addToCart(dbBook.id, currentBook);
                        }
                        showNotification(`${currentBook.title} added to cart!`, 'success');
                        updateCartBadge();
                        return;
                    }
                }
            } catch (apiError) {
                console.log('API not available, using localStorage fallback');
            }
        }

        // Fallback to localStorage cart
        let cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');

        // Check if book already in cart
        const existingItem = cart.find(item => item.id === currentBook.id);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + qty;
        } else {
            cart.push({
                id: currentBook.id,
                title: currentBook.title,
                author: currentBook.author,
                price: currentBook.price,
                image: currentBook.image,
                quantity: qty
            });
        }

        localStorage.setItem('abc_cart', JSON.stringify(cart));
        showNotification(`${currentBook.title} added to cart!`, 'success');
        updateCartBadge();

    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error adding to cart. Please try again.', 'error');
    }
}

// Buy Now - Check login first, then direct purchase
async function buyNow() {
    if (!currentBook) return;

    // Check if user is logged in - Strict check using token
    const token = localStorage.getItem('jwt_token');
    const currentUser = JSON.parse(localStorage.getItem('abc_books_current_user') || 'null');

    if (!token || !currentUser || !currentUser.id) {
        // User is NOT logged in - save pending action and show login modal
        localStorage.setItem('abc_pending_action', 'buy_now');

        // Also save the current book and quantity for later
        const qty = parseInt(document.getElementById('quantity').value) || 1;
        localStorage.setItem('abc_pending_book', JSON.stringify({
            book: currentBook,
            quantity: qty
        }));

        showNotification('Please login or create an account to continue', 'info');

        // Show login modal if available
        if (typeof showLoginModal === 'function') {
            setTimeout(() => showLoginModal(), 100);
        } else {
            // Fallback: try to find and show the login modal directly
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('active');
                if (document.getElementById('loginTabBtn')) {
                    document.getElementById('loginTabBtn').click();
                }
                document.body.style.overflow = 'hidden';
            }
        }
        return;
    }

    // User IS logged in - proceed with purchase
    continueBuyNow();
}

// Continue Buy Now after login (or if already logged in)
function continueBuyNow() {
    // Check if there's a pending book (from before login)
    const pendingBookData = localStorage.getItem('abc_pending_book');
    let bookToAdd = currentBook;
    let qtyToAdd = 1;

    if (pendingBookData) {
        // Use the pending book data
        const pending = JSON.parse(pendingBookData);
        bookToAdd = pending.book;
        qtyToAdd = pending.quantity;
        // Clear the pending data
        localStorage.removeItem('abc_pending_book');
    } else {
        // Use current page data
        qtyToAdd = parseInt(document.getElementById('quantity')?.value) || 1;
    }

    if (!bookToAdd) {
        showNotification('Error: Book data not found', 'error');
        return;
    }

    try {
        // Directly add to localStorage cart for quick purchase
        let cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');

        // Check if book already in cart
        const existingItem = cart.find(item => item.id === bookToAdd.id);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + qtyToAdd;
        } else {
            cart.push({
                id: bookToAdd.id,
                title: bookToAdd.title,
                author: bookToAdd.author,
                price: bookToAdd.price,
                image: bookToAdd.image,
                quantity: qtyToAdd
            });
        }

        localStorage.setItem('abc_cart', JSON.stringify(cart));

        // Show quick notification and redirect
        showNotification('Redirecting to checkout...', 'success');

        // Redirect to checkout immediately
        setTimeout(() => {
            window.location.href = 'checkout.html';
        }, 500);

    } catch (error) {
        console.error('Error in continue buy now:', error);
        showNotification('Error processing request. Please try again.', 'error');
    }
}

// Add to wishlist - CHECK LOGIN FIRST
function addToWishlistDetail() {
    if (!currentBook) return;

    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('abc_books_current_user') || 'null');

    if (!currentUser || !currentUser.email) {
        // User is NOT logged in - show login modal
        showNotification('Please login to add items to wishlist', 'info');

        // Show login modal if available
        if (typeof showLoginModal === 'function') {
            setTimeout(() => showLoginModal(), 500);
        } else {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        return;
    }

    // User IS logged in - add to wishlist
    let wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');

    if (!wishlist.find(item => item.id === currentBook.id)) {
        wishlist.push({
            id: currentBook.id,
            title: currentBook.title,
            author: currentBook.author,
            price: currentBook.price,
            image: currentBook.image
        });
        localStorage.setItem('abc_wishlist', JSON.stringify(wishlist));
        showNotification(`${currentBook.title} added to wishlist!`, 'success');
    } else {
        showNotification('Already in wishlist', 'info');
    }

    updateWishlistBadge();
}

// Share book
function shareBook() {
    if (navigator.share) {
        navigator.share({
            title: currentBook.title,
            text: `Check out ${currentBook.title} by ${currentBook.author} at ABC Books!`,
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        showNotification('Link copied to clipboard!', 'success');
    }
}

// Update cart badge
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = count;
}

// Update wishlist badge
function updateWishlistBadge() {
    const wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');
    const badge = document.getElementById('wishlistCount');
    if (badge) badge.textContent = wishlist.length;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #3498db, #5dade2)'};
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

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show error
function showError(message) {
    document.querySelector('.book-detail-main').innerHTML = `
        <div class="container" style="text-align: center; padding: 100px 20px;">
            <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #e74c3c; margin-bottom: 20px;"></i>
            <h2 style="color: #2c1810; margin-bottom: 15px;">Oops! Book Not Found</h2>
            <p style="color: #666; margin-bottom: 25px;">${message}</p>
            <a href="index.html" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #8B4513, #A0522D); color: white; text-decoration: none; border-radius: 10px; font-weight: 600;">
                <i class="fas fa-home"></i> Back to Home
            </a>
        </div>
    `;
}

// Tab functionality
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update panels
            tabPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === `${targetTab}Panel`) {
                    panel.classList.add('active');
                }
            });
        });
    });
}

// Cart sidebar functions - CHECK LOGIN FIRST
function toggleCart() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('abc_books_current_user') || 'null');

    if (!currentUser || !currentUser.email) {
        // User is NOT logged in - show login modal
        showNotification('Please login to view your cart', 'info');

        // Show login modal if available
        if (typeof showLoginModal === 'function') {
            setTimeout(() => showLoginModal(), 500);
        } else {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        return;
    }

    // User IS logged in - open cart
    document.getElementById('cartPanel').classList.toggle('open');
    document.getElementById('cartOverlay').classList.toggle('active');
    loadCartItems();
}

function closeCart() {
    document.getElementById('cartPanel').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('active');
}

function loadCartItems() {
    const container = document.getElementById('cartContent');
    const cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-message"><i class="fas fa-shopping-cart"></i> Your cart is empty</p>';
        document.getElementById('cartTotal').textContent = '₹0';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.title}" onerror="this.src='data:image/svg+xml,...'">
                <div class="item-details">
                    <h4>${item.title}</h4>
                    <p>₹${item.price} × ${item.quantity}</p>
                </div>
                <button onclick="removeFromCart('${item.id}')" class="remove-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
    }).join('');

    document.getElementById('cartTotal').textContent = `₹${total}`;
}

function removeFromCart(bookId) {
    let cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');
    cart = cart.filter(item => item.id !== bookId);
    localStorage.setItem('abc_cart', JSON.stringify(cart));
    loadCartItems();
    updateCartBadge();
}

function proceedToCheckout() {
    window.location.href = 'checkout.html';
}

// Wishlist sidebar functions - CHECK LOGIN FIRST
function toggleWishlist() {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('abc_books_current_user') || 'null');

    if (!currentUser || !currentUser.email) {
        // User is NOT logged in - show login modal
        showNotification('Please login to view your wishlist', 'info');

        // Show login modal if available
        if (typeof showLoginModal === 'function') {
            setTimeout(() => showLoginModal(), 500);
        } else {
            const loginModal = document.getElementById('loginModal');
            if (loginModal) {
                loginModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        return;
    }

    // User IS logged in - open wishlist
    document.getElementById('wishlistPanel').classList.toggle('open');
    document.getElementById('wishlistOverlay').classList.toggle('active');
    loadWishlistItems();
}

function closeWishlist() {
    document.getElementById('wishlistPanel').classList.remove('open');
    document.getElementById('wishlistOverlay').classList.remove('active');
}

function loadWishlistItems() {
    const container = document.getElementById('wishlistContent');
    const wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');

    if (wishlist.length === 0) {
        container.innerHTML = '<p class="empty-message"><i class="fas fa-heart-broken"></i> Your wishlist is empty</p>';
        return;
    }

    container.innerHTML = wishlist.map(item => `
        <div class="wishlist-item">
            <img src="${item.image}" alt="${item.title}">
            <div class="item-details">
                <h4>${item.title}</h4>
                <p>₹${item.price}</p>
            </div>
            <button onclick="removeFromWishlist('${item.id}')" class="remove-btn"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

function removeFromWishlist(bookId) {
    let wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');
    wishlist = wishlist.filter(item => item.id !== bookId);
    localStorage.setItem('abc_wishlist', JSON.stringify(wishlist));
    loadWishlistItems();
    updateWishlistBadge();
}

// Show review form
function showReviewForm() {
    showNotification('Review feature coming soon!', 'info');
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100px); opacity: 0; }
    }
    .cart-item, .wishlist-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border-bottom: 1px solid #f0f0f0;
    }
    .cart-item img, .wishlist-item img {
        width: 60px;
        height: 80px;
        object-fit: cover;
        border-radius: 5px;
    }
    .cart-item .item-details, .wishlist-item .item-details {
        flex: 1;
    }
    .cart-item h4, .wishlist-item h4 {
        font-size: 14px;
        margin-bottom: 5px;
        color: #333;
    }
    .cart-item p, .wishlist-item p {
        font-size: 13px;
        color: #27ae60;
        font-weight: 600;
    }
    .remove-btn {
        background: none;
        border: none;
        color: #e74c3c;
        cursor: pointer;
        padding: 5px;
    }
`;
document.head.appendChild(style);

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadBookDetails();
    initializeTabs();
    updateCartBadge();
    updateWishlistBadge();
});
