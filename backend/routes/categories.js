// ===== Categories Routes =====
const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/security');

// Get all categories (organized by language)
router.get('/', async (req, res) => {
    try {
        const db = req.sql;

        // Get all categories
        const categories = await db(
            'SELECT * FROM categories WHERE visible = true ORDER BY is_language DESC, display_order ASC'
        );

        // Organize into language -> subcategories structure
        const languages = categories.filter(c => c.is_language);
        const subcategories = categories.filter(c => !c.is_language);

        const organized = languages.map(lang => ({
            ...lang,
            subcategories: subcategories.filter(sub => sub.parent_id === lang.id)
        }));

        res.json({
            categories: organized,
            all: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

// Get languages only (main categories)
router.get('/languages', async (req, res) => {
    try {
        const db = req.sql;

        const languages = await db(
            'SELECT * FROM categories WHERE is_language = true AND visible = true ORDER BY display_order ASC'
        );

        res.json({ languages });
    } catch (error) {
        console.error('Get languages error:', error);
        res.status(500).json({ error: 'Failed to get languages' });
    }
});

// Get subcategories for a specific language
router.get('/language/:languageSlug', async (req, res) => {
    try {
        const db = req.sql;
        const { languageSlug } = req.params;

        // Get language category
        const languages = await db(
            'SELECT * FROM categories WHERE LOWER(slug) = LOWER($1) AND is_language = true',
            [languageSlug]
        );

        if (languages.length === 0) {
            return res.status(404).json({ error: 'Language not found' });
        }

        const language = languages[0];

        // Get subcategories
        const subcategories = await db(
            'SELECT * FROM categories WHERE parent_id = $1 AND visible = true ORDER BY display_order ASC',
            [language.id]
        );

        res.json({
            language,
            subcategories
        });
    } catch (error) {
        console.error('Get language subcategories error:', error);
        res.status(500).json({ error: 'Failed to get subcategories' });
    }
});

// Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;

        const categories = await db(`
            SELECT c.*, p.name as parent_name, p.slug as parent_slug
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            WHERE c.id = $1
        `, [id]);

        if (categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({ category: categories[0] });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ error: 'Failed to get category' });
    }
});

// Add new category (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { name, slug, icon, parent_id, is_language, display_order, visible } = req.body;

        // Create slug from name if not provided
        const categorySlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const result = await db(`
            INSERT INTO categories (name, slug, icon, parent_id, is_language, display_order, visible)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            name, categorySlug, icon || 'fa-book', parent_id || null, 
            is_language || false, display_order || 0, visible !== false
        ]);

        res.status(201).json({
            category: result[0],
            message: 'Category added successfully'
        });
    } catch (error) {
        console.error('Add category error:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Category slug already exists' });
        }
        res.status(500).json({ error: 'Failed to add category' });
    }
});

// Update category (admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;
        const { name, slug, icon, parent_id, is_language, display_order, visible } = req.body;

        const result = await db(`
            UPDATE categories SET
                name = $1, slug = $2, icon = $3, parent_id = $4, is_language = $5, 
                display_order = $6, visible = $7, updated_at = NOW()
            WHERE id = $8
            RETURNING *
        `, [
            name, slug, icon || 'fa-book', parent_id || null, is_language || false,
            display_order || 0, visible !== false, id
        ]);

        if (result.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json({
            category: result[0],
            message: 'Category updated successfully'
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// Delete category (admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
    try {
        const db = req.sql;
        const { id } = req.params;

        // Check if it's a language category and has subcategories
        const category = await db('SELECT * FROM categories WHERE id = $1', [id]);
        if (category.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }

        if (category[0].is_language) {
            const subcategories = await db('SELECT COUNT(*) as count FROM categories WHERE parent_id = $1', [id]);
            if (parseInt(subcategories[0].count) > 0) {
                return res.status(400).json({
                    error: 'Cannot delete language category with subcategories. Delete subcategories first.'
                });
            }
        }

        await db('DELETE FROM categories WHERE id = $1', [id]);

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// Get books by language
router.get('/books/language/:language', async (req, res) => {
    try {
        const db = req.sql;
        const { language } = req.params;
        const { limit = 50 } = req.query;

        const parsedLimit = parseInt(limit) || 50;
        const books = await db(`
            SELECT * FROM books WHERE LOWER(language) = LOWER($1) ORDER BY created_at DESC LIMIT $2
        `, [language, parsedLimit]);

        res.json({ books, count: books.length });
    } catch (error) {
        console.error('Get books by language error:', error);
        res.status(500).json({ error: 'Failed to get books' });
    }
});

// Get books by language and subcategory
router.get('/books/:language/:subcategory', async (req, res) => {
    try {
        const db = req.sql;
        const { language, subcategory } = req.params;
        const { limit = 50 } = req.query;

        const parsedLimit = parseInt(limit) || 50;
        const books = await db(`
            SELECT * FROM books WHERE LOWER(language) = LOWER($1) AND LOWER(subcategory) = LOWER($2) ORDER BY created_at DESC LIMIT $3
        `, [language, subcategory, parsedLimit]);

        res.json({ books, count: books.length });
    } catch (error) {
        console.error('Get books by language and subcategory error:', error);
        res.status(500).json({ error: 'Failed to get books' });
    }
});

module.exports = router;
