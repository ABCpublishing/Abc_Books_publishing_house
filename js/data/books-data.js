// ===== Books Data - API Only (No Demo Data) =====

// Cache variables
let _cachedBooks = null;
let _cacheTimestamp = 0;
let _fetchPromise = null;

/**
 * Fetches all books from the API with caching
 */
async function fetchAllBooks() {
    const now = Date.now();
    // Cache for 5 minutes
    if (_cachedBooks && (now - _cacheTimestamp) < 300000) {
        return _cachedBooks;
    }
    
    if (_fetchPromise) return _fetchPromise;

    _fetchPromise = (async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

        try {
            console.log('📚 Fetching global book catalog...');
            // Use the centralized API service if available, otherwise fetch directly
            let books = [];
            const apiBase = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
                ? "http://localhost:3001/api"
                : "/api";

            const response = await fetch(`${apiBase}/books?limit=1000`, { signal: controller.signal });
            clearTimeout(timeoutId);
            const data = await response.json();
            books = data.books || [];
            
            _cachedBooks = books;
            _cacheTimestamp = Date.now();
            console.log(`✅ Loaded catalog with ${_cachedBooks.length} books`);
            return _cachedBooks;
        } catch (e) {
            clearTimeout(timeoutId);
            console.error('❌ Failed to fetch all books:', e);
            return _cachedBooks || [];
        } finally {
            _fetchPromise = null;
        }
    })();
    
    return _fetchPromise;
}

/**
 * Fetches books for a specific home page section
 */
async function getBooksForSection(section) {
    try {
        console.log(`🔍 Section Request: ${section}`);
        
        let books = [];
        
        // 1. Try to get books specifically assigned to this section
        if (window.API && window.API.Books) {
            try {
                const response = await window.API.Books.getBySection(section);
                books = response.books || [];
            } catch (err) {
                console.warn(`⚠️ Section fetch failed for '${section}', will use fallback.`);
            }
        }
        
        // 2. FALLBACK/SMART-POPULATE: If section is empty or API failed,
        // use books from the general catalog to ensure the site isn't empty.
        if (books.length === 0) {
            const allBooks = await fetchAllBooks();
            if (allBooks.length > 0) {
                // Return different slices based on section to avoid showing the same books everywhere
                const sectionMap = {
                    'featured': [0, 8],
                    'trending': [0, 15],     // Trending shows all top books if no specific trending set
                    'newReleases': [0, 15],
                    'islamicBooks': [0, 10],
                    'indianAuthors': [0, 12],
                    'children': [0, 12],
                    'fiction': [0, 12],
                    'academic': [0, 5],
                    'exam': [0, 5],
                    'top100': [0, 50]
                };
                
                const range = sectionMap[section] || [0, 10];
                books = allBooks.slice(range[0], range[1]);
                console.log(`💡 ${section} auto-populated with ${books.length} books from catalog.`);
            } else {
                console.warn(`❗ No books found even in fallback for section: ${section}`);
            }
        } else {
            console.log(`✅ ${section} loaded with ${books.length} specific books.`);
        }
        
        return books;
    } catch (error) {
        console.error(`❌ getBooksForSection critical error (${section}):`, error);
        return [];
    }
}

/**
 * Creates a book card HTML component
 */
function createBookCard(book, index = null) {
    if (!book) return '';

    // Handle initial for placeholder
    const titleInitial = (book.title || "B").charAt(0).toUpperCase();
    
    // Safety check for image URL
    let bookImage = book.image;
    
    // Placeholder as a data URL with NO SINGLE QUOTES inside to prevent HTML attribute breakage
    const placeholderSVG = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%22%23f5f0eb%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%22100%22 y=%22155%22 text-anchor=%22middle%22 font-family=%22serif%22 font-size=%2248%22 fill=%22%238B0000%22%3E${titleInitial}%3C/text%3E%3C/svg%3E`;
    
    if (!bookImage) {
        bookImage = placeholderSVG;
    } else if (!bookImage.startsWith('http') && !bookImage.startsWith('data:') && !bookImage.startsWith('/')) {
        // Amazon image shortcodes fix
        if (bookImage.match(/^[a-zA-Z0-9_\-.]+\.jpg$/)) {
            bookImage = "https://m.media-amazon.com/images/I/" + bookImage;
        }
    }
    
    // Price formatting
    const price = parseFloat(book.price) || 0;
    const originalPrice = parseFloat(book.original_price) || (price * 1.25);
    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);

    // Escape title for HTML attributes
    const escapedTitle = (book.title || '').replace(/"/g, '&quot;');
    
    // Staggered animation class
    const animationClass = index !== null ? `animate-fade-in stagger-${(index % 8) + 1}` : '';

    return `
        <div class="book-card ${animationClass}" data-book-id="${book.id}" onclick="viewBookDetail('${book.id}')">
            <div class="book-cover">
                ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
                <img src="${bookImage}" alt="${escapedTitle}" 
                     onerror="this.onerror=null; this.src='${placeholderSVG}';">
            </div>
            <div class="book-info">
                <div class="book-title" title="${escapedTitle}">${book.title}</div>
                <div class="book-author">${book.author || 'ABC Publishing'}</div>
                <div class="book-rating">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                    <span class="rating-text">${book.rating || '4.5'}</span>
                </div>
                <div class="book-price">
                    <span class="price-current">₹${price.toLocaleString()}</span>
                    <span class="price-original">₹${Math.round(originalPrice).toLocaleString()}</span>
                </div>
            </div>
            <div class="book-actions">
                <button class="btn-wishlist" onclick="event.stopPropagation(); addToWishlist('${book.id}')">
                    <i class="far fa-heart"></i>
                </button>
                <button class="btn-cart" onclick="event.stopPropagation(); addToCart('${book.id}')">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Global function to view book details
 */
function viewBookDetail(id) {
    if (!id) return;
    window.location.href = `/pages/book-detail.html?id=${id}`;
}
