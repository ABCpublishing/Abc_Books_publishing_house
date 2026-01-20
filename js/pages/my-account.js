// ===== My Account Page JavaScript =====

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('abc_current_user') || 'null');
    if (!user) {
        window.location.href = 'index.html';
        return null;
    }
    return user;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user) return;

    // Update user info
    document.getElementById('userName').textContent = user.name || 'Welcome!';
    document.getElementById('userEmail').textContent = user.email || '';

    // Load dashboard data
    loadDashboardData();
    loadRecentOrders();
    loadWishlistPreview();
    loadProfileData();
    loadAddresses();

    // Initialize navigation
    initializeNav();

    // Initialize forms
    initializeForms();
});

// Initialize navigation
function initializeNav() {
    const navItems = document.querySelectorAll('.account-nav .nav-item[data-section]');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.dataset.section;

            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Show target section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${targetSection}Section`) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// Load dashboard statistics
function loadDashboardData() {
    const orders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
    const wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');
    const cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');

    // Calculate total spent
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('wishlistItems').textContent = wishlist.length;
    document.getElementById('cartItems').textContent = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.getElementById('totalSpent').textContent = `₹${totalSpent}`;
}

// Load recent orders
function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
    const container = document.getElementById('recentOrdersList');
    const allContainer = document.getElementById('allOrdersList');

    if (orders.length === 0) {
        container.innerHTML = '<p class="no-data"><i class="fas fa-box-open"></i> No orders yet</p>';
        allContainer.innerHTML = '<p class="no-data"><i class="fas fa-box-open"></i> No orders yet</p>';
        return;
    }

    // Sort by date (newest first)
    const sortedOrders = orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    // Recent orders (last 3)
    const recentOrders = sortedOrders.slice(0, 3);
    container.innerHTML = recentOrders.map(order => createOrderCard(order)).join('');

    // All orders
    allContainer.innerHTML = sortedOrders.map(order => createOrderCard(order)).join('');
}

// Create order card HTML
function createOrderCard(order) {
    const date = new Date(order.orderDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });

    const itemCount = order.items ? order.items.length : 0;
    const statusClass = (order.status || 'confirmed').toLowerCase();

    return `
        <div class="order-card" onclick="viewOrder('${order.orderId}')">
            <div class="order-info">
                <div class="order-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="order-details">
                    <h4>Order #${order.orderId}</h4>
                    <p>${itemCount} item(s) • ${date}</p>
                </div>
            </div>
            <div class="order-meta">
                <div class="order-total">₹${order.total || 0}</div>
                <span class="order-status ${statusClass}">
                    <i class="fas fa-circle"></i> ${capitalizeFirst(order.status || 'Confirmed')}
                </span>
            </div>
        </div>
    `;
}

// View order details
function viewOrder(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
}

// Load wishlist preview
function loadWishlistPreview() {
    const wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');
    const container = document.getElementById('wishlistGrid');

    if (wishlist.length === 0) {
        container.innerHTML = '<p class="no-data"><i class="fas fa-heart-broken"></i> Your wishlist is empty</p>';
        return;
    }

    // Show first 4 items
    const previewItems = wishlist.slice(0, 4);
    container.innerHTML = previewItems.map(item => `
        <div class="wishlist-item">
            <img src="${item.image}" alt="${item.title}" 
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3C/svg%3E'">
            <div class="wishlist-item-info">
                <h4>${item.title}</h4>
                <p class="price">₹${item.price}</p>
            </div>
            <div class="wishlist-item-actions">
                <button class="btn-add-to-cart" onclick="moveToCart('${item.id}')">
                    <i class="fas fa-cart-plus"></i>
                </button>
                <button class="btn-remove-wishlist" onclick="removeFromWishlist('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Move item from wishlist to cart
function moveToCart(itemId) {
    const wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');
    const item = wishlist.find(i => i.id === itemId);

    if (item) {
        let cart = JSON.parse(localStorage.getItem('abc_cart') || '[]');
        const existingIndex = cart.findIndex(c => c.id === itemId);

        if (existingIndex >= 0) {
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            cart.push({ ...item, quantity: 1 });
        }

        localStorage.setItem('abc_cart', JSON.stringify(cart));
        removeFromWishlist(itemId);
        showNotification('Item moved to cart!', 'success');
        loadDashboardData();
    }
}

// Remove from wishlist
function removeFromWishlist(itemId) {
    let wishlist = JSON.parse(localStorage.getItem('abc_wishlist') || '[]');
    wishlist = wishlist.filter(item => item.id !== itemId);
    localStorage.setItem('abc_wishlist', JSON.stringify(wishlist));
    loadWishlistPreview();
    loadDashboardData();
}

// Load profile data
function loadProfileData() {
    const user = JSON.parse(localStorage.getItem('abc_current_user') || '{}');

    if (user.name) {
        const names = user.name.split(' ');
        document.getElementById('firstName').value = names[0] || '';
        document.getElementById('lastName').value = names.slice(1).join(' ') || '';
    }

    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('dob').value = user.dob || '';

    if (user.gender) {
        const genderRadio = document.querySelector(`input[name="gender"][value="${user.gender}"]`);
        if (genderRadio) genderRadio.checked = true;
    }
}

// Load saved addresses
function loadAddresses() {
    const addresses = JSON.parse(localStorage.getItem('abc_addresses') || '[]');
    const container = document.getElementById('addressesList');

    if (addresses.length === 0) {
        container.innerHTML = '<p class="no-data"><i class="fas fa-map-marker-alt"></i> No saved addresses</p>';
        return;
    }

    container.innerHTML = addresses.map((addr, index) => `
        <div class="address-card ${addr.isDefault ? 'default' : ''}">
            ${addr.isDefault ? '<span class="address-label"><i class="fas fa-check"></i> Default</span>' : ''}
            <span class="address-label"><i class="fas fa-${addr.type === 'home' ? 'home' : 'briefcase'}"></i> ${addr.type || 'Home'}</span>
            <h4>${addr.name}</h4>
            <p>
                ${addr.address1}<br>
                ${addr.address2 ? addr.address2 + '<br>' : ''}
                ${addr.city}, ${addr.state} - ${addr.pincode}<br>
                Phone: ${addr.phone}
            </p>
            <div class="address-actions">
                <button onclick="editAddress(${index})"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="deleteAddress(${index})"><i class="fas fa-trash"></i> Delete</button>
                ${!addr.isDefault ? `<button onclick="setDefaultAddress(${index})"><i class="fas fa-check"></i> Set Default</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Initialize forms
function initializeForms() {
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProfile();
    });

    // Password form
    document.getElementById('passwordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        changePassword();
    });
}

// Save profile
function saveProfile() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const dob = document.getElementById('dob').value;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;

    const user = JSON.parse(localStorage.getItem('abc_current_user') || '{}');
    user.name = `${firstName} ${lastName}`.trim();
    user.email = email;
    user.phone = phone;
    user.dob = dob;
    user.gender = gender;

    localStorage.setItem('abc_current_user', JSON.stringify(user));

    // Update display
    document.getElementById('userName').textContent = user.name || 'Welcome!';
    document.getElementById('userEmail').textContent = user.email || '';

    showNotification('Profile saved successfully!', 'success');
}

// Change password
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }

    // In a real app, verify current password with server
    const user = JSON.parse(localStorage.getItem('abc_current_user') || '{}');
    user.password = newPassword; // Note: Never store plain passwords in production!
    localStorage.setItem('abc_current_user', JSON.stringify(user));

    document.getElementById('passwordForm').reset();
    showNotification('Password changed successfully!', 'success');
}

// Show add address modal
function showAddAddressModal() {
    // For now, just add a sample address
    const address = {
        name: 'Home Address',
        type: 'home',
        address1: 'Sample Street',
        address2: 'Near Main Road',
        city: 'Srinagar',
        state: 'J&K',
        pincode: '190001',
        phone: '+91 9876543210',
        isDefault: false
    };

    let addresses = JSON.parse(localStorage.getItem('abc_addresses') || '[]');
    addresses.push(address);
    localStorage.setItem('abc_addresses', JSON.stringify(addresses));

    loadAddresses();
    showNotification('Address added successfully!', 'success');
}

// Delete address
function deleteAddress(index) {
    if (!confirm('Are you sure you want to delete this address?')) return;

    let addresses = JSON.parse(localStorage.getItem('abc_addresses') || '[]');
    addresses.splice(index, 1);
    localStorage.setItem('abc_addresses', JSON.stringify(addresses));

    loadAddresses();
    showNotification('Address deleted', 'success');
}

// Set default address
function setDefaultAddress(index) {
    let addresses = JSON.parse(localStorage.getItem('abc_addresses') || '[]');
    addresses = addresses.map((addr, i) => ({
        ...addr,
        isDefault: i === index
    }));
    localStorage.setItem('abc_addresses', JSON.stringify(addresses));

    loadAddresses();
    showNotification('Default address updated', 'success');
}

// Logout
function logout() {
    localStorage.removeItem('abc_current_user');
    window.location.href = 'index.html';
}

// Helper: Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #27ae60, #2ecc71)' : 'linear-gradient(135deg, #e74c3c, #c0392b)'};
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
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
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
