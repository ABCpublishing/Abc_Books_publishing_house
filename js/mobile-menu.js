// ===== Mobile Navigation Logic =====
function toggleMobileMenu() {
    console.log('🍔 toggleMobileMenu called');
    const sidebar = document.getElementById('mobileNavSidebar');
    const overlay = document.getElementById('mobileNavOverlay');
    const body = document.body;

    console.log('Sidebar element:', sidebar);
    console.log('Overlay element:', overlay);

    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');

        // Prevent body scrolling when menu is open
        if (sidebar.classList.contains('active')) {
            body.style.overflow = 'hidden';
            console.log('✅ Mobile menu OPENED');
        } else {
            body.style.overflow = '';
            console.log('✅ Mobile menu CLOSED');
        }
    } else {
        console.error('❌ Mobile menu elements not found!', {
            sidebar: !!sidebar,
            overlay: !!overlay,
            sidebarId: 'mobileNavSidebar',
            overlayId: 'mobileNavOverlay'
        });
    }
}

function toggleMobileSubmenu(element) {
    const submenu = element.nextElementSibling;
    const parentLi = element.parentElement;
    const icon = element.querySelector('.fa-chevron-down');

    if (submenu) {
        submenu.classList.toggle('active');

        // Rotate icon
        if (submenu.classList.contains('active')) {
            if (icon) icon.style.transform = 'rotate(180deg)';
        } else {
            if (icon) icon.style.transform = 'rotate(0deg)';
        }
    }
}

// Close mobile menu when clicking a link
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Mobile menu JS loaded successfully');

    const mobileLinks = document.querySelectorAll('.mobile-nav-link:not([onclick])');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Only close if it's not a submenu toggle
            const sidebar = document.getElementById('mobileNavSidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });

    // Also add touch event support for the hamburger button
    const menuBtn = document.querySelector('.mobile-menu-btn');
    if (menuBtn) {
        console.log('✅ Mobile menu button found, adding touch listener');
        menuBtn.addEventListener('touchstart', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        }, { passive: false });

        menuBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });
    } else {
        console.warn('Mobile menu button (.mobile-menu-btn) not found on this page.');
    }
});
