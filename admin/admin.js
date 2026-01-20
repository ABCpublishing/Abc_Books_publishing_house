// Admin Panel JavaScript

// Dynamic API URL (same as api.js)
const ADMIN_API_BASE = (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? '/api'
    : '\\';

// Storage Keys
const STORAGE_KEYS = {
    ADMIN_AUTH: 'abc_admin_auth',
    BOOKS_DATA: 'abc_books_data',
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
        });
    });

    // Preview Site Button
    const previewBtn = document.getElementById('previewSiteBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', function () {
            window.open('index.html', '_blank');
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
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

    // Load section data
    loadSectionData(section);
}

// ===== DATA MANAGEMENT =====
function getBooksData() {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKS_DATA);
    return data ? JSON.parse(data) : { books: [], sections: {} };
}

function saveBooksData(data) {
    localStorage.setItem(STORAGE_KEYS.BOOKS_DATA, JSON.stringify(data));
}

function generateBookId() {
    return 'book_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ===== LOAD DASHBOARD DATA =====
function loadDashboardData() {
    const data = getBooksData();

    // Update stats
    document.getElementById('totalBooksCount').textContent = data.books?.length || 0;
    document.getElementById('heroCount').textContent = data.sections?.hero?.length || 0;
    document.getElementById('editorsCount').textContent = data.sections?.editors?.length || 0;
    document.getElementById('featuredCount').textContent = data.sections?.featured?.length || 0;

    // Load activity log
    loadActivityLog();
}

function loadSectionData(section) {
    const data = getBooksData();

    switch (section) {
        case 'books':
            renderBooksTable(data.books || []);
            break;
        case 'orders':
            renderOrdersTable();
            break;
        case 'users':
            renderUsersTable();
            break;
        case 'hero':
            renderSectionBooks('hero', data);
            break;
        case 'editors':
            renderSectionBooks('editors', data);
            break;
        case 'featured':
            renderSectionBooks('featured', data);
            break;
        case 'trending':
            renderSectionBooks('trending', data);
            break;
    }
}

// ===== RENDER ORDERS TABLE =====
async function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    console.log('🔄 renderOrdersTable() called');

    // Show loading state
    tbody.innerHTML = '<tr><td colspan="7" class="no-data"><i class="fas fa-spinner fa-spin"></i> Loading orders from database...</td></tr>';

    try {
        console.log('📤 Fetching orders from \\/orders');
        // Fetch orders from API
        const response = await fetch('\\/orders');
        console.log('📥 Response status:', response.status, response.statusText);

        const data = await response.json();
        console.log('📥 Raw API response:', data);

        const orders = data.orders || [];
        console.log('📥 Loaded orders from API:', orders);
        console.log('📥 Number of orders:', orders.length);

        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data">No orders yet</td></tr>';
            return;
        }

        // Sort by date (newest first)
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        tbody.innerHTML = orders.map(order => {
            const date = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
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
                            <button class="icon-btn edit" onclick="viewOrderDetailsAPI(${order.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="icon-btn delete" onclick="deleteOrderAPI(${order.id})" title="Delete Order">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading orders:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="no-data"><i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i> Error loading orders: ${error.message}. Make sure backend is running.</td></tr>`;
    }
}

// Update order status via API
async function updateOrderStatusAPI(orderId, newStatus) {
    try {
        const response = await fetch(`\\/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            logActivity(`Updated order status to ${newStatus}`);
            console.log('✅ Order status updated');
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'Failed to update status'));
        }
    } catch (error) {
        alert('Error updating status: ' + error.message);
    }
}

// View order details from API
async function viewOrderDetailsAPI(orderId) {
    try {
        const response = await fetch(`\\/orders/${orderId}`);
        const data = await response.json();
        const order = data.order;

        if (!order) {
            alert('Order not found');
            return;
        }

        let itemsList = (order.items || []).map(item =>
            `• ${item.title || item.book_title || 'Book'} (Qty: ${item.quantity || 1}) - ₹${item.price * (item.quantity || 1)}`
        ).join('\n');

        const details = `
ORDER DETAILS (from Database)
=============================
Order ID: ${order.order_id}
Date: ${new Date(order.created_at).toLocaleString()}
Status: ${order.status || 'Confirmed'}

CUSTOMER
--------
Name: ${order.shipping_first_name} ${order.shipping_last_name}
Email: ${order.shipping_email}
Phone: ${order.shipping_phone}
Address: ${order.shipping_address1}, ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}

ITEMS
-----
${itemsList || 'No items'}

PAYMENT
-------
Subtotal: ₹${order.subtotal || order.total}
Discount: ₹${order.discount || 0}
Total: ₹${order.total}
Payment Method: ${order.payment_method || 'COD'}
        `.trim();

        alert(details);
    } catch (error) {
        alert('Error loading order details: ' + error.message);
    }
}

// Delete order from API
async function deleteOrderAPI(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
        const response = await fetch(`\\/orders/${orderId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Order deleted successfully!');
            renderOrdersTable();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'Failed to delete order'));
        }
    } catch (error) {
        alert('Error deleting order: ' + error.message);
    }
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
    let orders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex >= 0) {
        orders[orderIndex].status = newStatus;
        localStorage.setItem('abc_orders', JSON.stringify(orders));
        logActivity(`Updated order ${orderId} status to ${newStatus}`);
        renderOrdersTable();
    }
}

// View order details
function viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
    const order = orders.find(o => o.orderId === orderId);

    if (!order) {
        alert('Order not found');
        return;
    }

    const shipping = order.shipping || {};
    const items = order.items || [];

    let itemsList = items.map(item =>
        `• ${item.title} (Qty: ${item.quantity || 1}) - ₹${item.price * (item.quantity || 1)}`
    ).join('\n');

    const details = `
ORDER DETAILS
=============
Order ID: ${order.orderId}
Date: ${new Date(order.orderDate).toLocaleString()}
Status: ${order.status || 'Confirmed'}

CUSTOMER
--------
Name: ${shipping.firstName} ${shipping.lastName}
Email: ${shipping.email}
Phone: ${shipping.phone}
Address: ${shipping.address1}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}

ITEMS
-----
${itemsList}

PAYMENT
-------
Subtotal: ₹${order.subtotal || order.total}
Discount: ₹${order.discount || 0}
Total: ₹${order.total}
Payment Method: ${order.paymentMethod || 'COD'}
    `.trim();

    alert(details);
}

// Delete order
function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    let orders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
    orders = orders.filter(o => o.orderId !== orderId);
    localStorage.setItem('abc_orders', JSON.stringify(orders));

    logActivity(`Deleted order: ${orderId}`);
    renderOrdersTable();
    alert('Order deleted successfully!');
}

// ===== RENDER USERS TABLE =====
async function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');

    // Show loading state
    tbody.innerHTML = '<tr><td colspan="7" class="no-data"><i class="fas fa-spinner fa-spin"></i> Loading users from database...</td></tr>';

    try {
        // Fetch users from API
        const response = await fetch('\\/users');
        const data = await response.json();
        const users = data.users || [];

        console.log('📥 Loaded users from API:', users);

        // Also update the user count in dashboard
        const userCountEl = document.getElementById('userCount');
        if (userCountEl) {
            userCountEl.textContent = users.length;
        }

        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="no-data"><i class="fas fa-users"></i> No registered users yet</td></tr>';
            return;
        }

        tbody.innerHTML = users.map((user, index) => {
            const joinDate = user.created_at
                ? new Date(user.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                })
                : 'N/A';

            const joinTime = user.created_at
                ? new Date(user.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
                : '';

            return `
                <tr>
                    <td>${user.id || index + 1}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 35px; height: 35px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                                ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <strong>${user.name || 'N/A'}</strong>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div><i class="fas fa-envelope" style="color: #888; margin-right: 5px;"></i>${user.email}</div>
                        ${user.phone ? `<div style="font-size: 12px; color: #888;"><i class="fas fa-phone" style="margin-right: 5px;"></i>${user.phone}</div>` : ''}
                    </td>
                    <td><span style="background: #e3f2fd; color: #1565c0; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;">Customer</span></td>
                    <td>
                        <div>${joinDate}</div>
                        <small style="color: #888;">${joinTime}</small>
                    </td>
                    <td><span class="status-badge active"><i class="fas fa-check-circle"></i> Active</span></td>
                    <td>
                        <div class="action-icons">
                            <button class="icon-btn view" onclick="viewUserDetailsFromAPI(${user.id})" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="icon-btn delete" onclick="deleteUserFromAPI(${user.id})" title="Delete User">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading users:', error);
        tbody.innerHTML = `<tr><td colspan="7" class="no-data"><i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i> Error loading users: ${error.message}. Make sure backend is running.</td></tr>`;
    }
}

// View user details from API
async function viewUserDetailsFromAPI(userId) {
    try {
        const response = await fetch(`\\/users/${userId}`);
        const data = await response.json();
        const user = data.user;

        if (!user) {
            alert('User not found');
            return;
        }

        const joinDate = user.created_at
            ? new Date(user.created_at).toLocaleString('en-IN')
            : 'Unknown';

        const details = `
═══════════════════════════════════════
       👤 USER DETAILS (from Database)
═══════════════════════════════════════

🆔 ID: ${user.id}
📛 Name: ${user.name}
📧 Email: ${user.email}
📱 Phone: ${user.phone || 'Not provided'}
📅 Registered: ${joinDate}

═══════════════════════════════════════
        `.trim();

        alert(details);
    } catch (error) {
        alert('Error loading user details: ' + error.message);
    }
}

// Delete user from API
async function deleteUserFromAPI(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`\\/users/${userId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('User deleted successfully!');
            renderUsersTable();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'Failed to delete user'));
        }
    } catch (error) {
        alert('Error deleting user: ' + error.message);
    }
}

// View user details - Enhanced with full order history
function viewUserDetails(userId) {
    const users = JSON.parse(localStorage.getItem('abc_books_users') || '[]');
    const user = users.find(u => u.id === userId);

    if (!user) {
        alert('User not found');
        return;
    }

    const joinDate = user.createdAt
        ? new Date(user.createdAt).toLocaleString('en-IN')
        : 'Unknown';

    // Get user's orders
    const allOrders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
    const userOrders = allOrders.filter(o => o.shipping?.email === user.email);

    // Calculate total spent
    const totalSpent = userOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalItems = userOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0);

    // Build order details
    let orderDetails = '';
    if (userOrders.length > 0) {
        orderDetails = userOrders.map((order, index) => {
            const orderDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const books = order.items?.map(item =>
                `    📖 ${item.title} (Qty: ${item.quantity || 1}) - ₹${item.price * (item.quantity || 1)}`
            ).join('\n') || '    No items';

            return `
📦 ORDER #${index + 1}: ${order.orderId}
   Date: ${orderDate}
   Status: ${order.status?.toUpperCase() || 'CONFIRMED'}
   Books:
${books}
   Total: ₹${order.total}`;
        }).join('\n\n');
    } else {
        orderDetails = '   No orders yet';
    }

    const details = `
══════════════════════════════════════
       👤 USER DETAILS
══════════════════════════════════════

🆔 ID: ${user.id}
📛 Name: ${user.name}
📧 Email: ${user.email}
📱 Phone: ${user.phone || 'Not provided'}
📅 Registered: ${joinDate}

══════════════════════════════════════
       📊 ORDER STATISTICS
══════════════════════════════════════

🛒 Total Orders: ${userOrders.length}
📚 Total Books Purchased: ${totalItems}
💰 Total Amount Spent: ₹${totalSpent}

══════════════════════════════════════
       📋 ORDER HISTORY
══════════════════════════════════════
${orderDetails}

══════════════════════════════════════
    `.trim();

    alert(details);
}


// Delete user
function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    let users = JSON.parse(localStorage.getItem('abc_books_users') || '[]');
    const user = users.find(u => u.id === userId);

    users = users.filter(u => u.id !== userId);
    localStorage.setItem('abc_books_users', JSON.stringify(users));

    logActivity(`Deleted user: ${user?.name || userId}`);
    renderUsersTable();
    alert('User deleted successfully!');
}

// ===== RENDER BOOKS TABLE =====
function renderBooksTable(books) {
    const tbody = document.getElementById('booksTableBody');

    if (!books || books.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No books added yet</td></tr>';
        return;
    }

    tbody.innerHTML = books.map(book => {
        const sections = getBookSections(book.id);
        const sectionBadges = sections.map(s => `<span class="badge">${s}</span>`).join('');

        return `
            <tr>
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

function getBookSections(bookId) {
    const data = getBooksData();
    const sections = [];

    if (data.sections) {
        if (data.sections.hero?.includes(bookId)) sections.push('Hero');
        if (data.sections.editors?.includes(bookId)) sections.push('Editors');
        if (data.sections.featured?.includes(bookId)) sections.push('Featured');
        if (data.sections.trending?.includes(bookId)) sections.push('Trending');
    }

    return sections;
}

// ===== RENDER SECTION BOOKS =====
function renderSectionBooks(section, data) {
    const container = document.getElementById(`${section}Books`);
    const bookIds = data.sections?.[section] || [];

    if (bookIds.length === 0) {
        container.innerHTML = '<p class="no-data">No books in this section yet</p>';
        return;
    }

    const books = bookIds.map(id => data.books.find(b => b.id === id)).filter(Boolean);

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

// ===== BOOK MODAL FUNCTIONS =====
function showAddBookModal() {
    const modal = document.getElementById('bookModal');
    document.getElementById('modalTitle').textContent = 'Add New Book';
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    modal.classList.add('active');
}

function closeBookModal() {
    document.getElementById('bookModal').classList.remove('active');
}

function editBook(bookId) {
    const data = getBooksData();
    const book = data.books.find(b => b.id === bookId);

    if (!book) return;

    document.getElementById('modalTitle').textContent = 'Edit Book';
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookPrice').value = book.price;
    document.getElementById('bookOriginalPrice').value = book.originalPrice || '';
    document.getElementById('bookISBN').value = book.isbn || '';
    document.getElementById('bookYear').value = book.publishYear || '';
    document.getElementById('bookImage').value = book.image;

    // Check sections
    const sections = getBookSections(bookId);
    document.querySelectorAll('input[name="sections"]').forEach(checkbox => {
        const sectionName = checkbox.value.charAt(0).toUpperCase() + checkbox.value.slice(1);
        checkbox.checked = sections.includes(sectionName);
    });

    document.getElementById('bookModal').classList.add('active');
}

function handleBookFormSubmit(e) {
    e.preventDefault();

    const bookId = document.getElementById('bookId').value || generateBookId();
    const isEdit = !!document.getElementById('bookId').value;

    const book = {
        id: bookId,
        title: document.getElementById('bookTitle').value,
        author: document.getElementById('bookAuthor').value,
        price: parseInt(document.getElementById('bookPrice').value),
        originalPrice: parseInt(document.getElementById('bookOriginalPrice').value) || null,
        isbn: document.getElementById('bookISBN').value || '',
        publishYear: parseInt(document.getElementById('bookYear').value) || '',
        image: document.getElementById('bookImage').value,
        rating: 4.5 // Default rating
    };

    const selectedSections = Array.from(document.querySelectorAll('input[name="sections"]:checked'))
        .map(cb => cb.value);

    const data = getBooksData();

    if (isEdit) {
        // Update existing book
        const index = data.books.findIndex(b => b.id === bookId);
        if (index !== -1) {
            data.books[index] = book;
            logActivity(`Updated book: ${book.title}`);
        }
    } else {
        // Add new book
        if (!data.books) data.books = [];
        data.books.push(book);
        logActivity(`Added new book: ${book.title}`);
    }

    // Update sections
    if (!data.sections) data.sections = {};

    // Remove from all sections first
    ['hero', 'editors', 'featured', 'trending'].forEach(section => {
        if (!data.sections[section]) data.sections[section] = [];
        data.sections[section] = data.sections[section].filter(id => id !== bookId);
    });

    // Add to selected sections
    selectedSections.forEach(section => {
        if (!data.sections[section]) data.sections[section] = [];
        if (!data.sections[section].includes(bookId)) {
            data.sections[section].push(bookId);
        }
    });

    saveBooksData(data);
    closeBookModal();
    loadDashboardData();
    loadSectionData('books');

    alert(isEdit ? 'Book updated successfully!' : 'Book added successfully!');
}

function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book? This action cannot be undone.')) {
        return;
    }

    try {
        const data = getBooksData();
        const book = data.books.find(b => b.id === bookId);
        const bookTitle = book?.title || 'Unknown Book';

        // Remove from books array
        data.books = data.books.filter(b => b.id !== bookId);

        // Remove from all sections
        if (data.sections) {
            Object.keys(data.sections).forEach(section => {
                if (data.sections[section]) {
                    data.sections[section] = data.sections[section].filter(id => id !== bookId);
                }
            });
        }

        saveBooksData(data);
        logActivity(`Deleted book: ${bookTitle}`);

        // Reload the dashboard and current view
        loadDashboardData();

        // Check which section is currently active and reload it
        const activeSection = document.querySelector('.nav-item.active')?.getAttribute('data-section');
        if (activeSection) {
            loadSectionData(activeSection);
        }

        alert('Book "' + bookTitle + '" deleted successfully!');
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book: ' + error.message);
    }
}

function removeFromSection(bookId, section) {
    if (!confirm('Remove this book from this section?')) return;

    const data = getBooksData();
    if (data.sections && data.sections[section]) {
        data.sections[section] = data.sections[section].filter(id => id !== bookId);
    }

    saveBooksData(data);
    logActivity(`Removed book from ${section} section`);
    loadSectionData(section);
    loadDashboardData();
}

function showAddToSectionModal(section) {
    const data = getBooksData();
    const availableBooks = data.books.filter(book => {
        const sectionBooks = data.sections?.[section] || [];
        return !sectionBooks.includes(book.id);
    });

    if (availableBooks.length === 0) {
        alert('No books available to add. Please create a book first.');
        return;
    }

    const bookId = prompt('Enter book ID or select from All Books section:');
    if (bookId) {
        if (!data.sections) data.sections = {};
        if (!data.sections[section]) data.sections[section] = [];

        if (!data.sections[section].includes(bookId)) {
            data.sections[section].push(bookId);
            saveBooksData(data);
            loadSectionData(section);
            loadDashboardData();
        }
    }
}

// ===== ACTIVITY LOG =====
function logActivity(message) {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_LOGS) || '[]');
    logs.unshift({
        message,
        timestamp: new Date().toISOString()
    });

    // Keep only last 20 logs
    if (logs.length > 20) {
        logs.pop();
    }

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

// ===== DATA MANAGEMENT FUNCTIONS =====
function exportData() {
    const data = getBooksData();
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `abc-books-data-${Date.now()}.json`;
    link.click();

    logActivity('Exported data');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            try {
                const data = JSON.parse(event.target.result);
                saveBooksData(data);
                loadDashboardData();
                loadSectionData('books');
                logActivity('Imported data');
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data: ' + error.message);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

function clearAllData() {
    if (!confirm('Are you sure you want to clear ALL data? This cannot be undone!')) return;

    if (confirm('This will delete all books and sections. Continue?')) {
        localStorage.removeItem(STORAGE_KEYS.BOOKS_DATA);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_LOGS);
        logActivity('Cleared all data');
        loadDashboardData();
        loadSectionData('books');
        alert('All data cleared!');
    }
}

function resetToDefault() {
    if (!confirm('Reset to default sample data?')) return;

    // You can add default sample data here if needed
    const defaultData = {
        books: [],
        sections: {
            hero: [],
            editors: [],
            featured: [],
            trending: []
        }
    };

    saveBooksData(defaultData);
    logActivity('Reset to default');
    loadDashboardData();
    loadSectionData('books');
    alert('Data reset to default!');
}

function showChangePasswordModal() {
    const newPassword = prompt('Enter new admin password:');
    if (newPassword && newPassword.length >= 6) {
        alert('Password change feature coming soon!');
        // In a real app, you would update credentials securely
    } else if (newPassword) {
        alert('Password must be at least 6 characters long!');
    }
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('bookModal');
    if (event.target === modal) {
        closeBookModal();
    }
};
