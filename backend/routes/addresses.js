const express = require('express');
const { authenticate } = require('../middleware/security');
const router = express.Router();

/**
 * @route   GET /api/addresses
 * @desc    Get all saved addresses for current user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId;

        const addresses = await db('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC', [userId]);
        res.json({ addresses });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
});

/**
 * @route   POST /api/addresses
 * @desc    Add a new address
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId;
        const { type, first_name, last_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;

        // If this is the first address or set as default, unset other defaults
        if (is_default) {
            await db('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
        }

        const result = await db(`
            INSERT INTO addresses (user_id, type, first_name, last_name, phone, address_line1, address_line2, city, state, pincode, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `, [userId, type || 'Home', first_name, last_name, phone, address_line1, address_line2, city, state, pincode, is_default || false]);

        res.status(201).json({ address: result[0], message: 'Address added successfully' });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ error: 'Failed to add address' });
    }
});

/**
 * @route   PATCH /api/addresses/:id
 * @desc    Update an address
 * @access  Private
 */
router.patch('/:id', authenticate, async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId;
        const { id } = req.params;
        const { type, first_name, last_name, phone, address_line1, address_line2, city, state, pincode, is_default } = req.body;

        // Verify ownership
        const current = await db('SELECT * FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
        if (current.length === 0) return res.status(404).json({ error: 'Address not found' });

        if (is_default) {
            await db('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
        }

        const result = await db(`
            UPDATE addresses SET
                type = COALESCE($1, type),
                first_name = COALESCE($2, first_name),
                last_name = COALESCE($3, last_name),
                phone = COALESCE($4, phone),
                address_line1 = COALESCE($5, address_line1),
                address_line2 = COALESCE($6, address_line2),
                city = COALESCE($7, city),
                state = COALESCE($8, state),
                pincode = COALESCE($9, pincode),
                is_default = COALESCE($10, is_default),
                updated_at = NOW()
            WHERE id = $11 AND user_id = $12
            RETURNING *
        `, [type, first_name, last_name, phone, address_line1, address_line2, city, state, pincode, is_default, id, userId]);

        res.json({ address: result[0], message: 'Address updated successfully' });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ error: 'Failed to update address' });
    }
});

/**
 * @route   DELETE /api/addresses/:id
 * @desc    Delete an address
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const db = req.sql;
        const userId = req.userId;
        const { id } = req.params;

        const result = await db('DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
        if (result.length === 0) return res.status(404).json({ error: 'Address not found' });

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ error: 'Failed to delete address' });
    }
});

module.exports = router;
