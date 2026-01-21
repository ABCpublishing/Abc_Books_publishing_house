// ===== Demo Books Data with Categories =====

// Dynamic API URL (same as api.js)
const BOOKS_DATA_API_BASE = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? '/api'
    : 'http://localhost:3001/api';

// Islamic Books (Arabic/English translations)
// Top 100 / Trending Books (Using Amazon Image Links)
const DEMO_ISLAMIC_BOOKS = [
    // === Trending & Best Sellers ===
    {
        id: 'top_1',
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        category: 'Fiction',
        subcategory: 'Inspirational',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71+2-t7M35L._AC_UY218_.jpg',
        price: 399,
        originalPrice: 599,
        rating: 4.8,
        description: 'A global phenomenon, The Alchemist has been read and loved by millions, becoming a modern classic.'
    },
    {
        id: 'top_2',
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'Self-Help',
        subcategory: 'Productivity',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/71F4+7rk2eL._AC_UY218_.jpg',
        price: 499,
        originalPrice: 799,
        rating: 4.9,
        description: 'An easy & proven way to build good habits & break bad ones.'
    },
    {
        id: 'top_3',
        title: "Don't Be Sad",
        author: 'Aaidh ibn Abdullah al-Qarni',
        category: 'Islamic',
        subcategory: 'Self-Help',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/6176yTa0KQL._AC_UY218_.jpg',
        price: 549,
        originalPrice: 850,
        rating: 4.9,
        description: 'An uplifting and thought-provoking book rooted in Islamic teachings to help navigate life challenges.'
    },
    {
        id: 'top_4',
        title: 'The 48 Laws of Power',
        author: 'Robert Greene',
        category: 'Psychology',
        subcategory: 'Strategy',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/611X8GI7hpL._AC_UY218_.jpg',
        price: 449,
        originalPrice: 699,
        rating: 4.7,
        description: 'Amoral, cunning, ruthless, and instructive, this multi-million-copy bestseller is the definitive manual.'
    },
    {
        id: 'top_5',
        title: 'Rich Dad Poor Dad',
        author: 'Robert Kiyosaki',
        category: 'Business',
        subcategory: 'Finance',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/81BE7eeKzAL._AC_UY218_.jpg',
        price: 349,
        originalPrice: 550,
        rating: 4.8,
        description: 'What the rich teach their kids about money that the poor and middle class do not!'
    },
    {
        id: 'top_6',
        title: 'Deep Work',
        author: 'Cal Newport',
        category: 'Self-Help',
        subcategory: 'Productivity',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/81ngZpLkktL._AC_UY218_.jpg',
        price: 399,
        originalPrice: 599,
        rating: 4.7,
        description: 'Rules for Focused Success in a Distracted World.'
    },
    {
        id: 'top_7',
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        category: 'Psychology',
        subcategory: 'Decision Making',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/61fdrEuPJwL._AC_UY218_.jpg',
        price: 599,
        originalPrice: 899,
        rating: 4.7,
        description: 'A major work in modern psychology and behavioral economics.'
    },
    {
        id: 'top_8',
        title: 'The Psychology of Money',
        author: 'Morgan Housel',
        category: 'Business',
        subcategory: 'Finance',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/81gC3mdNi5L._AC_UY218_.jpg',
        price: 299,
        originalPrice: 499,
        rating: 4.8,
        description: 'Doing well with money isn’t necessarily about what you know. It’s about how you behave.'
    },
    {
        id: 'top_9',
        title: 'The Power of Now',
        author: 'Eckhart Tolle',
        category: 'Self-Help',
        subcategory: 'Spirituality',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/61Ij8nLooNL._AC_UY218_.jpg',
        price: 349,
        originalPrice: 550,
        rating: 4.7,
        description: 'A Guide to Spiritual Enlightenment.'
    },
    {
        id: 'top_10',
        title: "Man's Search for Meaning",
        author: 'Viktor Frankl',
        category: 'Psychology',
        subcategory: 'Memoir',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/81uK7UU+0OL._AC_UY218_.jpg',
        price: 249,
        originalPrice: 399,
        rating: 4.9,
        description: 'Psychiatrist Viktor Frankl’s memoir has riveted generations of readers with its descriptions of life in Nazi death camps.'
    },
    {
        id: 'top_11',
        title: 'The Midnight Library',
        author: 'Matt Haig',
        category: 'Fiction',
        subcategory: 'Contemporary',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/812whWLbqAL._AC_UY218_.jpg',
        price: 399,
        originalPrice: 650,
        rating: 4.6,
        description: 'Between life and death there is a library, and within that library, the shelves go on forever.'
    },
    {
        id: 'top_12',
        title: 'The Silent Patient',
        author: 'Alex Michaelides',
        category: 'Fiction',
        subcategory: 'Thriller',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/91BbLCJOruL._AC_UY218_.jpg',
        price: 349,
        originalPrice: 599,
        rating: 4.7,
        description: 'The Silent Patient is a shocking psychological thriller of a woman’s act of violence against her husband.'
    },
    {
        id: 'top_13',
        title: 'It Ends with Us',
        author: 'Colleen Hoover',
        category: 'Fiction',
        subcategory: 'Romance',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/91w8b7ug0nL._AC_UY218_.jpg',
        price: 399,
        originalPrice: 699,
        rating: 4.8,
        description: 'A brave and heartbreaking novel that digs its claws into you and doesn’t let go.'
    },
    {
        id: 'top_14',
        title: 'Principles',
        author: 'Ray Dalio',
        category: 'Business',
        subcategory: 'Management',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/61LKD6scbfL._AC_UY218_.jpg',
        price: 699,
        originalPrice: 999,
        rating: 4.7,
        description: 'Ray Dalio, one of the world’s most successful investors and entrepreneurs, shares the unconventional principles that he’s developed.'
    },
    {
        id: 'top_15',
        title: 'Tools of Titans',
        author: 'Tim Ferriss',
        category: 'Self-Help',
        subcategory: 'Advice',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/710FF4JrjsL._AC_UL320_.jpg',
        price: 599,
        originalPrice: 899,
        rating: 4.7,
        description: 'The Tactics, Routines, and Habits of Billionaires, Icons, and World-Class Performers.'
    },
    // === Core Islamic Collection ===
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
        description: 'The complete Holy Quran with Arabic text and English translation.'
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
        description: 'Comprehensive commentary on the Holy Quran.'
    },
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
        description: 'The most authentic collection of Hadith.'
    },
    {
        id: 'book_seerah_1',
        title: 'The Sealed Nectar',
        author: 'Safiur Rahman Mubarakpuri',
        category: 'Islamic',
        subcategory: 'Seerah',
        language: 'English',
        image: 'https://m.media-amazon.com/images/I/81V6hF8TPIL._AC_UF1000,1000_QL80_.jpg',
        price: 449,
        originalPrice: 699,
        rating: 4.8,
        description: 'Ar-Raheeq Al-Makhtum - Biography of Prophet Muhammad (PBUH).'
    }
];

// ===== Load Books from Admin Panel =====
function getCustomBooksData() {
    try {
        const data = localStorage.getItem('abc_books_data_v4');
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

// Initialize demo data if no data exists or if we want to force refresh new books
function initializeDemoData() {
    const existingData = getCustomBooksData();
    const currentDemoCount = DEMO_ISLAMIC_BOOKS.length;

    // Force refresh if demo books collection has expanded or changed significantly
    const needsRefresh = !existingData ||
        !existingData.books ||
        existingData.books.length < currentDemoCount ||
        existingData.books.some(b => b.id.startsWith('top_') && !b.image.includes('amazon'));

    // === 50 Islamic Titles ===
    const islamicTitles = [
        "Gardens of the Righteous", "Fortress of the Muslim", "Stories of the Prophets", "The Sealed Nectar", "Don't Be Sad",
        "Reclaim Your Heart", "Secrets of Divine Love", "Purification of the Heart", "Revival of Religious Sciences", "The Disease and The Cure",
        "Timeless Seeds of Advice", "Prayers of the Pious", "The Ideal Muslim", "The Ideal Muslimah", "Enjoy Your Life",
        "The Book of Knowledge", "In the Footsteps of the Prophet", "Women Around the Messenger", "The Beginning and the End", "Tafsir As-Sa'di",
        "Characteristics of Prophet Muhammad", "40 Hadith Nawawi", "Riyad as-Salihin", "Bulugh al-Maram", "Fath al-Bari",
        "Kitab at-Tawhid", "The Deviant Sects", "Biographies of the Companions", "History of Islam", "Lost Islamic History",
        "The Road to Mecca", "Islam and the World", "Milestones", "Fiqh us-Sunnah", "The Spirt of Islam",
        "Towards Understanding the Quran", "Let Us Be Muslims", "The Quran and Modern Science", "Islam the Natural Way", "The Productive Muslim",
        "Islamic Manners", "Patience and Gratitude", "The Soul's Journey", "Life in the Grave", "Signs of the Last Day",
        "Descriptions of Paradise", "The Fire of Hell", "Sins and Repentance", "Daily Duas", "The Rights of Parents"
    ];

    // === 50 Arabic Titles ===
    const arabicTitles = [
        "Al-Muqaddimah", "Kalila wa Dimna", "Alf Layla wa Layla", "Diwan Al-Mutanabbi", "Nahj al-Balagha",
        "Kitab al-Aghani", "Hayat al-Hayawan", "Al-Bukhala", "Risalat al-Ghufran", "Tawq al-Hamamah",
        "Al-Iqd al-Farid", "Wafayat al-Ayan", "Siyar A'lam al-Nubala", "Al-Bidaya wan-Nihaya", "Tarikh al-Tabari",
        "Lisan al-Arab", "Al-Qamus al-Muhit", "Asrar al-Balagha", "Dala'il al-I'jaz", "Maqamat al-Hariri",
        "Hayy ibn Yaqdhan", "Al-Muwafaqat", "Al-Itisam", "Talbis Iblis", "Sayd al-Khatir",
        "Rawdat al-Muhibbin", "Madarij al-Salikin", "Zad al-Ma'ad", "Ilam al-Muwaqqi'in", "Al-Fawa'id",
        "Al-Umm", "Al-Risala", "Al-Burhan", "Al-Mustasfa", "Ihya Ulum ad-Din",
        "Mishkat al-Masabih", "Al-Adab al-Mufrad", "Shamail Muhammadiyah", "Al-Shifa", "Nur al-Yaqin",
        "Rahiq al-Makhtum (Arabic)", "Fi Zilal al-Quran", "Tafsir al-Jalalayn", "Tafsir al-Qurtubi", "Tafsir al-Baghawi",
        "Fath al-Qadir", "Umdat al-Ahkam", "Subul al-Salam", "Nail al-Awtar", "Al-Muhalla"
    ];

    if (needsRefresh) {
        console.log('🎬 Initializing/Refreshing with new Amazon book data...');

        // Generate Book Objects
        const generatedIslamicBooks = islamicTitles.map((title, index) => ({
            id: `isl_gen_${index + 1}`,
            title: title,
            author: 'Prominent Islamic Scholar',
            category: 'Islamic',
            subcategory: 'General',
            language: 'English',
            image: `https://m.media-amazon.com/images/I/${['71+2-t7M35L', '71F4+7rk2eL', '6176yTa0KQL'][index % 3]}._AC_UY218_.jpg`, // Rotating placeholders
            price: 299 + (index * 10),
            originalPrice: 499 + (index * 10),
            rating: 4.8,
            description: `A classic masterpiece of Islamic literature: ${title}. Essential reading for every home.`
        }));

        const generatedArabicBooks = arabicTitles.map((title, index) => ({
            id: `arb_gen_${index + 1}`,
            title: title,
            author: 'Classical Arabic Author',
            category: 'Arabic',
            subcategory: 'Literature',
            language: 'Arabic',
            image: `https://m.media-amazon.com/images/I/${['611X8GI7hpL', '81BE7eeKzAL', '81ngZpLkktL'][index % 3]}._AC_UY218_.jpg`, // Rotating placeholders
            price: 399 + (index * 15),
            originalPrice: 699 + (index * 15),
            rating: 4.9,
            description: `A timeless work of Arabic heritage: ${title}. Rich in language and wisdom.`
        }));

        // Combine all books
        const finalBookList = [...DEMO_ISLAMIC_BOOKS, ...generatedIslamicBooks, ...generatedArabicBooks];
        const allBookIds = finalBookList.map(b => b.id);

        const demoData = {
            books: finalBookList,
            sections: {
                hero: allBookIds,
                editors: allBookIds.slice(5, 11),
                featured: allBookIds.slice(2, 8),
                trending: allBookIds.slice(0, 15),
                islamic_top50: generatedIslamicBooks.map(b => b.id),
                arabic_top50: generatedArabicBooks.map(b => b.id),
                top100_all: [...generatedIslamicBooks.map(b => b.id), ...generatedArabicBooks.map(b => b.id)]
            }
        };
        localStorage.setItem('abc_books_data_v4', JSON.stringify(demoData));
        console.log('✅ Data initialized with', finalBookList.length, 'books');
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
                <img src="${book.image}" alt="${book.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22%3E%3Crect fill=%22%23e8e8e8%22 width=%22200%22 height=%22300%22/%3E%3Cpath d=%22M80 110h40v80H80z%22 fill=%22%23ccc%22/%3E%3Cpath d=%22M85 115h30v70H85z%22 fill=%22%23fff%22/%3E%3Cpath d=%22M90 125h20v2H90zm0 8h20v2H90zm0 8h15v2H90z%22 fill=%22%23ddd%22/%3E%3C/svg%3E'">
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
