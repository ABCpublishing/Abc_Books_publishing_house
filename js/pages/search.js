// ===== Search Page JavaScript =====

let allBooks = [];
let searchResults = [];
let currentView = 'grid';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();

    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query) {
        document.getElementById('searchInput').value = query;
        performSearch(query);
    } else {
        showAllBooks();
    }

    // Search on Enter
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
});

// Load all books from storage
function loadBooks() {
    const data = localStorage.getItem('abc_books_data');
    if (data) {
        const parsed = JSON.parse(data);
        allBooks = parsed.books || [];
    }

    if (allBooks.length === 0 && typeof DEMO_ISLAMIC_BOOKS !== 'undefined') {
        allBooks = DEMO_ISLAMIC_BOOKS;
    }
}

// Perform search
function performSearch(query = null) {
    const searchQuery = query || document.getElementById('searchInput').value.trim();

    if (!searchQuery) {
        showAllBooks();
        return;
    }

    // Update URL
    window.history.replaceState({}, '', `search.html?q=${encodeURIComponent(searchQuery)}`);

    // Update page title
    document.title = `"${searchQuery}" - Search Results | ABC Books`;
    document.getElementById('searchQuery').innerHTML = `Showing results for: <strong>"${searchQuery}"</strong>`;

    // Search in books
    const queryLower = searchQuery.toLowerCase();
    searchResults = allBooks.filter(book => {
        return (
            book.title.toLowerCase().includes(queryLower) ||
            (book.author && book.author.toLowerCase().includes(queryLower)) ||
            (book.category && book.category.toLowerCase().includes(queryLower)) ||
            (book.subcategory && book.subcategory.toLowerCase().includes(queryLower)) ||
            (book.language && book.language.toLowerCase().includes(queryLower)) ||
            (book.description && book.description.toLowerCase().includes(queryLower)) ||
            (book.isbn && book.isbn.includes(queryLower))
        );
    });

    renderResults();
}

// Show all books (no search)
function showAllBooks() {
    searchResults = [...allBooks];
    document.getElementById('searchQuery').innerHTML = 'Browse all books';
    renderResults();
}

// Render results
function renderResults() {
    const container = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const countEl = document.getElementById('resultsCount');

    if (searchResults.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        countEl.textContent = 'No results found';
        return;
    }

    container.style.display = currentView === 'grid' ? 'grid' : 'flex';
    container.className = currentView === 'grid' ? 'results-grid' : 'results-list';
    noResults.style.display = 'none';
    countEl.textContent = `Showing ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`;

    if (currentView === 'grid') {
        container.innerHTML = searchResults.map(book => createGridCard(book)).join('');
    } else {
        container.innerHTML = searchResults.map(book => createListCard(book)).join('');
    }
}

// Create grid card HTML
function createGridCard(book) {
    const discount = book.originalPrice && book.price
        ? Math.floor(((book.originalPrice - book.price) / book.originalPrice) * 100)
        : 0;

    return `
        <div class="result-card" onclick="viewBook('${book.id}')">
            <div class="book-image">
                ${discount > 0 ? `<span class="discount-tag">-${discount}%</span>` : ''}
                <div class="quick-actions">
                    <button onclick="event.stopPropagation(); addToWishlist('${book.id}')" title="Add to Wishlist">
                        <i class="far fa-heart"></i>
                    </button>
                    <button onclick="event.stopPropagation(); addToCart('${book.id}')" title="Add to Cart">
                        <i class="fas fa-shopping-cart"></i>
                    </button>
                </div>
                <img src="${book.image}" alt="${book.title}"
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22300%22/%3E%3C/svg%3E'">
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author || 'Unknown Author'}</p>
                <div class="book-rating">
                    ${generateStars(book.rating || 4.5)}
                    <span>(${book.rating || 4.5})</span>
                </div>
                <div class="book-price">
                    <span class="current-price">₹${book.price}</span>
                    ${book.originalPrice ? `<span class="original-price">₹${book.originalPrice}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Create list card HTML
function createListCard(book) {
    return `
        <div class="result-card-list" onclick="viewBook('${book.id}')">
            <div class="book-image">
                <img src="${book.image}" alt="${book.title}"
                    onerror="this.src='data:image/svg+xml,...'">
            </div>
            <div class="book-details">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author || 'Unknown Author'}</p>
                <p class="book-description">${book.description || 'A wonderful book from our collection.'}</p>
                <div class="book-meta">
                    <div class="book-price">
                        <span class="current-price">₹${book.price}</span>
                        ${book.originalPrice ? `<span class="original-price">₹${book.originalPrice}</span>` : ''}
                    </div>
                    <div class="book-actions">
                        <button class="btn-add-cart" onclick="event.stopPropagation(); addToCart('${book.id}')">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate star rating
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

// View book details
function viewBook(bookId) {
    window.location.href = `book-detail.html?id=${bookId}`;
}

// Toggle view
function toggleView(view) {
    currentView = view;

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    renderResults();
}

// Sort results
function sortResults() {
    const sortBy = document.getElementById('sortBy').value;

    switch (sortBy) {
        case 'priceLow':
            searchResults.sort((a, b) => a.price - b.price);
            break;
        case 'priceHigh':
            searchResults.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            searchResults.sort((a, b) => (b.rating || 4.5) - (a.rating || 4.5));
            break;
        case 'newest':
            searchResults.sort((a, b) => new Date(b.addedDate || Date.now()) - new Date(a.addedDate || Date.now()));
            break;
        default:
            // Relevance - keep original order
            break;
    }

    renderResults();
}

// Apply price filter
function applyPriceFilter() {
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;

    searchResults = searchResults.filter(book => {
        return book.price >= minPrice && book.price <= maxPrice;
    });

    renderResults();
}

// Clear filters
function clearFilters() {
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.querySelectorAll('.filter-options input').forEach(input => {
        input.checked = input.value === 'all';
    });

    // Re-run search
    performSearch();
}

// Add to wishlist - CHECK LOGIN FIRST
function addToWishlist(bookId) {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('abc_books_current_user') || 'null');

    if (!currentUser || !currentUser.email) {
        // User is NOT logged in - save pending action and show login modal
        const book = allBooks.find(b => b.id === bookId);

        localStorage.setItem('abc_pending_action', 'add_to_wishlist');
        localStorage.setItem('abc_pending_book', JSON.stringify({
            bookId: bookId,
            bookData: book,
            quantity: 1,
            source: 'search_page'
        }));

        showNotification('Please login to add items to wishlist', 'info');

        // Show login modal
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
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    let wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');

    if (!wishlist.some(item => item.id === bookId)) {
        wishlist.push(book);
        localStorage.setItem('abc_wishlist', JSON.stringify(wishlist));
        showNotification('Added to wishlist!', 'success');
    } else {
        showNotification('Already in wishlist', 'info');
    }
}

// Add to cart - CHECK LOGIN FIRST
function addToCart(bookId) {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('abc_books_current_user') || 'null');

    if (!currentUser || !currentUser.email) {
        // User is NOT logged in - save pending action and show login modal
        const book = allBooks.find(b => b.id === bookId);

        localStorage.setItem('abc_pending_action', 'add_to_cart');
        localStorage.setItem('abc_pending_book', JSON.stringify({
            bookId: bookId,
            bookData: book,
            quantity: 1,
            source: 'search_page'
        }));

        showNotification('Please login to add items to cart', 'info');

        // Show login modal
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

    // User IS logged in - add to cart
    const book = allBooks.find(b => b.id === bookId);
    if (!book) return;

    let cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');
    const existingIndex = cart.findIndex(item => item.id === bookId);

    if (existingIndex >= 0) {
        cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
        cart.push({ ...book, quantity: 1 });
    }

    localStorage.setItem('abc_cart', JSON.stringify(cart));
    showNotification('Added to cart!', 'success');
}

// Show notification
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
    }, 3000);
}

// Add animation styles
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
`;
document.head.appendChild(style);
