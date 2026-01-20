// ===== Order Detail Page JavaScript =====

let currentOrder = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadOrderDetails();
});

// Load order details
function loadOrderDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        window.location.href = 'my-orders.html';
        return;
    }

    // Find order
    const orders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
    currentOrder = orders.find(o => o.orderId === orderId);

    if (!currentOrder) {
        window.location.href = 'my-orders.html';
        return;
    }

    // Update page
    document.title = `Order #${orderId} | ABC Books`;
    document.getElementById('breadcrumbOrderId').textContent = `#${orderId}`;
    document.getElementById('orderIdTitle').textContent = `#${orderId}`;

    // Update status badge
    const status = (currentOrder.status || 'confirmed').toLowerCase();
    const statusBadge = document.getElementById('orderStatusBadge');
    statusBadge.textContent = capitalizeFirst(status);
    statusBadge.className = `status-badge ${status}`;

    // Show cancel button if order can be cancelled
    if (status === 'confirmed' || status === 'processing') {
        document.getElementById('cancelBtn').style.display = 'flex';
    }

    // Load sections
    loadTimeline();
    loadOrderItems();
    loadShippingAddress();
    loadPaymentInfo();
    loadOrderSummary();
}

// Load order timeline
function loadTimeline() {
    const container = document.getElementById('orderTimeline');
    const status = (currentOrder.status || 'confirmed').toLowerCase();

    const steps = [
        { id: 'confirmed', title: 'Order Confirmed', desc: 'Your order has been placed' },
        { id: 'processing', title: 'Processing', desc: 'Preparing your order' },
        { id: 'shipped', title: 'Shipped', desc: 'On the way to you' },
        { id: 'delivered', title: 'Delivered', desc: 'Order completed' }
    ];

    const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);

    let cancelled = status === 'cancelled';

    container.innerHTML = steps.map((step, index) => {
        let stepClass = '';
        if (cancelled) {
            stepClass = index === 0 ? 'completed' : '';
        } else if (index < currentIndex) {
            stepClass = 'completed';
        } else if (index === currentIndex) {
            stepClass = 'current completed';
        }

        const date = index <= currentIndex ? getStepDate(index) : '';

        return `
            <div class="timeline-step ${stepClass}">
                <div class="timeline-dot">
                    <i class="fas fa-check"></i>
                </div>
                <div class="timeline-content">
                    <h4>${step.title}</h4>
                    <p>${date ? date : step.desc}</p>
                </div>
            </div>
        `;
    }).join('');

    // Add cancelled step if order is cancelled
    if (cancelled) {
        container.innerHTML += `
            <div class="timeline-step current">
                <div class="timeline-dot" style="background: #e74c3c;">
                    <i class="fas fa-times" style="display: block;"></i>
                </div>
                <div class="timeline-content">
                    <h4>Order Cancelled</h4>
                    <p>This order has been cancelled</p>
                </div>
            </div>
        `;
    }
}

// Get step date (mock for demo)
function getStepDate(stepIndex) {
    const orderDate = new Date(currentOrder.orderDate);
    const dates = [
        orderDate,
        new Date(orderDate.getTime() + 1 * 24 * 60 * 60 * 1000),
        new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        new Date(orderDate.getTime() + 5 * 24 * 60 * 60 * 1000)
    ];

    return dates[stepIndex].toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Load order items
function loadOrderItems() {
    const container = document.getElementById('orderItems');
    const items = currentOrder.items || [];

    if (items.length === 0) {
        container.innerHTML = '<p style="color: #888;">No items found</p>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="order-item-row">
            <img src="${item.image}" alt="${item.title}"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22150%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22100%22 height=%22150%22/%3E%3C/svg%3E'">
            <div class="order-item-info">
                <h4>${item.title}</h4>
                <p class="author">${item.author || 'Unknown Author'}</p>
                <div class="qty-price">
                    <span class="qty">Qty: ${item.quantity || 1}</span>
                    <span class="price">₹${item.price * (item.quantity || 1)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load shipping address
function loadShippingAddress() {
    const container = document.getElementById('shippingAddress');
    const shipping = currentOrder.shipping || {};

    container.innerHTML = `
        <p class="name">${shipping.firstName || ''} ${shipping.lastName || ''}</p>
        <p>
            ${shipping.address1 || ''}<br>
            ${shipping.address2 ? shipping.address2 + '<br>' : ''}
            ${shipping.city || ''}, ${shipping.state || ''} - ${shipping.pincode || ''}<br>
            ${shipping.country || 'India'}
        </p>
        <p style="margin-top: 10px;">
            <strong>Phone:</strong> ${shipping.phone || 'N/A'}<br>
            <strong>Email:</strong> ${shipping.email || 'N/A'}
        </p>
    `;
}

// Load payment info
function loadPaymentInfo() {
    const container = document.getElementById('paymentInfo');
    const paymentMethod = currentOrder.paymentMethod || 'cod';

    const paymentIcons = {
        cod: 'fas fa-money-bill-wave',
        upi: 'fas fa-mobile-alt',
        card: 'fas fa-credit-card',
        netbanking: 'fas fa-university'
    };

    const paymentNames = {
        cod: 'Cash on Delivery',
        upi: 'UPI Payment',
        card: 'Credit/Debit Card',
        netbanking: 'Net Banking'
    };

    container.innerHTML = `
        <div class="payment-icon">
            <i class="${paymentIcons[paymentMethod] || 'fas fa-wallet'}"></i>
        </div>
        <div class="payment-details">
            <h4>${paymentNames[paymentMethod] || 'Online Payment'}</h4>
            <p>Payment ${currentOrder.status === 'cancelled' ? 'Refunded' : 'Completed'}</p>
        </div>
    `;
}

// Load order summary
function loadOrderSummary() {
    const subtotal = currentOrder.subtotal || currentOrder.total || 0;
    const discount = currentOrder.discount || 0;
    const total = currentOrder.total || 0;

    document.getElementById('summarySubtotal').textContent = `₹${subtotal}`;
    document.getElementById('summaryTotal').textContent = `₹${total}`;

    if (discount > 0) {
        document.getElementById('discountRow').style.display = 'flex';
        document.getElementById('summaryDiscount').textContent = `-₹${discount}`;
    }

    // Shipping
    const shipping = subtotal >= 499 ? 'FREE' : '₹49';
    document.getElementById('summaryShipping').textContent = shipping;
}

// Cancel order
function cancelOrder() {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    // Update order status
    let orders = JSON.parse(localStorage.getItem('abc_orders') || '[]');
    const orderIndex = orders.findIndex(o => o.orderId === currentOrder.orderId);

    if (orderIndex >= 0) {
        orders[orderIndex].status = 'cancelled';
        localStorage.setItem('abc_orders', JSON.stringify(orders));
    }

    // Reload page
    location.reload();
}

// Print order
function printOrder() {
    window.print();
}

// Download invoice
function downloadInvoice() {
    // In a real app, this would generate a PDF
    alert('Invoice download feature will be available soon!');
}

// Helper: Capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
