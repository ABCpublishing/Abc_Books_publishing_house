// ===== Search Page JavaScript =====

let allBooks = [];
let searchResults = [];
let currentView = 'grid';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    const language = urlParams.get('language');
    const subcategory = urlParams.get('subcategory');

    if (query) {
        document.getElementById('searchInput').value = query;
    }

    // If language param is provided, pre-check appropriate category
    if (language) {
        // Uncheck "All Categories" and check the matching language
        const allCatCheckbox = document.querySelector('input[name="category"][value="all"]');
        if (allCatCheckbox) allCatCheckbox.checked = false;

        const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
        categoryCheckboxes.forEach(cb => {
            if (cb.value !== 'all' && cb.value.toLowerCase() === language.toLowerCase()) {
                cb.checked = true;
            } else if (cb.value !== 'all') {
                cb.checked = false;
            }
        });

        // Update the header text
        const qEl = document.getElementById('searchQuery');
        if (qEl) {
            qEl.innerHTML = `Browsing: <strong>${language}</strong>${subcategory ? ` → <strong>${subcategory}</strong>` : ''}`;
        }
        document.title = `${language}${subcategory ? ' - ' + subcategory : ''} | ABC Books`;
    }

    // Perform search (also applies language/subcategory filters from URL)
    performSearch(query || '', language, subcategory);

    // Search on Enter
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const newQuery = document.getElementById('searchInput').value.trim();
            if (newQuery) {
                window.location.href = `search.html?q=${encodeURIComponent(newQuery)}`;
            }
        }
    });

    // ===== Category Checkbox Listeners =====
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    categoryCheckboxes.forEach(cb => {
        cb.addEventListener('change', handleCategoryChange);
    });

    // ===== Rating Radio Listeners =====
    const ratingRadios = document.querySelectorAll('input[name="rating"]');
    ratingRadios.forEach(radio => {
        radio.addEventListener('change', applyAllFilters);
    });
});

// Handle category checkbox change
function handleCategoryChange(e) {
    const allCheckbox = document.querySelector('input[name="category"][value="all"]');
    const otherCheckboxes = document.querySelectorAll('input[name="category"]:not([value="all"])');

    if (e.target.value === 'all') {
        // If "All Categories" is checked, uncheck all others
        if (e.target.checked) {
            otherCheckboxes.forEach(cb => cb.checked = false);
        }
    } else {
        // If a specific category is checked, uncheck "All Categories"
        if (e.target.checked) {
            allCheckbox.checked = false;
        }

        // If no specific category is checked, re-check "All Categories"
        const anyChecked = Array.from(otherCheckboxes).some(cb => cb.checked);
        if (!anyChecked) {
            allCheckbox.checked = true;
        }
    }

    applyAllFilters();
}

// ===== Master Filter Function =====
// Applies ALL filters together: category + price + rating
function applyAllFilters() {
    let filtered = [...allBooks];

    // 1. Category Filter
    const allCheckbox = document.querySelector('input[name="category"][value="all"]');
    if (!allCheckbox || !allCheckbox.checked) {
        const checkedCategories = Array.from(
            document.querySelectorAll('input[name="category"]:checked')
        ).map(cb => cb.value.toLowerCase());

        if (checkedCategories.length > 0) {
            filtered = filtered.filter(book => {
                const bookLang = (book.language || '').toLowerCase();
                const bookCat = (book.category || '').toLowerCase();

                return checkedCategories.some(cat => {
                    if (cat === 'urdu') return bookLang === 'urdu';
                    if (cat === 'english') return bookLang === 'english';
                    if (cat === 'arabic') return bookLang === 'arabic';
                    if (cat === 'kashmiri') return bookLang === 'kashmiri';
                    if (cat === 'islamic') return bookCat === 'islamic' || bookLang === 'urdu' || bookLang === 'arabic';
                    return bookLang.includes(cat) || bookCat.includes(cat);
                });
            });
        }
    }

    // 2. Price Filter
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;
    if (minPrice > 0 || maxPrice < Infinity) {
        filtered = filtered.filter(book => {
            const price = parseFloat(book.price) || 0;
            return price >= minPrice && price <= maxPrice;
        });
    }

    // 3. Rating Filter
    const selectedRating = document.querySelector('input[name="rating"]:checked');
    if (selectedRating) {
        const minRating = parseInt(selectedRating.value);
        filtered = filtered.filter(book => {
            return (parseFloat(book.rating) || 0) >= minRating;
        });
    }

    searchResults = filtered;
    renderResults();
}

// Perform search
async function performSearch(query, language, subcategory) {
    const container = document.getElementById('searchResults');
    const loadingHtml = `
        <div class="loading-state" style="grid-column: 1/-1; text-align: center; padding: 40px;">
            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
            <p>Searching our collection...</p>
        </div>
    `;

    if (container) container.innerHTML = loadingHtml;

    try {
        let response;
        if (typeof API !== 'undefined' && API.Books) {
            response = await API.Books.getAll({ search: query, limit: 200 });
        } else {
            console.error('API not found');
            response = { books: [] };
        }

        allBooks = response.books || [];

        // Apply URL-based language/subcategory filter on initial load
        if (language) {
            allBooks = allBooks.filter(book => {
                const bookLang = (book.language || '').toLowerCase();
                return bookLang === language.toLowerCase();
            });
        }
        if (subcategory) {
            allBooks = allBooks.filter(book => {
                const bookSub = (book.subcategory || '').toLowerCase();
                return bookSub === subcategory.toLowerCase();
            });
        }

        searchResults = [...allBooks];

        // Update UI
        if (query && !language) {
            document.title = `"${query}" - Search Results | ABC Books`;
            const qEl = document.getElementById('searchQuery');
            if (qEl) qEl.innerHTML = `Showing results for: <strong>"${query}"</strong>`;
        } else if (!language) {
            const qEl = document.getElementById('searchQuery');
            if (qEl) qEl.innerHTML = 'Browse All Books';
        }

        // Apply any pre-set filters (e.g., from URL language params that set checkboxes)
        applyAllFilters();

    } catch (error) {
        console.error('Search error:', error);
        if (container) container.innerHTML = `<p class="error-msg">Error loading results. Please try again.</p>`;
    }
}

// Render results
function renderResults() {
    const container = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    const countEl = document.getElementById('resultsCount');

    if (!container || !noResults) return;

    if (searchResults.length === 0) {
        container.style.display = 'none';
        noResults.style.display = 'block';
        if (countEl) countEl.textContent = 'No results found';
        return;
    }

    container.style.display = currentView === 'grid' ? 'grid' : 'flex';
    container.className = currentView === 'grid' ? 'results-grid' : 'results-list';
    noResults.style.display = 'none';
    if (countEl) countEl.textContent = `Showing ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`;

    if (currentView === 'grid') {
        container.innerHTML = searchResults.map(book => createGridCard(book)).join('');
    } else {
        container.innerHTML = searchResults.map(book => createListCard(book)).join('');
    }
}

// Create grid card HTML
function createGridCard(book) {
    const discount = book.original_price && book.price
        ? Math.floor(((book.original_price - book.price) / book.original_price) * 100)
        : 0;

    const imageSrc = book.image || 'https://via.placeholder.com/200x300?text=No+Image';

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
                <img src="${imageSrc}" alt="${book.title}"
                    onerror="this.src='https://via.placeholder.com/200x300?text=Cover+Not+Found'">
            </div>
            <div class="book-info">
                <h3 class="book-title" title="${book.title}">${book.title}</h3>
                <p class="book-author">${book.author || 'Unknown Author'}</p>
                <div class="book-rating">
                    ${generateStars(book.rating || 4.5)}
                    <span>(${book.rating || 4.5})</span>
                </div>
                <div class="book-price">
                    <span class="current-price">₹${book.price}</span>
                    ${book.original_price ? `<span class="original-price">₹${book.original_price}</span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// Create list card HTML
function createListCard(book) {
    const imageSrc = book.image || 'https://via.placeholder.com/200x300?text=No+Image';

    return `
        <div class="result-card-list" onclick="viewBook('${book.id}')">
            <div class="book-image">
                <img src="${imageSrc}" alt="${book.title}"
                    onerror="this.src='https://via.placeholder.com/200x300?text=Cover+Not+Found'">
            </div>
            <div class="book-details">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author || 'Unknown Author'}</p>
                <p class="book-description">${book.description ? book.description.substring(0, 150) + '...' : 'No description available.'}</p>
                <div class="book-meta">
                    <div class="book-price">
                        <span class="current-price">₹${book.price}</span>
                        ${book.original_price ? `<span class="original-price">₹${book.original_price}</span>` : ''}
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

// Sort results (Client Side)
function sortResults() {
    const sortBy = document.getElementById('sortBy')?.value;
    if (!sortBy) return;

    switch (sortBy) {
        case 'priceLow':
            searchResults.sort((a, b) => a.price - b.price);
            break;
        case 'priceHigh':
            searchResults.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            searchResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        case 'newest':
            searchResults.sort((a, b) => (b.id || 0) - (a.id || 0));
            break;
        default:
            // Relevance: re-apply filters from allBooks order
            applyAllFilters();
            return;
    }
    renderResults();
}

// Apply price filter - calls master filter
function applyPriceFilter() {
    applyAllFilters();
}

// Clear filters
function clearFilters() {
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';

    // Reset category: check "All", uncheck others
    const allCheckbox = document.querySelector('input[name="category"][value="all"]');
    if (allCheckbox) allCheckbox.checked = true;
    document.querySelectorAll('input[name="category"]:not([value="all"])').forEach(cb => cb.checked = false);

    // Reset rating
    document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);

    searchResults = [...allBooks];
    renderResults();
}

// Wishlist/cart integration
async function addToWishlist(bookId) {
    if (typeof API !== 'undefined' && API.Wishlist) {
        try {
            await API.Wishlist.add(bookId);
            showNotification('Added to wishlist!', 'success');
        } catch (e) {
            if (e.message.includes('login')) {
                showNotification('Please login first', 'info');
            } else {
                showNotification('Failed to add to wishlist', 'error');
            }
        }
    } else {
        console.warn('API.Wishlist not found');
    }
}

async function addToCart(bookId) {
    if (typeof API !== 'undefined' && API.Cart) {
        try {
            await API.Cart.add(bookId, 1);
            showNotification('Added to cart!', 'success');
        } catch (e) {
            showNotification('Please login to use cart', 'info');
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `simple-notification ${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed; top: 100px; right: 20px;
        background: ${type === 'success' ? '#27ae60' : '#3498db'};
        color: white; padding: 15px 25px; border-radius: 10px; z-index: 9999;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}
