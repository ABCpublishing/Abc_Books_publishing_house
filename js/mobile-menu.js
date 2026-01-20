// ===== Mobile Navigation Logic =====
function toggleMobileMenu() {
    const sidebar = document.getElementById('mobileNavSidebar');
    const overlay = document.getElementById('mobileNavOverlay');
    const body = document.body;

    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');

        // Prevent body scrolling when menu is open
        if (sidebar.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }
}

function toggleMobileSubmenu(element) {
    // Prevent default anchor behavior
    if (event) event.preventDefault();

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

// Close mobile menu when clicking a link (optional, improves UX)
document.addEventListener('DOMContentLoaded', () => {
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
});
