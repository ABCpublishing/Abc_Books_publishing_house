// Admin Panel JavaScript
// Now uses API service for all data operations

// Storage Keys
const STORAGE_KEYS = {
    ADMIN_AUTH: 'abc_admin_auth',
    // BOOKS_DATA: 'abc_books_data_v4', // No longer used
    ADMIN_LOGS: 'abc_admin_logs'
};

// Default Admin Credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    checkAuth();
    initializeEventListeners();
    initializeCategoriesForBooks(); // Populate language/category dropdown
});

// ===== AUTHENTICATION =====
function checkAuth() {
    const isAuthenticated = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);

    if (isAuthenticated === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    loadDashboardData();
}

// ===== EVENT LISTENERS =====
function initializeEventListeners() {
    // Capitalize input for Title and Author
    const capitalizeInput = (e) => {
        let value = e.target.value;
        if (value.length > 0) {
            e.target.value = value.replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
    };

    const bookTitleInput = document.getElementById('bookTitle');
    const bookAuthorInput = document.getElementById('bookAuthor');

    if (bookTitleInput) {
        bookTitleInput.addEventListener('input', capitalizeInput);
    }
    if (bookAuthorInput) {
        bookAuthorInput.addEventListener('input', capitalizeInput);
    }

    // Login Form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            navigateToSection(section);
            closeSidebarOnMobile();
        });
    });

    // Preview Site Button
    const previewBtn = document.getElementById('previewSiteBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function () {
            window.open('../index.html', '_blank');
        });
    }

    // Book Form
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', handleBookFormSubmit);
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        logActivity('Admin logged in');
        showDashboard();
    } else {
        alert('Invalid credentials! Please try again.');
    }
}

// Handle Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'false');
        logActivity('Admin logged out');
        showLogin();
    }
}

// ===== NAVIGATION =====
function navigateToSection(section) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update active content section
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}Section`).classList.add('active');

    // Update page title
    const titles = {
        overview: 'Dashboard Overview',
        books: 'All Books',
        users: 'Users Management',
        orders: 'Orders Management',
        pages: 'Pages Management',
        hero: 'Hero Section',
        editors: "Editor's Choice",
        featured: 'Featured Books',
        trending: 'Trending Now',
        bestseller: 'Bestsellers',
        english: 'English Books',
        arabic: 'Arabic Books',
        kashmiri: 'Kashmiri Books',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

    // Load section data
    loadSectionData(section);
}

// ===== LOAD DASHBOARD DATA =====
async function loadDashboardData() {
    try {
        // Fetch all books to get counts
        const allBooksResponse = await API.Books.getAll({ limit: 1000 });
        const allBooks = allBooksResponse.books || [];

        // We need to count sections manually since API doesn't return section counts
        // This is inefficient but works for now. 
        // Ideally backend should provide better stats endpoint.
        let heroCount = 0;
        let editorsCount = 0;
        let featuredCount = 0;

        // Fetch counts for specific sections (parallel)
        const [heroBooks, editorsBooks, featuredBooks, usersRes, ordersRes] = await Promise.all([
            API.Books.getBySection('hero').catch(() => ({ books: [] })),
            API.Books.getBySection('editors').catch(() => ({ books: [] })),
            API.Books.getBySection('featured').catch(() => ({ books: [] })),
            API.Users.getAll().catch(() => ({ users: [] })),
            API.Orders.getAll().catch(() => ({ orders: [] }))
        ]);

        document.getElementById('totalBooksCount').textContent = allBooks.length;
        document.getElementById('heroCount').textContent = heroBooks.books?.length || 0;
        document.getElementById('editorsCount').textContent = editorsBooks.books?.length || 0;
        document.getElementById('featuredCount').textContent = featuredBooks.books?.length || 0;

        // Update users and orders if elements exist
        if (document.getElementById('usersCount')) {
            document.getElementById('usersCount').textContent = usersRes.users?.length || 0;
        }
        if (document.getElementById('ordersCount')) {
            document.getElementById('ordersCount').textContent = ordersRes.orders?.length || 0;
        }

        // Load activity log
        loadActivityLog();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadSectionData(section) {
    // Show loaders or clear current view if needed
    console.log('Loading section:', section);

    switch (section) {
        case 'books':
            try {
                const response = await API.Books.getAll({ limit: 1000 });
                renderBooksTable(response.books || []);
            } catch (error) {
                console.error('Error loading books:', error);
                document.getElementById('booksTableBody').innerHTML = '<tr><td colspan="6" class="no-data">Error loading books</td></tr>';
            }
            break;
        case 'orders':
            renderOrdersTable();
            break;
        case 'users':
            renderUsersTable();
            break;
        case 'pages':
            renderPagesTable();
            break;
        case 'hero':
        case 'editors':
        case 'featured':
        case 'trending':
        case 'bestseller':
            try {
                const response = await API.Books.getBySection(section);
                renderSectionBooks(section, response.books || []);
            } catch (error) {
                console.error(`Error loading ${section} books:`, error);
                document.getElementById(`${section}Books`).innerHTML = '<p class="no-data">Error loading books</p>';
            }
            break;
        case 'categories':
            if (typeof loadCategoriesTable === 'function') {
                loadCategoriesTable();
            } else {
                console.error('loadCategoriesTable not found. Make sure category-manager.js is loaded.');
            }
            break;
        case 'english':
        case 'arabic':
        case 'kashmiri':
            try {
                // Capitalize first letter for category query (English, Arabic, Kashmiri)
                const category = section.charAt(0).toUpperCase() + section.slice(1);
                console.log(`Fetching books for category: ${category}`);
                const response = await API.Books.getAll({ category: category, limit: 100 });
                renderCategoryBooks(section, response.books || []);
            } catch (error) {
                console.error(`Error loading ${section} books:`, error);
                document.getElementById(`${section}Books`).innerHTML = '<p class="no-data">Error loading books</p>';
            }
            break;
    }
}

// ===== RENDER USERS TABLE =====
async function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="7" class="no-data"><i class="fas fa-spinner fa-spin"></i> Loading users...</td></tr>';

    try {
        const response = await API.Users.getAll();
        const users = response.users || [];

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No users found</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td><strong>${user.id}</strong></td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td>${user.role || 'customer'}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td><span class="badge" style="background: #e1f5fe; color: #01579b;">Active</span></td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn delete" onclick="deleteUserAPI(${user.id})" title="Delete User">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-data">Error loading users: ${error.message}</td></tr>`;
    }
}

async function deleteUserAPI(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        await API.Users.delete(userId);
        alert('User deleted successfully!');
        renderUsersTable();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ===== RENDER PAGES TABLE (Placeholder) =====
function renderPagesTable() {
    const tbody = document.getElementById('pagesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">Dynamic pages management coming in the next update!</td></tr>';
}

// ===== RENDER ORDERS TABLE (Existing Logic Preserved) =====
async function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="no-data"><i class="fas fa-spinner fa-spin"></i> Loading orders from database...</td></tr>';

    try {
        const data = await API.Orders.getAll();
        const orders = data.orders || [];

        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No orders yet</td></tr>';
            return;
        }

        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        tbody.innerHTML = orders.map(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
            });
            const customerName = order.shipping_first_name && order.shipping_last_name
                ? `${order.shipping_first_name} ${order.shipping_last_name}`
                : (order.customer_name || 'Guest');
            const itemCount = order.items ? order.items.length : 0;
            const status = order.status || 'confirmed';

            return `
                <tr>
                    <td><strong>${order.order_id}</strong></td>
                    <td>
                        <div>${customerName}</div>
                        <small style="color: #888;">${order.shipping_email || order.customer_email || 'N/A'}</small>
                    </td>
                    <td>${itemCount} item(s)</td>
                    <td style="font-weight: 600; color: #27ae60;">₹${order.total || 0}</td>
                    <td>${date}</td>
                    <td>
                        <select class="status-select status-${status.toLowerCase()}" onchange="updateOrderStatusAPI(${order.id}, this.value)">
                            <option value="confirmed" ${status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="processing" ${status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                    <td>
                        <div class="action-icons">
                            <button class="icon-btn edit" onclick="viewOrderDetailsAPI(${order.id})" title="View Details"><i class="fas fa-eye"></i></button>
                            <button class="icon-btn delete" onclick="deleteOrderAPI(${order.id})" title="Delete Order"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-data">Error loading orders: ${error.message}</td></tr>`;
    }
}

async function updateOrderStatusAPI(orderId, newStatus) {
    try {
        await API.Orders.updateStatus(orderId, newStatus);
        logActivity(`Updated order status to ${newStatus}`);
        console.log('✅ Order status updated');
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
}

async function viewOrderDetailsAPI(orderId) {
    try {
        const data = await API.Orders.getById(orderId);
        const order = data.order;
        if (!order) { alert('Order not found'); return; }

        let itemsList = (order.items || []).map(item => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div>
                    <strong>${item.title || item.book_title}</strong><br>
                    <small style="color: #666;">By: ${item.author || item.book_author || 'N/A'}</small>
                </div>
                <div style="text-align: right;">
                    <span>Qty: ${item.quantity}</span><br>
                    <strong style="color: #27ae60;">₹${item.price * item.quantity}</strong>
                </div>
            </div>
        `).join('');

        const modalBody = document.getElementById('orderModalBody');
        const modalDate = new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3 style="margin: 0; color: #2c3e50; font-size: 24px;">ORDER #${order.order_id}</h3>
                <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; background-color: #f1f5f9; color: #64748b; margin-top: 5px;">Status: ${order.status.toUpperCase()}</span>
                <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0 0 0;"><i class="fas fa-calendar-alt"></i> ${modalDate}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f8fbff; padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #34495e; font-size: 16px;"><i class="fas fa-user"></i> Customer Info</h4>
                    <p style="margin: 0;"><strong>Name:</strong> ${order.shipping_first_name} ${order.shipping_last_name}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Email:</strong> ${order.shipping_email}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Phone:</strong> ${order.shipping_phone || 'N/A'}</p>
                </div>
                <div>
                    <h4 style="margin: 0 0 10px 0; color: #34495e; font-size: 16px;"><i class="fas fa-shipping-fast"></i> Shipping Details</h4>
                    <p style="margin: 0;">${order.shipping_address1}</p>
                    ${order.shipping_address2 ? `<p style="margin: 0;">${order.shipping_address2}</p>` : ''}
                    <p style="margin: 0;">${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}</p>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #34495e; font-size: 18px; border-bottom: 2px solid #eee; padding-bottom: 5px;">Order Items</h4>
                ${itemsList}
            </div>

            <div style="text-align: right; background: #fffaf0; padding: 15px; border-radius: 8px; border: 1px solid #fbd38d;">
                <div style="display: flex; justify-content: flex-end; gap: 20px;">
                    <div style="text-align: left;">
                        <p style="margin: 0 0 5px 0;">Subtotal:</p>
                        <p style="margin: 0 0 5px 0;">Discount:</p>
                        <h3 style="margin: 5px 0 0 0; color: #2c3e50;">Total:</h3>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0 0 5px 0;">₹${order.subtotal || order.total}</p>
                        <p style="margin: 0 0 5px 0; color: #e74c3c;">-₹${order.discount || 0}</p>
                        <h3 style="margin: 5px 0 0 0; color: #27ae60;">₹${order.total}</h3>
                    </div>
                </div>
                <p style="margin: 10px 0 0 0; font-size: 13px; color: #718096;">Payment Method: ${order.payment_method || 'N/A'}</p>
            </div>
        `;

        document.getElementById('orderModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteOrderAPI(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
        await API.Orders.delete(orderId);
        alert('Order deleted successfully!');
        renderOrdersTable();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
    document.body.style.overflow = 'auto';
}

async function deleteOrderAPI(orderId) {
    if (!confirm('Are you sure?')) return;
    try {
        await fetch(`${API_BASE_URL || '/api'}/orders/${orderId}`, { method: 'DELETE' });
        alert('Order deleted');
        renderOrdersTable();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ===== RENDER USERS TABLE (Existing Logic) =====
async function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="no-data"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    try {
        const data = await API.Users.getAll();
        const users = data.users || [];
        document.getElementById('userCount').textContent = users.length; // Assuming element exists

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No users yet</td></tr>';
            return;
        }

        tbody.innerHTML = users.map((user, index) => `
            <tr>
                <td>${user.id}</td>
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td>Customer</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td><span class="status-badge active">Active</span></td>
                <td>
                    <button class="icon-btn delete" onclick="deleteUserFromAPI(${user.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" class="no-data">Error: ${error.message}</td></tr>`;
    }
}

async function deleteUserFromAPI(userId) {
    if (!confirm('Are you sure?')) return;
    try {
        await API.Users.delete(userId);
        alert('User deleted');
        renderUsersTable();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}


// ===== RENDER BOOKS TABLE =====
async function renderBooksTable(books) {
    const tbody = document.getElementById('booksTableBody');

    if (!books || books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No books added yet</td></tr>';
        return;
    }

    // We need to fetch sections for each book to display badges? 
    // That would be N+1 requests. 
    // Alternatively, just display "Hero" etc if we fetched all books (the API doesn't return sections in getAll list).
    // For now, we might skip detailed section badges on the main list to save performance, 
    // OR we fetch all sections first and map them.

    // Let's try to fetch section maps
    let sectionMap = {};
    try {
        const [hero, editors, featured, trending, bestseller] = await Promise.all([
            API.Books.getBySection('hero').catch(() => ({ books: [] })),
            API.Books.getBySection('editors').catch(() => ({ books: [] })),
            API.Books.getBySection('featured').catch(() => ({ books: [] })),
            API.Books.getBySection('trending').catch(() => ({ books: [] })),
            API.Books.getBySection('bestseller').catch(() => ({ books: [] }))
        ]);

        books.forEach(b => {
            sectionMap[b.id] = [];
            if (hero.books?.find(hb => hb.id === b.id)) sectionMap[b.id].push('Hero');
            if (editors.books?.find(eb => eb.id === b.id)) sectionMap[b.id].push('Editors');
            if (featured.books?.find(fb => fb.id === b.id)) sectionMap[b.id].push('Featured');
            if (trending.books?.find(tb => tb.id === b.id)) sectionMap[b.id].push('Trending');
            if (bestseller.books?.find(bb => bb.id === b.id)) sectionMap[b.id].push('Bestseller');
        });
    } catch (e) { console.warn('Could not load section badges', e); }

    tbody.innerHTML = books.map(book => {
        const sectionBadges = (sectionMap[book.id] || []).map(s => `<span class="badge">${s}</span>`).join('');

        return `
            <tr>
                <td><code style="background:#f0f0f0;padding:2px 6px;border-radius:4px;font-size:12px;">${book.id}</code></td>
                <td><img src="${book.image}" alt="${book.title}" class="book-img" onerror="this.src='https://via.placeholder.com/50x70?text=No+Image'"></td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td>₹${book.price}</td>
                <td><div class="section-badges">${sectionBadges || '<span style="color: #999;">None</span>'}</div></td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="editBook('${book.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="icon-btn delete" onclick="deleteBook('${book.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}


// ===== RENDER SECTION BOOKS =====
function renderSectionBooks(section, books) {
    const container = document.getElementById(`${section}Books`);

    if (books.length === 0) {
        container.innerHTML = '<p class="no-data">No books in this section yet</p>';
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="book-card">
            <img src="${book.image}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
            <div class="book-card-content">
                <h3 title="${book.title}">${book.title}</h3>
                <p>${book.author}</p>
                <p style="font-weight: 600; color: var(--primary-color);">₹${book.price}</p>
                <div class="book-card-actions">
                    <button class="btn-edit-book" onclick="editBook('${book.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-remove-book" onclick="removeFromSection('${book.id}', '${section}')">
                        <i class="fas fa-times"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== RENDER CATEGORY BOOKS (New Function) =====
function renderCategoryBooks(section, books) {
    const container = document.getElementById(`${section}Books`);

    if (!books || books.length === 0) {
        container.innerHTML = '<p class="no-data">No books in this category yet</p>';
        return;
    }

    container.innerHTML = books.map(book => `
        <div class="book-card">
            <img src="${book.image}" alt="${book.title}" onerror="this.src='https://via.placeholder.com/200x280?text=No+Image'">
            <div class="book-card-content">
                <h3 title="${book.title}">${book.title}</h3>
                <p>${book.author}</p>
                <p style="font-weight: 600; color: var(--primary-color);">₹${book.price}</p>
                <div class="book-card-actions">
                    <button class="btn-edit-book" onclick="editBook('${book.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-remove-book" onclick="deleteBook('${book.id}')" style="background-color: #e74c3c;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== BOOK MODAL FUNCTIONS =====
function showAddBookModal() {
    const modal = document.getElementById('bookModal');
    document.getElementById('modalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    // Clear checkboxes
    document.querySelectorAll('input[name="sections"]').forEach(cb => cb.checked = false);
    modal.classList.add('active');
}

function showAddBookModalWithCategory(category) {
    showAddBookModal();
    const categorySelect = document.getElementById('bookCategory');
    if (categorySelect) {
        // Try to match the category
        for (let i = 0; i < categorySelect.options.length; i++) {
            if (categorySelect.options[i].value.toLowerCase() === category.toLowerCase()) {
                categorySelect.selectedIndex = i;
                break;
            }
        }
    }
}

function closeBookModal() {
    document.getElementById('bookModal').classList.remove('active');
}

async function editBook(bookId) {
    try {
        const response = await API.Books.getById(bookId);
        const book = response.book;

        if (!book) return;

        document.getElementById('modalTitle').textContent = 'Edit Book';
        document.getElementById('bookId').value = book.id;
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookAuthor').value = book.author;
        document.getElementById('bookPublisher').value = book.publisher || 'ABC Publishing';
        document.getElementById('bookPrice').value = book.price;
        document.getElementById('bookOriginalPrice').value = book.original_price || '';
        document.getElementById('bookCategory').value = book.category || '';
        document.getElementById('bookImage').value = book.image;

        // Populate sections
        // Note: The API GET /:id response now includes 'sections' array thanks to our backend update
        const bookSections = book.sections || [];
        document.querySelectorAll('input[name="sections"]').forEach(checkbox => {
            checkbox.checked = bookSections.includes(checkbox.value);
        });

        document.getElementById('bookModal').classList.add('active');
    } catch (error) {
        console.error('Error fetching book details:', error);
        alert('Failed to load book parameters');
    }
}

async function handleBookFormSubmit(e) {
    e.preventDefault();

    const bookId = document.getElementById('bookId').value;
    const isEdit = !!bookId;

    const book = {
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        publisher: document.getElementById('bookPublisher')?.value || 'ABC Publishing',
        price: parseInt(document.getElementById('bookPrice').value),
        original_price: parseInt(document.getElementById('bookOriginalPrice').value) || null,
        image: document.getElementById('bookImage').value,
        language: document.getElementById('bookLanguage')?.value || 'Urdu',
        subcategory: document.getElementById('bookSubcategory')?.value || '',
        category: document.getElementById('bookCategory')?.value || document.getElementById('bookLanguage')?.value || 'General',
        rating: 4.5, // Default rating
        sections: Array.from(document.querySelectorAll('input[name="sections"]:checked')).map(cb => cb.value)
    };

    try {
        if (isEdit) {
            await API.Books.update(bookId, book);
            logActivity(`Updated book: ${book.title}`);
            alert('Book updated successfully!');
        } else {
            await API.Books.create(book);
            logActivity(`Added new book: ${book.title}`);
            alert('Book added successfully!');
        }

        closeBookModal();
        loadDashboardData();

        // Reload current section if applicable
        const activeSection = document.querySelector('.nav-item.active')?.getAttribute('data-section');
        if (activeSection) loadSectionData(activeSection);

    } catch (error) {
        console.error('Error saving book:', error);
        alert('Error saving book: ' + error.message);
    }
}

async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
        return;
    }

    try {
        await API.Books.delete(bookId);
        logActivity(`Deleted book ID: ${bookId}`);
        alert('Book deleted successfully!');

        loadDashboardData();
        const activeSection = document.querySelector('.nav-item.active')?.getAttribute('data-section');
        if (activeSection) loadSectionData(activeSection);
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book: ' + error.message);
    }
}

async function removeFromSection(bookId, sectionToRemove) {
    if (!confirm('Remove this book from this section?')) return;

    try {
        // 1. Get current book details (including sections)
        const response = await API.Books.getById(bookId);
        const book = response.book;
        if (!book) throw new Error('Book not found');

        // 2. Filter out the specific section
        const currentSections = book.sections || [];
        const newSections = currentSections.filter(s => s !== sectionToRemove);

        // 3. Update the book with the new sections list
        await API.Books.update(bookId, {
            ...book,
            sections: newSections
        });

        logActivity(`Removed book from ${sectionToRemove}`);

        // Reload
        loadSectionData(sectionToRemove);
        loadDashboardData(); // Update counts
    } catch (error) {
        console.error('Error removing from section:', error);
        alert('Failed to remove from section: ' + error.message);
    }
}

async function showAddToSectionModal(section) {
    // This is a bit complex. We need to show books NOT in this section.
    // Ideally we have a modal with a search/dropdown.
    // For simplicity, we'll prompt for an ID like before, or better, show a simple prompt.
    // In a real app, a proper selector modal is needed.

    // Let's implement a simple "Enter Book ID" prompt for now, 
    // or if we want to be fancy, we could reuse the book modal but that complicates things.
    // The previous implementation used a prompt or search.

    const bookTitleOrId = prompt('Enter Book ID or exact Title to add to ' + section + ':');
    if (!bookTitleOrId) return;

    try {
        // Find the book first.
        // We can search by ID first.
        let bookToAdd = null;
        try {
            const res = await API.Books.getById(bookTitleOrId);
            if (res.book) bookToAdd = res.book;
        } catch (e) {
            // Not a valid ID, try finding by title? 
            // We don't have search by exact title easily exposed in API.Books without search parameter
            // Let's assume user enters ID for now for reliability.
        }

        // Fallback: search API
        if (!bookToAdd) {
            const searchRes = await API.Books.getAll({ search: bookTitleOrId, limit: 1 });
            if (searchRes.books && searchRes.books.length > 0) {
                bookToAdd = searchRes.books[0];
            }
        }

        if (!bookToAdd) {
            alert('Book not found!');
            return;
        }

        // Add section
        const currentSections = bookToAdd.sections || [];
        if (!currentSections.includes(section)) {
            const newSections = [...currentSections, section];
            await API.Books.update(bookToAdd.id, {
                ...bookToAdd,
                sections: newSections
            });
            alert('Added to ' + section);
            loadSectionData(section);
            loadDashboardData();
        } else {
            alert('Book is already in this section');
        }

    } catch (error) {
        alert('Error: ' + error.message);
    }
}


// ===== ACTIVITY LOG (LocalStorage for now) =====
function logActivity(message) {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS) || '[]');
    logs.unshift({
        message,
        timestamp: new Date().toISOString()
    });
    if (logs.length > 20) logs.pop();
    localStorage.setItem(STORAGE_KEYS.ADMIN_LOGS, JSON.stringify(logs));
}

function loadActivityLog() {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS) || '[]');
    const container = document.getElementById('activityLog');

    if (logs.length === 0) {
        container.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }

    container.innerHTML = logs.slice(0, 10).map(log => {
        const date = new Date(log.timestamp);
        return `
            <div class="activity-item">
                <strong>${log.message}</strong>
                <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
                </div>
            </div>
        `;
    }).join('');
}

function exportData() {
    alert('Export now only supports local logs, as books are in cloud database.');
    // Logic for exporting logs/local data if needed
}

function importData() {
    alert('Import not supported for cloud database via this tool.');
}

function clearAllData() {
    alert('Clear All Data is disabled for cloud database protection.');
}

function resetToDefault() {
    alert('Reset to default is disabled for cloud database protection.');
}

function showChangePasswordModal() {
    alert('Feature coming soon');
}

// ===== RESPONSIVE SIDEBAR =====
function toggleAdminSidebar() {
    document.querySelector('.admin-sidebar').classList.toggle('active');
    document.querySelector('.sidebar-overlay').classList.toggle('active');
}

// Close sidebar when clicking a nav item (mobile)
function closeSidebarOnMobile() {
    if (window.innerWidth <= 768) {
        document.querySelector('.admin-sidebar').classList.remove('active');
        document.querySelector('.sidebar-overlay').classList.remove('active');
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!checkAdminAuth()) return;

    // Capitalize input for Title and Author
    const capitalizeInput = (e) => {
        let value = e.target.value;
        if (value.length > 0) {
            // Capitalize first letter of each word (Title Case)
            e.target.value = value.replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }
    };

    const bookTitleInput = document.getElementById('bookTitle');
    const bookAuthorInput = document.getElementById('bookAuthor');

    if (bookTitleInput) {
        bookTitleInput.addEventListener('input', capitalizeInput);
    }
    if (bookAuthorInput) {
        bookAuthorInput.addEventListener('input', capitalizeInput);
    }

    // Set initial active state based on hash or default
    const hash = window.location.hash.slice(1) || 'overview';
    navigateToSection(hash);

    // Load initial data
    loadDashboardData();
    updateDate();

    // Set up other event listeners
    document.getElementById('logoutBtn').addEventListener('click', adminLogout);

    // Setup modal closing
    window.onclick = function (event) {
        const modals = document.getElementsByClassName('modal');
        for (let i = 0; i < modals.length; i++) {
            if (event.target == modals[i]) {
                modals[i].classList.remove('active');
            }
        }
    }
});

// ===== DYNAMIC CATEGORIES SYSTEM =====
// Different subcategories for each language (Fallback for when DB is empty)
const SUBCATEGORIES_BY_LANGUAGE = {
    'Urdu': [
        { value: 'Quran & Tafsir', label: '📖 Quran & Tafsir' },
        { value: 'Hadith', label: '📜 Hadith' },
        { value: 'Biography', label: '👤 Biography' },
        { value: 'Creed & Fiqh', label: '⚖️ Creed & Fiqh' },
        { value: 'Literature & Fiction', label: '📕 Literature & Fiction' }
    ],
    'English': [
        { value: 'Quran & Tafsir', label: '📖 Quran & Tafsir' },
        { value: 'Hadith', label: '📜 Hadith' },
        { value: 'Academic', label: '🎓 Academic' },
        { value: 'Literature & Fiction', label: '📕 Literature & Fiction' }
    ],
    'Arabic': [
        { value: 'Quran & Tafsir', label: '📖 Quran & Tafsir' },
        { value: 'Hadith', label: '📜 Hadith' },
        { value: 'Arabic Grammar', label: '📝 Arabic Grammar' }
    ],
    'Kashmiri': [
        { value: 'Kashmiri Poetry', label: '🎭 Kashmiri Poetry' },
        { value: 'Kashmiri Literature', label: '📕 Kashmiri Literature' }
    ]
};

// Load languages for the book form
async function initializeCategoriesForBooks() {
    const languageSelect = document.getElementById('bookLanguage');
    if (!languageSelect) return;

    try {
        const response = await API.Categories.getLanguages();
        const languages = response.languages || [];

        // Save some default options if API fails or returns empty
        const displayLanguages = languages.length > 0 ? languages : [
            { name: 'Urdu', slug: 'Urdu' },
            { name: 'English', slug: 'English' },
            { name: 'Arabic', slug: 'Arabic' },
            { name: 'Kashmiri', slug: 'Kashmiri' }
        ];

        languageSelect.innerHTML = '<option value="">-- Select Category --</option>';
        displayLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.name;
            option.textContent = lang.name;
            languageSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading languages for book form:', error);
    }
}

// Load subcategories based on selected language
async function loadSubcategories() {
    const languageSelect = document.getElementById('bookLanguage');
    const subcategorySelect = document.getElementById('bookSubcategory');
    if (!languageSelect || !subcategorySelect) return;

    const language = languageSelect.value;

    // Clear existing options
    subcategorySelect.innerHTML = '';

    if (!language) {
        subcategorySelect.innerHTML = '<option value="">-- Select Category First --</option>';
        return;
    }

    // Add loading indicator
    subcategorySelect.innerHTML = '<option value="">Loading...</option>';

    try {
        // Fetch subcategories for the selected language
        // We use the language name as slug for now as per current DB setup
        const response = await API.Categories.getSubcategories(language);
        const subcategories = response.subcategories || [];

        subcategorySelect.innerHTML = '<option value="">-- Select Subcategory --</option>';

        if (subcategories.length === 0) {
            // Fallback to legacy categories if none found in DB for this language
            const legacySub = SUBCATEGORIES_BY_LANGUAGE[language] || [];
            legacySub.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.value;
                option.textContent = sub.label;
                subcategorySelect.appendChild(option);
            });
        } else {
            subcategories.forEach(sub => {
                const option = document.createElement('option');
                option.value = sub.name;
                option.textContent = sub.name;
                subcategorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading subcategories:', error);
        subcategorySelect.innerHTML = '<option value="">Error loading</option>';
    }

    // Update the hidden category field for backward compatibility
    document.getElementById('bookCategory').value = language;
}

// Updated function to populate form when editing
async function populateBookFormForEdit(book) {
    document.getElementById('bookTitle').value = book.title || '';
    document.getElementById('bookAuthor').value = book.author || '';
    document.getElementById('bookPrice').value = book.price || '';
    document.getElementById('bookOriginalPrice').value = book.original_price || '';

    // Set language
    const languageSelect = document.getElementById('bookLanguage');
    if (languageSelect) {
        languageSelect.value = book.language || 'Urdu';
        loadSubcategories(); // Populate subcategories

        // Set subcategory after loading options
        setTimeout(() => {
            const subcategorySelect = document.getElementById('bookSubcategory');
            if (subcategorySelect && book.subcategory) {
                subcategorySelect.value = book.subcategory;
            }
        }, 100);
    }

    // Set image
    if (book.image) {
        document.getElementById('bookImage').value = book.image;
        // Show preview
        const previewContainer = document.getElementById('imagePreview');
        const previewImg = document.getElementById('previewImg');
        if (previewContainer && previewImg) {
            previewImg.src = book.image;
            previewContainer.style.display = 'block';
        }
    }

    // Set sections checkboxes
    const bookSections = book.sections || [];
    document.querySelectorAll('input[name="sections"]').forEach(checkbox => {
        checkbox.checked = bookSections.includes(checkbox.value);
    });
}
