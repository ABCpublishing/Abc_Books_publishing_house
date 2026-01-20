// ===== Demo Books Data with Categories =====

// Dynamic API URL (same as api.js)
const BOOKS_DATA_API_BASE = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? '/api'
    : 'http://localhost:3001/api';

// Islamic Books (Arabic/English translations)
const DEMO_ISLAMIC_BOOKS = [
    // Quran & Tafsir
    {
        id: 'book_quran_1',
        title: 'The Holy Quran (Arabic-English)',
        author: 'Divine Revelation',
        category: 'Islamic',
        subcategory: 'Quran',
        language: 'Arabic-English',
        image: 'https://m.media-amazon.com/images/I/71xKk7+9jPL._AC_UF1000,1000_QL80_.jpg',
        price: 299,
        originalPrice: 499,
        rating: 5.0,
        description: 'The complete Holy Quran with Arabic text and English translation. Beautifully formatted for easy reading.'
    },
    {
        id: 'book_tafsir_1',
        title: 'Tafsir Ibn Kathir (Complete)',
        author: 'Ibn Kathir',
        category: 'Islamic',
        subcategory: 'Tafsir',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71N8rVXxMIL._AC_UF1000,1000_QL80_.jpg',
        price: 1299,
        originalPrice: 1799,
        rating: 4.9,
        description: 'The most popular Tafsir in the world. Comprehensive commentary on the Holy Quran.'
    },
    // Hadith Collections
    {
        id: 'book_hadith_1',
        title: 'Sahih Bukhari (Complete)',
        author: 'Imam Bukhari',
        category: 'Islamic',
        subcategory: 'Hadith',
        language: 'Arabic-English',
        image: 'https://m.media-amazon.com/images/I/71VvXzKfRiL._AC_UF1000,1000_QL80_.jpg',
        price: 899,
        originalPrice: 1299,
        rating: 5.0,
        description: 'The most authentic collection of Hadith. Essential for every Muslim household.'
    },
    {
        id: 'book_hadith_2',
        title: 'Riyadh-us-Saliheen',
        author: 'Imam Nawawi',
        category: 'Islamic',
        subcategory: 'Hadith',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71TqI5cGqfL._AC_UF1000,1000_QL80_.jpg',
        price: 399,
        originalPrice: 599,
        rating: 4.9,
        description: 'Gardens of the Righteous - A collection of authentic hadiths covering all aspects of life.'
    },
    // Seerah
    {
        id: 'book_seerah_1',
        title: 'The Sealed Nectar (Ar-Raheeq Al-Makhtum)',
        author: 'Safiur Rahman Mubarakpuri',
        category: 'Islamic',
        subcategory: 'Seerah',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/81V6hF8TPIL._AC_UF1000,1000_QL80_.jpg',
        price: 449,
        originalPrice: 699,
        rating: 4.8,
        description: 'Award-winning biography of Prophet Muhammad (PBUH). A must-read for understanding Islamic history.'
    },
    {
        id: 'book_seerah_2',
        title: 'In the Footsteps of the Prophet',
        author: 'Tariq Ramadan',
        category: 'Islamic',
        subcategory: 'Seerah',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71U0H4DTDEL._AC_UF1000,1000_QL80_.jpg',
        price: 599,
        originalPrice: 899,
        rating: 4.7,
        description: 'A contemporary look at the life and teachings of Prophet Muhammad (PBUH).'
    },
    // Dua & Supplications
    {
        id: 'book_dua_1',
        title: 'Fortress of the Muslim (Hisnul Muslim)',
        author: 'Said bin Ali bin Wahf Al-Qahtani',
        category: 'Islamic',
        subcategory: 'Dua',
        language: 'Arabic-English',
        image: 'https://m.media-amazon.com/images/I/71rPqBOLHkL._AC_UF1000,1000_QL80_.jpg',
        price: 199,
        originalPrice: 299,
        rating: 4.9,
        description: 'Essential daily duas and supplications from Quran and Sunnah. Pocket size available.'
    },
    // English Islamic Books
    {
        id: 'book_english_1',
        title: 'Purification of the Heart',
        author: 'Hamza Yusuf',
        category: 'English',
        subcategory: 'Self-Help',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71wXQn+EIVL._AC_UF1000,1000_QL80_.jpg',
        price: 549,
        originalPrice: 799,
        rating: 4.9,
        description: 'A spiritual guide to purifying the heart from diseases and attaining inner peace.'
    },
    {
        id: 'book_english_2',
        title: 'The Book of Assistance',
        author: 'Imam Al-Haddad',
        category: 'English',
        subcategory: 'Spirituality',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71PYa0qXxjL._AC_UF1000,1000_QL80_.jpg',
        price: 399,
        originalPrice: 599,
        rating: 4.8,
        description: 'A guide to Islamic spirituality and self-improvement. Classic work translated into English.'
    },
    {
        id: 'book_english_3',
        title: 'The Lives of the Prophets',
        author: 'Ibn Kathir',
        category: 'English',
        subcategory: 'History',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71eQ7rxI9ML._AC_UF1000,1000_QL80_.jpg',
        price: 699,
        originalPrice: 999,
        rating: 4.8,
        description: 'Complete stories of all prophets mentioned in the Quran. Beautifully presented.'
    },
    {
        id: 'book_english_4',
        title: 'The Four Imams',
        author: 'Muhammad Abu Zahra',
        category: 'English',
        subcategory: 'Biography',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71y+5KvLLkL._AC_UF1000,1000_QL80_.jpg',
        price: 799,
        originalPrice: 1199,
        rating: 4.8,
        description: 'Comprehensive biography of the four great Imams of Islamic jurisprudence.'
    },
    {
        id: 'book_english_5',
        title: 'Islamic Manners',
        author: 'Shaykh Abdul Fattah Abu Ghuddah',
        category: 'English',
        subcategory: 'Self-Help',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71Hqvx8lQRL._AC_UF1000,1000_QL80_.jpg',
        price: 349,
        originalPrice: 499,
        rating: 4.7,
        description: 'A practical guide to Islamic etiquette and good manners in daily life.'
    },
    // Arabic Books
    {
        id: 'book_arabic_1',
        title: 'المصحف الشريف (Arabic Quran)',
        author: 'Holy Text',
        category: 'Arabic',
        subcategory: 'Quran',
        language: 'Arabic',
        image: 'https://m.media-amazon.com/images/I/71xKk7+9jPL._AC_UF1000,1000_QL80_.jpg',
        price: 249,
        originalPrice: 399,
        rating: 5.0,
        description: 'Beautiful Arabic Quran with clear script and proper tajweed markings.'
    },
    {
        id: 'book_arabic_2',
        title: 'تيسير مصطلح الحديث',
        author: 'Dr. Mahmoud Al-Tahan',
        category: 'Arabic',
        subcategory: 'Hadith Sciences',
        language: 'Arabic',
        image: 'https://m.media-amazon.com/images/I/71VvXzKfRiL._AC_UF1000,1000_QL80_.jpg',
        price: 299,
        originalPrice: 450,
        rating: 4.8,
        description: 'Introduction to the science of Hadith. Essential for students of knowledge.'
    },
    {
        id: 'book_arabic_3',
        title: 'الأربعين النووية',
        author: 'Imam Nawawi',
        category: 'Arabic',
        subcategory: 'Hadith',
        language: 'Arabic',
        image: 'https://m.media-amazon.com/images/I/71TqI5cGqfL._AC_UF1000,1000_QL80_.jpg',
        price: 149,
        originalPrice: 249,
        rating: 4.9,
        description: 'The famous 40 Hadith collection by Imam Nawawi in original Arabic.'
    }
];

// ===== Load Books from Admin Panel =====
function getCustomBooksData() {
    try {
        const data = localStorage.getItem('abc_books_data');
        if (data) {
            const parsed = JSON.parse(data);
            console.log('📚 Loaded custom books data from admin:', parsed);
            return parsed;
        }
        return null;
    } catch (error) {
        console.error('Error loading custom books data:', error);
        return null;
    }
}

// Initialize demo data if no data exists
function initializeDemoData() {
    const existingData = getCustomBooksData();

    if (!existingData || !existingData.books || existingData.books.length === 0) {
        console.log('🎬 No data found, initializing with demo Islamic books...');
        const demoData = {
            books: DEMO_ISLAMIC_BOOKS,
            sections: {
                hero: DEMO_ISLAMIC_BOOKS.map(book => book.id),
                editors: [],
                featured: [],
                trending: []
            }
        };
        localStorage.setItem('abc_books_data', JSON.stringify(demoData));
        console.log('✅ Demo data initialized with', DEMO_ISLAMIC_BOOKS.length, 'books');
        return demoData;
    }

    return existingData;
}

// Get books for a specific section
function getBooksForSection(section) {
    const data = initializeDemoData();

    // Map section names
    const sectionMap = {
        'hero': 'hero',
        'islamicBooks': 'hero',
        'featured': 'featured',
        'trending': 'trending',
        'editors': 'editors',
        'editorsBanner': 'editors'
    };

    const mappedSection = sectionMap[section] || section;

    // Get book IDs for this section
    const bookIds = data.sections && data.sections[mappedSection]
        ? data.sections[mappedSection]
        : [];

    // If no books in section but it's hero, use all books
    if (bookIds.length === 0 && (section === 'hero' || section === 'islamicBooks')) {
        console.log(`⚠️ No books in ${mappedSection} section, using all books`);
        return Promise.resolve(data.books || DEMO_ISLAMIC_BOOKS);
    }

    // Get actual book objects
    const books = bookIds
        .map(id => data.books.find(b => b.id === id))
        .filter(Boolean);

    console.log(`📘 Loaded ${books.length} books for ${section}`);
    return Promise.resolve(books);
}

// Get books by category
function getBooksByCategory(category) {
    const data = initializeDemoData();
    return data.books.filter(book =>
        book.category && book.category.toLowerCase() === category.toLowerCase()
    );
}

// Get books by language
function getBooksByLanguage(language) {
    const data = initializeDemoData();
    return data.books.filter(book =>
        book.language && book.language.toLowerCase().includes(language.toLowerCase())
    );
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
        <div class="book-card">
            <div class="book-cover" onclick="viewBookDetail('${book.id}')" style="cursor: pointer;">
                <img src="${book.image}" alt="${book.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22300%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2214%22 fill=%22%23999%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                ${discount > 0 ? `<div class="discount-badge">-${discount}%</div>` : ''}
                
                <!-- Quick Actions Removed as per request -->

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
        // Fetch the real book ID from database using ISBN
        const response = await fetch(`\\/books`);
        if (!response.ok) {
            throw new Error('Failed to fetch books from database');
        }

        const books = await response.json();
        const dbBook = books.find(b => b.isbn === bookId);

        if (!dbBook) {
            showNotification('Book not found in database', 'error');
            return;
        }

        // Call the API-integrated addToWishlist function with database book ID
        if (typeof addToWishlist === 'function') {
            await addToWishlist(dbBook.id, book);

            // Update button visual state
            const icon = btn.querySelector('i');
            icon.classList.remove('far');
            icon.classList.add('fas');
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
        // Fetch the real book ID from database using ISBN (which is the demo book ID)
        const response = await fetch(`\\/books`);
        if (!response.ok) {
            throw new Error('Failed to fetch books from database');
        }

        const books = await response.json();
        const dbBook = books.find(b => b.isbn === bookId);

        if (!dbBook) {
            showNotification('Book not found in database', 'error');
            console.error('Book not found:', bookId);
            return;
        }

        // Call the API-integrated addToCart function with the database book ID
        if (typeof addToCart === 'function') {
            await addToCart(dbBook.id, book);
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
        // Fetch the real book ID from database using ISBN
        const response = await fetch(`\\/books`);
        if (!response.ok) {
            throw new Error('Failed to fetch books from database');
        }

        const books = await response.json();
        const dbBook = books.find(b => b.isbn === bookId);

        if (!dbBook) {
            showNotification('Book not found in database', 'error');
            console.error('Book not found:', bookId);
            return;
        }

        // Add to cart via API with database book ID
        if (typeof addToCart === 'function') {
            await addToCart(dbBook.id, book);

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
