// ===== My Orders Page JavaScript =====

let allOrders = [];
let currentFilter = 'all';

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    initializeFilters();
    initializeSearch();
});

// Load orders
function loadOrders() {
    allOrders = JSON.parse(localStorage.getItem('abc_orders') || '[]');

    // Sort by date (newest first)
    allOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    renderOrders();
}

// Render orders
function renderOrders(orders = allOrders) {
    const container = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyState');

    // Apply filter
    let filteredOrders = orders;
    if (currentFilter !== 'all') {
        filteredOrders = orders.filter(order =>
            (order.status || 'confirmed').toLowerCase() === currentFilter
        );
    }

    if (filteredOrders.length === 0) {
        container.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    container.style.display = 'flex';
    emptyState.style.display = 'none';

    container.innerHTML = filteredOrders.map(order => createOrderHTML(order)).join('');
}

// Create order HTML
function createOrderHTML(order) {
    const date = new Date(order.orderDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const items = order.items || [];
    const itemCount = items.length;
    const status = (order.status || 'confirmed').toLowerCase();

    // Create item previews (max 4)
    let itemsPreview = '';
    const displayItems = items.slice(0, 4);
    displayItems.forEach(item => {
        itemsPreview += `
            <div class="item-preview">
                <img src="${item.image}" alt="${item.title}" 
                    onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
            </div>
        `;
    });

    if (items.length > 4) {
        itemsPreview += `
            <div class="item-preview item-count">
                +${items.length - 4} more
            </div>
        `;
    }

    return `
        <div class="order-item">
            <div class="order-header">
                <div class="order-id-info">
                    <div class="order-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="order-id">
                        <h3>Order #${order.orderId}</h3>
                        <p>${itemCount} item(s)</p>
                    </div>
                </div>
                <div class="order-status-price">
                    <div class="order-price">₹${order.total || 0}</div>
                    <span class="status-badge ${status}">
                        ${capitalizeFirst(status)}
                    </span>
                </div>
            </div>
            <div class="order-body">
                <div class="order-items-preview">
                    ${itemsPreview}
                </div>
                <div class="order-footer">
                    <span class="order-date">
                        <i class="fas fa-calendar-alt"></i> Ordered on ${date}
                    </span>
                    <button class="btn-view-order" onclick="viewOrder('${order.orderId}')">
                        View Details <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// View order details
function viewOrder(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
}

// Initialize filters
function initializeFilters() {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update filter
            currentFilter = tab.dataset.filter;
            renderOrders();
        });
    });
}

// Initialize search
function initializeSearch() {
    const searchInput = document.getElementById('orderSearch');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (!query) {
            renderOrders();
            return;
        }

        const filtered = allOrders.filter(order =>
            order.orderId.toLowerCase().includes(query)
        );

        renderOrders(filtered);
    });
}

// Helper: Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
