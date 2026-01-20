// Category Management Functions
// This file handles all category-related operations in the admin panel

// Initialize default categories if none exist
function initializeCategories() {
    if (!localStorage.getItem('categories')) {
        const defaultCategories = [
            // Dropdown Menu Categories
            {
                id: 'cat-1',
                name: 'English Books',
                type: 'dropdown',
                icon: 'fa-book',
                subcategories: ['Fiction', 'Non-Fiction', "Children's Books", 'Educational', 'Self-Help'],
                visible: true
            },
            {
                id: 'cat-2',
                name: 'Arabic Books',
                type: 'dropdown',
                icon: 'fa-book',
                subcategories: ['Islamic Literature', 'Quran & Tafsir', 'Hadith Collections', 'Arabic Language', 'Islamic History'],
                visible: true
            },
            {
                id: 'cat-3',
                name: 'Urdu Books',
                type: 'dropdown',
                icon: 'fa-book',
                subcategories: ['Islamic Books', 'Poetry (Shayari)', 'Urdu Literature', 'Religious Studies', 'Urdu Novels'],
                visible: true
            },
            // Quick Strip Categories
            {
                id: 'cat-4',
                name: 'Best Seller',
                type: 'strip',
                icon: 'fa-trophy',
                visible: true
            },
            {
                id: 'cat-5',
                name: 'Award Winners',
                type: 'strip',
                icon: 'fa-award',
                visible: true
            },
            {
                id: 'cat-6',
                name: 'Box Sets',
                type: 'strip',
                icon: 'fa-boxes-stacked',
                visible: true
            },
            // Showcase Categories
            {
                id: 'cat-7',
                name: 'Fiction',
                type: 'showcase',
                icon: 'fa-book',
                bookCount: 5000,
                visible: true
            },
            {
                id: 'cat-8',
                name: 'Non-Fiction',
                type: 'showcase',
                icon: 'fa-lightbulb',
                bookCount: 3500,
                visible: true
            },
            {
                id: 'cat-9',
                name: 'Academic',
                type: 'showcase',
                icon: 'fa-graduation-cap',
                bookCount: 8000,
                visible: true
            }
        ];
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
    loadCategoriesTable();
}

// Show Add Category Modal
function showAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = 'Add New Category';
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryModal').classList.add('active');

    // Show/hide fields based on type
    document.getElementById('categoryType').addEventListener('change', handleCategoryTypeChange);
}

// Handle category type change
function handleCategoryTypeChange() {
    const type = document.getElementById('categoryType').value;
    const subcategoriesGroup = document.getElementById('subcategoriesGroup');
    const bookCountGroup = document.getElementById('bookCountGroup');

    if (type === 'dropdown') {
        subcategoriesGroup.style.display = 'block';
        bookCountGroup.style.display = 'none';
    } else if (type === 'showcase') {
        subcategoriesGroup.style.display = 'none';
        bookCountGroup.style.display = 'block';
    } else {
        subcategoriesGroup.style.display = 'none';
        bookCountGroup.style.display = 'none';
    }
}

// Close Category Modal
function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
    document.getElementById('iconPickerDropdown').style.display = 'none';
}

// Toggle Icon Picker
function toggleIconPicker() {
    const dropdown = document.getElementById('iconPickerDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Icon Picker Selection
document.addEventListener('DOMContentLoaded', function () {
    const iconOptions = document.querySelectorAll('.icon-option');
    iconOptions.forEach(option => {
        option.addEventListener('click', function () {
            // Remove previous selection
            iconOptions.forEach(opt => opt.classList.remove('selected'));

            // Add selection to clicked icon
            this.classList.add('selected');

            // Set the icon value
            const iconClass = this.getAttribute('data-icon');
            document.getElementById('categoryIcon').value = iconClass;

            // Hide dropdown
            document.getElementById('iconPickerDropdown').style.display = 'none';
        });
    });
});

// Save Category
document.addEventListener('DOMContentLoaded', function () {
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function (e) {
            e.preventDefault();
            saveCategory();
        });
    }
});

function saveCategory() {
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value.trim();
    const type = document.getElementById('categoryType').value;
    const icon = document.getElementById('categoryIcon').value;
    const subcategoriesText = document.getElementById('categorySubcategories').value.trim();
    const bookCount = document.getElementById('categoryBookCount').value;
    const visible = document.getElementById('categoryVisible').checked;

    if (!name || !type || !icon) {
        alert('Please fill in all required fields');
        return;
    }

    const category = {
        id: id || 'cat-' + Date.now(),
        name,
        type,
        icon,
        visible
    };

    // Add type-specific fields
    if (type === 'dropdown' && subcategoriesText) {
        category.subcategories = subcategoriesText.split('\n').filter(s => s.trim() !== '');
    }

    if (type === 'showcase' && bookCount) {
        category.bookCount = parseInt(bookCount);
    }

    let categories = JSON.parse(localStorage.getItem('categories') || '[]');

    if (id) {
        // Update existing category
        const index = categories.findIndex(cat => cat.id === id);
        if (index !== -1) {
            categories[index] = category;
        }
    } else {
        // Add new category
        categories.push(category);
    }

    localStorage.setItem('categories', JSON.stringify(categories));
    closeCategoryModal();
    loadCategoriesTable();
    alert('Category saved successfully!');
}

// Load Categories Table
function loadCategoriesTable() {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const tbody = document.getElementById('categoriesTableBody');

    if (!tbody) return;

    if (categories.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-data">No categories added yet</td></tr>';
        return;
    }

    tbody.innerHTML = categories.map(cat => `
        <tr>
            <td><i class="fas ${cat.icon}" style="font-size: 20px; color: var(--primary-color);"></i></td>
            <td><strong>${cat.name}</strong></td>
            <td><span class="badge">${formatCategoryType(cat.type)}</span></td>
            <td>${getSubcategoriesDisplay(cat)}</td>
            <td>
                <label class="checkbox-label">
                    <input type="checkbox" ${cat.visible ? 'checked' : ''} onchange="toggleCategoryVisibility('${cat.id}')">
                    <span>${cat.visible ? 'Visible' : 'Hidden'}</span>
                </label>
            </td>
            <td>
                <div class="action-icons">
                    <button class="icon-btn edit" onclick="editCategory('${cat.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete" onclick="deleteCategory('${cat.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function formatCategoryType(type) {
    const types = {
        'dropdown': 'Dropdown Menu',
        'strip': 'Quick Strip',
        'showcase': 'Showcase'
    };
    return types[type] || type;
}

function getSubcategoriesDisplay(cat) {
    if (cat.subcategories && cat.subcategories.length > 0) {
        return cat.subcategories.slice(0, 2).join(', ') +
            (cat.subcategories.length > 2 ? '...' : '');
    }
    if (cat.bookCount) {
        return `${cat.bookCount}+ books`;
    }
    return '-';
}

// Edit Category
function editCategory(id) {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const category = categories.find(cat => cat.id === id);

    if (!category) return;

    document.getElementById('categoryModalTitle').textContent = 'Edit Category';
    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryType').value = category.type;
    document.getElementById('categoryIcon').value = category.icon;
    document.getElementById('categoryVisible').checked = category.visible;

    if (category.subcategories) {
        document.getElementById('categorySubcategories').value = category.subcategories.join('\n');
    }

    if (category.bookCount) {
        document.getElementById('categoryBookCount').value = category.bookCount;
    }

    handleCategoryTypeChange();
    document.getElementById('categoryModal').classList.add('active');
}

// Delete Category
function deleteCategory(id) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    let categories = JSON.parse(localStorage.getItem('categories') || '[]');
    categories = categories.filter(cat => cat.id !== id);
    localStorage.setItem('categories', JSON.stringify(categories));
    loadCategoriesTable();
    alert('Category deleted successfully!');
}

// Toggle Category Visibility
function toggleCategoryVisibility(id) {
    let categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const category = categories.find(cat => cat.id === id);

    if (category) {
        category.visible = !category.visible;
        localStorage.setItem('categories', JSON.stringify(categories));
    }
}

// Category Tab Switching
document.addEventListener('DOMContentLoaded', function () {
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const filterType = this.getAttribute('data-tab');
            filterCategoriesByType(filterType);
        });
    });
});

function filterCategoriesByType(type) {
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const filtered = categories.filter(cat => cat.type === type);

    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="no-data">No ${formatCategoryType(type)} categories added yet</td></tr>`;
        return;
    }

    tbody.innerHTML = filtered.map(cat => `
        <tr>
            <td><i class="fas ${cat.icon}" style="font-size: 20px; color: var(--primary-color);"></i></td>
            <td><strong>${cat.name}</strong></td>
            <td><span class="badge">${formatCategoryType(cat.type)}</span></td>
            <td>${getSubcategoriesDisplay(cat)}</td>
            <td>
                <label class="checkbox-label">
                    <input type="checkbox" ${cat.visible ? 'checked' : ''} onchange="toggleCategoryVisibility('${cat.id}')">
                    <span>${cat.visible ? 'Visible' : 'Hidden'}</span>
                </label>
            </td>
            <td>
                <div class="action-icons">
                    <button class="icon-btn edit" onclick="editCategory('${cat.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete" onclick="deleteCategory('${cat.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Initialize categories when the page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCategories);
} else {
    initializeCategories();
}
