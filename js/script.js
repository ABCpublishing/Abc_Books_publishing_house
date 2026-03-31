
// ===== Hero Books Section (Dynamic) =====
async function renderHeroBooks() {
    console.log('ℹ️ Hero section dynamic replacement is disabled to keep static design.');
}

// ===== Islamic Books Section =====
async function renderIslamicBooks() {
    const islamicBooks = await getBooksForSection('islamicBooks');
    const islamicContainer = document.getElementById('islamicBooksGrid');

    if (islamicContainer && islamicBooks.length > 0) {
        const booksToShow = islamicBooks.slice(0, 8);
        islamicContainer.innerHTML = booksToShow.map((book, index) => createBookCard(book, index)).join('');
    }
}
async function renderFeaturedBooks() {
    const featuredBooks = await getBooksForSection('featured');
    const featuredContainer = document.getElementById('featuredBooks');

    if (featuredContainer && featuredBooks.length > 0) {
        featuredContainer.innerHTML = featuredBooks.map((book, index) => createBookCard(book, index)).join('');
        initializeFeaturedSlider();
    }
}

// Render trending books
async function renderTrendingBooks() {
    const trendingBooks = await getBooksForSection('trending');
    const trendingContainer = document.getElementById('trendingBooks');

    if (trendingContainer && trendingBooks.length > 0) {
        trendingContainer.innerHTML = trendingBooks.map(book => createBookCard(book)).join('');
        initializeTrendingSlider();
    }
}

// Render new releases (uses all books if no specific data)
async function renderNewReleases() {
    const newReleases = await getBooksForSection('newReleases');
    const releasesContainer = document.getElementById('newReleasesBooks');

    if (releasesContainer && newReleases.length > 0) {
        releasesContainer.innerHTML = newReleases.map(book => createBookCard(book)).join('');
        initializeReleasesSlider();
    }
}

// Render Indian authors section
async function renderIndianAuthors() {
    const indianBooks = await getBooksForSection('indianAuthors');
    const indianContainer = document.getElementById('indianAuthorsBooks');

    if (indianContainer && indianBooks.length > 0) {
        indianContainer.innerHTML = indianBooks.map(book => createBookCard(book)).join('');
    }
}

// Render box sets
async function renderBoxSets() {
    const boxSets = await getBooksForSection('boxSets');
    const boxContainer = document.getElementById('boxSetsBooks');

    if (boxContainer && boxSets.length > 0) {
        boxContainer.innerHTML = boxSets.map(book => createBookCard(book)).join('');
    }
}

// Render children's books
async function renderChildrenBooks() {
    const childrenBooks = await getBooksForSection('children');
    const childrenContainer = document.getElementById('childrenBooks');

    if (childrenContainer && childrenBooks.length > 0) {
        childrenContainer.innerHTML = childrenBooks.map(book => createBookCard(book)).join('');
        initializeChildrenSlider();
    }
}

// Render fiction books
async function renderFictionBooks() {
    const fictionBooks = await getBooksForSection('fiction');
    const fictionContainer = document.getElementById('fictionBooks');

    if (fictionContainer && fictionBooks.length > 0) {
        fictionContainer.innerHTML = fictionBooks.map(book => createBookCard(book)).join('');
    }
}

// Render sidebar books
// Render sidebar books
async function renderSidebarBooks() {
    // Helper to fix image URLs (consistent with books-data.js)

    const fixImageUrl = (img) => {
        if (!img) return `data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22150%22%3E%3Crect fill=%22%23fef3f2%22 width=%22100%22 height=%22150%22/%3E%3Ctext x=%2250%22 y=%2285%22 font-family=%22serif%22 font-size=%2224%22 fill=%22%23e44d32%22 text-anchor=%22middle%22%3EB%3C/text%3E%3C/svg%3E`;
        
        if (img.startsWith('http') || img.startsWith('data:') || img.startsWith('/')) {
            // Clean up overly long Amazon modifiers if they cause 404s
            if (img.includes('.media-amazon.com/images/I/')) {
                const baseImg = img.split('._')[0];
                if (!baseImg.endsWith('.jpg') && !baseImg.endsWith('.png')) {
                    // Try to restore extension if it was part of the base
                    return baseImg + '.jpg';
                }
                return baseImg;
            }
            return img;
        }

        // Amazon shortcodes - handle them more robustly
        let cleanId = img.trim();
        if (cleanId.includes('._')) {
            cleanId = cleanId.split('._')[0];
        }
        if (!cleanId.endsWith('.jpg') && !cleanId.endsWith('.png')) {
            cleanId = cleanId + '.jpg';
        }
        
        return "https://m.media-amazon.com/images/I/" + cleanId;
    };

    // 1. Author Spotlight - Use Featured books
    const featuredBooks = await getBooksForSection('featured');
    const authorContainer = document.getElementById('authorBooks');
    if (authorContainer && featuredBooks.length > 0) {
        authorContainer.innerHTML = featuredBooks.slice(0, 3).map(book => `
            <div class="author-book-item" onclick="viewBookDetail('${book.id}')" style="cursor: pointer;">
                <img src="${fixImageUrl(book.image)}" alt="${book.title}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2275%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2250%22 height=%2275%22/%3E%3Ctext x=%2225%22 y=%2240%22 font-family=%22serif%22 font-size=%2220%22 fill=%22%238B0000%22 text-anchor=%22middle%22%3EB%3C/text%3E%3C/svg%3E';">
                <div class="book-details">
                    <h4>${book.title}</h4>
                    <span class="price">₹${book.price}</span>
                </div>
            </div>
        `).join('');
    }

    // 2. Academic books - Use Academic specific section
    const academicBooks = await getBooksForSection('academic');
    const academicContainer = document.getElementById('academicBooks');
    if (academicContainer && academicBooks.length > 0) {
        academicContainer.innerHTML = academicBooks.slice(0, 3).map(book => `
            <div class="promo-book-item" onclick="viewBookDetail('${book.id}')" style="cursor: pointer;">
                <img src="${fixImageUrl(book.image)}" alt="${book.title}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2275%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2250%22 height=%2275%22/%3E%3Ctext x=%2225%22 y=%2240%22 font-family=%22serif%22 font-size=%2220%22 fill=%22%238B0000%22 text-anchor=%22middle%22%3EB%3C/text%3E%3C/svg%3E';">
            </div>
        `).join('');
    }

    // 3. Exam books (Master CTET & CSAT) - Use Exam specific section
    const examBooks = await getBooksForSection('exam');
    const examContainer = document.getElementById('examBooks');
    if (examContainer && examBooks.length > 0) {
        examContainer.innerHTML = examBooks.slice(0, 3).map(book => `
            <div class="promo-book-item" onclick="viewBookDetail('${book.id}')" style="cursor: pointer;">
                <img src="${fixImageUrl(book.image)}" alt="${book.title}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2275%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2250%22 height=%2275%22/%3E%3Ctext x=%2225%22 y=%2240%22 font-family=%22serif%22 font-size=%2220%22 fill=%22%238B0000%22 text-anchor=%22middle%22%3EB%3C/text%3E%3C/svg%3E';">
            </div>
        `).join('');
    }

    // 4. Book crushes (use more featured books)
    const crushContainer = document.getElementById('crushBooks');
    if (crushContainer && featuredBooks.length > 3) {
        crushContainer.innerHTML = featuredBooks.slice(3, 6).map(book => `
            <div class="promo-book-item" onclick="viewBookDetail('${book.id}')" style="cursor: pointer;">
                <img src="${fixImageUrl(book.image)}" alt="${book.title}" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2250%22 height=%2275%22%3E%3Crect fill=%22%23f0f0f0%22 width=%2250%22 height=%2275%22/%3E%3Ctext x=%2225%22 y=%2240%22 font-family=%22serif%22 font-size=%2220%22 fill=%22%238B0000%22 text-anchor=%22middle%22%3EB%3C/text%3E%3C/svg%3E';">
            </div>
        `).join('');
    }
}

// Render Top 100 Modal
async function renderTop100Books() {
    const top100Books = await getBooksForSection('top100');
    const top100Container = document.getElementById('top100Books');

    if (top100Container && top100Books.length > 0) {
        top100Container.innerHTML = top100Books.map((book, index) => {
            const bookJSON = JSON.stringify(book).replace(/'/g, "\\'").replace(/"/g, '&quot;');
            return `
            <div class="top100-book-item">
                <span class="book-rank">#${index + 1}</span>
                <img src="${book.image}" alt="${book.title}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
                <div class="book-info">
                    <h4>${book.title}</h4>
                    <p>${book.author}</p>
                    <div class="price-row">
                        <span class="price">₹${book.price}</span>
                        ${book.originalPrice ? `<span class="original-price">₹${book.originalPrice}</span>` : ''}
                    </div>
                </div>
                <button class="btn-add-cart" onclick="addToCartCard('${book.id}', '${bookJSON}')"><i class="fas fa-shopping-cart"></i></button>
            </div>
        `}).join('');
    }
}

// ===== Slider Functions =====

function initializeHeroSlider() {
    const track = document.getElementById('heroBooks');
    const prevBtn = document.querySelector('.hero-books-slider .prev');
    const nextBtn = document.querySelector('.hero-books-slider .next');
    const dotsContainer = document.getElementById('heroDots');
    const sliderContainer = document.querySelector('.hero-books-slider');

    if (!track || !prevBtn || !nextBtn) {
        console.error('Carousel elements not found');
        return;
    }

    let originalCards = Array.from(track.querySelectorAll('.book-card'));
    if (originalCards.length === 0) {
        console.warn('No books found for carousel');
        return;
    }

    console.log(`🎠 Initializing carousel with ${originalCards.length} books`);

    const cardWidth = originalCards[0].offsetWidth + 15;
    const visibleCards = Math.floor(track.parentElement.offsetWidth / cardWidth);

    // Only use infinite scroll if we have enough books (at least 8)
    const useInfiniteScroll = originalCards.length >= 8;
    let currentIndex = 0;
    let isTransitioning = false;
    let autoScrollInterval;
    let allCards = originalCards;

    if (useInfiniteScroll) {
        console.log('✅ Using infinite scroll mode');
        // Clone slides for infinite effect
        const clonesToAdd = Math.min(3, Math.floor(originalCards.length / 2));
        const firstClones = originalCards.slice(0, clonesToAdd).map(card => card.cloneNode(true));
        const lastClones = originalCards.slice(-clonesToAdd).map(card => card.cloneNode(true));

        lastClones.forEach(clone => track.insertBefore(clone, track.firstChild));
        firstClones.forEach(clone => track.appendChild(clone));

        allCards = Array.from(track.querySelectorAll('.book-card'));
        currentIndex = clonesToAdd;

        // Set initial position
        track.style.transition = 'none';
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        track.offsetHeight;
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

        // Handle infinite loop
        track.addEventListener('transitionend', function handleTransitionEnd() {
            isTransitioning = false;

            if (currentIndex <= clonesToAdd - 1) {
                currentIndex = originalCards.length + clonesToAdd - 1;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                track.offsetHeight;
                track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            } else if (currentIndex >= clonesToAdd + originalCards.length) {
                currentIndex = clonesToAdd;
                track.style.transition = 'none';
                track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
                track.offsetHeight;
                track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            }
        });
    } else {
        console.log('⚠️ Using simple scroll mode (not enough books for infinite)');
        track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Create dots
    if (dotsContainer) {
        const dotCount = Math.ceil(originalCards.length / visibleCards);
        dotsContainer.innerHTML = Array(dotCount).fill(0).map((_, i) =>
            `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
        ).join('');

        dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                if (isTransitioning) return;
                if (useInfiniteScroll) {
                    currentIndex = (index * visibleCards) + (originalCards.length >= 8 ? Math.min(3, Math.floor(originalCards.length / 2)) : 0);
                } else {
                    currentIndex = Math.min(index * visibleCards, originalCards.length - visibleCards);
                }
                updateSlider();
                resetAutoScroll();
            });
        });
    }

    function updateSlider() {
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

        // Update dots
        if (dotsContainer) {
            const dots = dotsContainer.querySelectorAll('.dot');
            const realIndex = useInfiniteScroll ? currentIndex - Math.min(3, Math.floor(originalCards.length / 2)) : currentIndex;
            const activeDot = Math.floor(realIndex / visibleCards);
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === activeDot);
            });
        }

        // Update button states (only for non-infinite mode)
        if (!useInfiniteScroll) {
            const maxScroll = Math.max(0, originalCards.length - visibleCards);
            prevBtn.style.opacity = currentIndex === 0 ? '0.5' : '1';
            prevBtn.style.cursor = currentIndex === 0 ? 'not-allowed' : 'pointer';
            nextBtn.style.opacity = currentIndex >= maxScroll ? '0.5' : '1';
            nextBtn.style.cursor = currentIndex >= maxScroll ? 'not-allowed' : 'pointer';
        }
    }

    function nextSlide() {
        if (isTransitioning) return;

        if (useInfiniteScroll) {
            isTransitioning = true;
            currentIndex++;
            updateSlider();
        } else {
            const maxScroll = Math.max(0, originalCards.length - visibleCards);
            if (currentIndex < maxScroll) {
                currentIndex++;
                updateSlider();
            } else {
                currentIndex = 0; // Loop to start
                updateSlider();
            }
        }
    }

    function prevSlide() {
        if (isTransitioning) return;

        if (useInfiniteScroll) {
            isTransitioning = true;
            currentIndex--;
            updateSlider();
        } else {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            } else {
                const maxScroll = Math.max(0, originalCards.length - visibleCards);
                currentIndex = maxScroll; // Loop to end
                updateSlider();
            }
        }
    }

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoScroll();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoScroll();
    });

    // Auto-scroll
    function startAutoScroll() {
        autoScrollInterval = setInterval(nextSlide, 3500);
    }

    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
    }

    function resetAutoScroll() {
        stopAutoScroll();
        startAutoScroll();
    }


    // Pause on interaction
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoScroll);
        sliderContainer.addEventListener('mouseleave', startAutoScroll);
        
        // Mobile touch handling
        sliderContainer.addEventListener('touchstart', stopAutoScroll, { passive: true });
        sliderContainer.addEventListener('touchend', () => {
            // Resume after 2 seconds of no touch
            setTimeout(startAutoScroll, 2000);
        }, { passive: true });
    }

    startAutoScroll();
    updateSlider();

    // Handle resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newCardWidth = allCards[0].offsetWidth + 15;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${currentIndex * newCardWidth}px)`;
            track.offsetHeight;
            track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
        }, 250);
    });

    console.log('✅ Carousel initialized successfully');
}

function initializeTrendingSlider() {
    setupSlider('.trending-books-track', '.trending-prev', '.trending-next');
}

function initializeReleasesSlider() {
    setupSlider('.new-releases-track', '.releases-prev', '.releases-next');
}

function initializeChildrenSlider() {
    setupSlider('.children-books-track', '.children-prev', '.children-next');
}


function setupSlider(trackSelector, prevSelector, nextSelector, options = {}) {
    const track = document.querySelector(trackSelector);
    const prevBtn = document.querySelector(prevSelector);
    const nextBtn = document.querySelector(nextSelector);

    if (!track || !prevBtn || !nextBtn) return;

    const cards = track.querySelectorAll('.book-card');
    if (cards.length === 0) return;

    const { autoScroll = true, interval = 3500 } = options;
    let autoScrollInterval;


    // Force overflow hidden on track so it acts as a fixed viewport
    track.style.overflow = 'hidden';
    track.style.width = '100%';
    track.style.display = 'block';
    track.style.scrollSnapType = 'none';
    track.style.position = 'relative';

    // Create inner wrapper for transform
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '15px';
    wrapper.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    wrapper.style.willChange = 'transform';

    // Move cards into wrapper
    while (track.firstChild) {
        wrapper.appendChild(track.firstChild);
    }
    track.appendChild(wrapper);

    let currentIndex = 0;


    function getMetrics() {
        const cardEl = wrapper.querySelector('.book-card');
        if (!cardEl) return { cardWidth: 235, visibleCards: 3, maxIndex: 0 };
        const cardWidth = cardEl.getBoundingClientRect().width + 15;
        const visibleCards = Math.max(1, Math.floor((track.offsetWidth + 15) / cardWidth));
        const maxIndex = Math.max(0, cards.length - visibleCards);
        return { cardWidth, visibleCards, maxIndex };
    }


    function updateSlider() {
        const { cardWidth, maxIndex } = getMetrics();
        currentIndex = Math.min(currentIndex, maxIndex);
        currentIndex = Math.max(currentIndex, 0);
        
        // Use smoother transform for better mobile experience
        const offset = -currentIndex * cardWidth;
        wrapper.style.transform = `translate3d(${offset}px, 0, 0)`;

        // Update button states - hide on mobile to save space
        if (window.innerWidth <= 768) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            prevBtn.style.opacity = currentIndex === 0 ? '0.2' : '1';
            prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
            nextBtn.style.opacity = currentIndex >= maxIndex ? '0.2' : '1';
            nextBtn.style.pointerEvents = currentIndex >= maxIndex ? 'none' : 'auto';
        }
    }

    function nextSlide() {
        const { maxIndex } = getMetrics();
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0; // Return to start
        }
        updateSlider();
    }

    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            const { maxIndex } = getMetrics();
            currentIndex = maxIndex; // Go to end
        }
        updateSlider();
    }

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoScroll();
    });

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoScroll();
    });

    // Auto-scroll logic
    function startAutoScroll() {
        if (autoScroll) {
            autoScrollInterval = setInterval(nextSlide, interval);
        }
    }

    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
    }

    function resetAutoScroll() {
        stopAutoScroll();
        startAutoScroll();
    }


    // Pause on interaction
    track.addEventListener('mouseenter', stopAutoScroll);
    track.addEventListener('mouseleave', startAutoScroll);
    
    // Mobile touch handling
    track.addEventListener('touchstart', stopAutoScroll, { passive: true });
    track.addEventListener('touchend', () => {
        // Resume after 2 seconds of no touch
        setTimeout(startAutoScroll, 2000);
    }, { passive: true });

    // Handle resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateSlider, 200);
    });

    updateSlider();
    startAutoScroll();
}


// Special initializer for Featured Slider (uses dots)
function initializeFeaturedSlider() {
    const track = document.getElementById('featuredBooks');
    const dotsContainer = document.querySelector('.featured-section .section-nav');
    
    if (!track || !dotsContainer) return;

    const cards = track.querySelectorAll('.book-card');
    if (cards.length === 0) return;


    track.style.display = 'flex';
    track.style.gap = '15px';
    track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    track.style.overflow = 'visible';
    
    const viewport = track.parentElement;
    viewport.style.overflow = 'hidden';
    viewport.style.position = 'relative';

    let currentIndex = 0;
    let autoScrollInterval;

    function getMetrics() {
        const viewportWidth = viewport.offsetWidth;
        const cardWidth = cards[0].getBoundingClientRect().width + 15;
        const visibleCards = Math.max(1, Math.floor((viewportWidth + 15) / cardWidth));
        const totalSlides = Math.ceil(cards.length / visibleCards);
        return { viewportWidth, cardWidth, visibleCards, totalSlides };
    }

    function createDots() {
        const { totalSlides } = getMetrics();
        dotsContainer.innerHTML = Array(totalSlides).fill(0).map((_, i) => 
            `<span class="nav-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
        ).join('');
        
        dotsContainer.querySelectorAll('.nav-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateSlider();
                resetAutoScroll();
            });
        });
    }

    function updateSlider() {
        const { viewportWidth, totalSlides } = getMetrics();
        currentIndex = Math.min(currentIndex, totalSlides - 1);
        
        // Move by viewport width for true "page" scrolling
        const offset = -currentIndex * viewportWidth;
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
        
        // Update dots
        const dots = dotsContainer.querySelectorAll('.nav-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }


    function nextSlide() {
        const { totalSlides } = getMetrics();
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateSlider();
    }

    function startAutoScroll() {
        autoScrollInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }

    function resetAutoScroll() {
        stopAutoScroll();
        startAutoScroll();
    }


    track.parentElement.addEventListener('mouseenter', stopAutoScroll);
    track.parentElement.addEventListener('mouseleave', startAutoScroll);
    
    // Mobile touch handling
    track.parentElement.addEventListener('touchstart', stopAutoScroll, { passive: true });
    track.parentElement.addEventListener('touchend', () => {
        // Resume after 2 seconds of no touch
        setTimeout(startAutoScroll, 2000);
    }, { passive: true });

    // Initial dot generation
    createDots();
    updateSlider();
    startAutoScroll();

    // Re-generate dots on resize as visible cards may change
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            createDots();
            updateSlider();
        }, 250);
    });
}

// ===== Category Strip Scroll =====
function initializeCategoryStrip() {
    const strip = document.getElementById('categoriesStrip');
    const prevBtn = document.querySelector('.strip-prev');
    const nextBtn = document.querySelector('.strip-next');

    if (!strip || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', () => {
        strip.scrollBy({ left: -300, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        strip.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

// ===== Top 100 Modal =====
function initializeTop100Modal() {
    const modal = document.getElementById('top100Modal');
    const trigger = document.getElementById('top100Trigger');
    const closeBtn = document.getElementById('closeTop100');

    if (!modal || !trigger || !closeBtn) return;

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// ===== Search Functionality =====
function initializeSearch() {
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-btn');

    if (!searchInput || !searchBtn) return;

    function handleSearch() {
        const query = searchInput.value.trim();
        if (query.length === 0) return;

        // ALWAYS use absolute path from root for search
        const searchPath = '/pages/search.html';
        window.location.href = `${searchPath}?q=${encodeURIComponent(query)}`;
    }

    searchBtn.addEventListener('click', handleSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

// ===== Wishlist & Cart Functionality =====
function initializeInteractions() {
    // Add to cart buttons
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.add-to-cart-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.add-to-cart-btn');
            const bookCard = btn.closest('.book-card');

            // Get book data from the card
            const bookId = bookCard.dataset.bookId || Math.floor(Math.random() * 1000); // Fallback ID
            const bookData = {
                title: bookCard.querySelector('.book-title')?.textContent || bookCard.querySelector('h3')?.textContent || 'Unknown',
                author: bookCard.querySelector('.book-author')?.textContent || 'Unknown',
                price: parseFloat(bookCard.querySelector('.price-current')?.textContent.replace('₹', '')) || 0,
                image: bookCard.querySelector('img')?.src || ''
            };

            // Call the addToCart function which checks for login
            await addToCart(bookId, bookData);
        }

        // Wishlist buttons
        if (e.target.closest('.wishlist-btn')) {
            e.preventDefault();
            const btn = e.target.closest('.wishlist-btn');
            const bookCard = btn.closest('.book-card');
            const icon = btn.querySelector('i');

            // Get book data from the card
            const bookId = bookCard.dataset.bookId || Math.floor(Math.random() * 1000);
            const bookData = {
                title: bookCard.querySelector('.book-title')?.textContent || bookCard.querySelector('h3')?.textContent || 'Unknown',
                author: bookCard.querySelector('.book-author')?.textContent || 'Unknown',
                price: parseFloat(bookCard.querySelector('.price-current')?.textContent.replace('₹', '')) || 0,
                image: bookCard.querySelector('img')?.src || ''
            };

            // Check if already in wishlist (filled heart)
            if (icon.classList.contains('far')) {
                // Add to wishlist
                await addToWishlist(bookId, bookData);
                icon.classList.remove('far');
                icon.classList.add('fas');
                icon.style.color = '#c0392b';
            } else {
                // Remove from wishlist (would need API call)
                icon.classList.remove('fas');
                icon.classList.add('far');
                icon.style.color = '';
            }
        }
    });
}

// Update badge count (relative change)
function updateCartBadge(change = 0) {
    const badge = document.getElementById('cartCount');
    if (badge) {
        const current = parseInt(badge.textContent) || 0;
        const finalCount = current + (parseInt(change) || 0);
        badge.textContent = Math.max(0, finalCount);
    }
}

function updateWishlistBadge(change = 0) {
    const badge = document.getElementById('wishlistCount');
    if (badge) {
        const current = parseInt(badge.textContent) || 0;
        const finalCount = current + (parseInt(change) || 0);
        badge.textContent = Math.max(0, finalCount);
    }
}

// ===== Proceed to Checkout =====
// Function removed to allow user-auth-api.js version to handle validation.


// ===== Newsletter Form =====
function initializeNewsletter() {
    const form = document.querySelector('.newsletter-form');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('input[type="email"]');
        const email = input.value.trim();

        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert(`Thank you for subscribing with ${email}!`);
            input.value = '';
        } else {
            alert('Please enter a valid email address');
        }
    });
}

// ===== Loading Indicator =====
function showLoading() {
    // 1. Check for persistent cache - if it exists and is fresh, skip the blocking loader
    const PERSISTENT_CACHE_KEY = 'abc_books_data_cache';
    const PERSISTENT_CACHE_TTL = 30 * 60 * 1000;
    const stored = localStorage.getItem(PERSISTENT_CACHE_KEY);

    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Date.now() - parsed.timestamp < PERSISTENT_CACHE_TTL) {
                console.log('⚡ Skipping loader due to fresh cache');
                return; // Don't show the full-screen loader
            }
        } catch (e) { }
    }

    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            flex-direction: column;
            backdrop-filter: blur(5px);
        ">
            <i class="fas fa-book-open" style="font-size: 48px; color: #8B0000; animation: pulse 1.5s infinite;"></i>
            <p style="margin-top: 20px; color: #8B0000; font-size: 18px; font-weight: 600;">Loading Amazing Books...</p>
        </div>
    `;
    document.body.appendChild(loader);

    // 2. SAFETY TIMEOUT: Force hide the loader after 2.5 seconds no matter what
    setTimeout(() => {
        if (document.getElementById('page-loader')) {
            console.warn('🕒 Loader safety timeout reached (2.5s)');
            hideLoading();
        }
    }, 2500);
}

function hideLoading() {
    clearTimeout(window.loaderShowTimeout);
    clearTimeout(window.loaderSafetyTimeout);
    
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.remove();
    }
    document.body.classList.remove('loading-active');
}

// ===== Initialize Everything =====
async function initializeWebsite() {
    showLoading();

    try {
        console.log('🚀 MASTER INITIALIZATION START...');
        
        // 1. Fetch EVERYTHING in ONE single request (Master Level Performance)
        const homeData = await getHomeData();
        console.log('📦 Home data received:', Object.keys(homeData));

        // 2. Helper to render a section using pre-fetched data
        const renderFromData = (section, containerId, renderFn = null) => {
            const books = homeData[section] || [];
            const container = document.getElementById(containerId);
            
            if (container) {
                if (books.length > 0) {
                    container.innerHTML = books.map((book, index) => createBookCard(book, index)).join('');
                    if (renderFn) renderFn(); // Initialize slider if needed
                } else {
                    container.innerHTML = '<p class="no-data">No books in this section yet</p>';
                }
            }
        };

        // 3. Render CRITICAL UI first
        renderFromData('featured', 'featuredBooks', initializeFeaturedSlider);
        renderFromData('islamicBooks', 'islamicBooksGrid');
        
        // 4. Hide loader early for better UX
        hideLoading();
        initializeSearch();
        initializeInteractions();

        // 5. Render remaining sections from existing homeData
        renderFromData('trending', 'trendingBooks', initializeTrendingSlider);
        renderFromData('newReleases', 'newReleasesBooks', initializeReleasesSlider);
        renderFromData('children', 'childrenBooks', initializeChildrenSlider);
        renderFromData('academic', 'academicBooks'); // NEW: Academic Sidebar
        renderFromData('exam', 'examBooks'); // NEW: Exam Management
        
        // Sections that might need individual fallbacks or specific logic
        renderHeroBooks(); // Usually static or special
        renderBoxSets();
        renderFictionBooks();
        renderIndianAuthors();
        renderSidebarBooks();
        renderTop100Books();

        initializeCategoryStrip();
        initializeTop100Modal();

        // Initialize Modern Hero Animations
        const heroText = document.querySelector('.hero-text');
        if (heroText) {
            heroText.style.opacity = '1';
            const children = heroText.children;
            Array.from(children).forEach((child, index) => {
                child.style.opacity = '0';
                child.style.animation = `fadeInUp 0.8s ${index * 0.1}s forwards`;
            });
        }

        console.log('✅ Master initialization complete.');
        initializeNewsletter();

    } catch (error) {
        console.error('Error initializing website:', error);
        hideLoading();
        // Fallback to old individual loading if batch fails
        console.warn('⚠️ Batch load failed, falling back to lazy loading...');
    }
}

// ===== DOM Content Loaded =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWebsite);
} else {
    initializeWebsite();
}

// Add pulse animation for loading
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
    }
`;
document.head.appendChild(style);

// ===== Global UI Utilities =====

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications to prevent stacking too many
    const existing = document.querySelectorAll('.notification');
    existing.forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    let icon = 'fa-check-circle';
    let bg = 'linear-gradient(135deg, #27ae60, #2ecc71)'; // Green

    if (type === 'error') {
        icon = 'fa-exclamation-circle';
        bg = 'linear-gradient(135deg, #e74c3c, #c0392b)'; // Red
    } else if (type === 'info') {
        icon = 'fa-info-circle';
        bg = 'linear-gradient(135deg, #3498db, #2980b9)'; // Blue
    }

    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${bg};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        min-width: 250px;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show skeleton loaders for book grids
function showSkeletons(containerId, count = 8) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        container.innerHTML += `
            <div class="skeleton-book animate-fade-in stagger-${(i % 8) + 1}">
                <div class="skeleton skeleton-img"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text-sm"></div>
                <div class="skeleton skeleton-text-sm" style="width: 40%"></div>
            </div>
        `;
    }
}

// Initialize Live Search Autocomplete
function initializeSearchAutocomplete() {
    const searchInput = document.querySelector('.search-bar input');
    const dropdown = document.getElementById('searchResultsDropdown');
    
    if (!searchInput || !dropdown) return;

    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(debounceTimer);
        
        if (query.length < 2) {
            dropdown.classList.remove('active');
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                // Fetch results from server (Search API)
                const results = await API.Books.getAll({ search: query, limit: 6 });
                
                if (results && results.books && results.books.length > 0) {
                    renderSearchDropdown(results.books);
                    dropdown.classList.add('active');
                } else {
                    dropdown.innerHTML = '<div class="search-no-results">No books found</div>';
                    dropdown.classList.add('active');
                }
            } catch (err) {
                console.error('Search error:', err);
            }
        }, 300);
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Add CSS transition for focus scaling
    searchInput.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.style.transform = 'scale(1.02)';
        searchInput.parentElement.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
    });
    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.style.transform = 'scale(1)';
        searchInput.parentElement.style.boxShadow = 'none';
    });
}

function renderSearchDropdown(books) {
    const dropdown = document.getElementById('searchResultsDropdown');
    
    let html = books.map(book => `
        <div class="search-result-item" onclick="window.location.href='/pages/book-detail.html?id=${book.id}'">
            <img src="${book.image}" alt="${book.title}" onerror="this.src='/images/placeholder-book.png'">
            <div class="search-result-info">
                <div class="search-result-title">${book.title}</div>
                <div class="search-result-author">by ${book.author}</div>
                <div class="search-result-price">₹${book.price}</div>
            </div>
        </div>
    `).join('');

    html += `<a href="/pages/search.html?q=${document.querySelector('.search-bar input').value}" class="view-all-results">View All Results</a>`;
    
    dropdown.innerHTML = html;
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeSearchAutocomplete();
});

