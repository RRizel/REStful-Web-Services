const express = require('express');
const router = express.Router();
const user = require('../models/users');
const cost = require('../models/costs');

//Get user details by id
/**
 * @route GET /api/users/:id
 * @description Retrieves details of a specific user by ID, including first name, last name, and total costs.
 * @param {string} id - The unique ID of the user to retrieve.
 * @returns {Object} JSON object containing user's first name, last name, ID, and total costs.

 HTTP Response Codes:
 * 200 - Success. User found and total costs calculated.
 * 404 - Not Found. No user with the given ID exists.
 * 400 - Bad Request. An error occurred while processing the request (e.g., database error).
 */
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const userDoc = await user.findOne({ id: id });
        if (!userDoc) {
            return res.status(404).json({ error: 'User not found' });
        }

        const costs = await cost.find({ userid: id });

        const total = costs.reduce((sum, item) => sum + item.sum, 0);

        res.json({
            id: userDoc.id,
            first_name: userDoc.first_name,
            last_name: userDoc.last_name,
            total: total
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get developers team
/**
 * Returns information about the development team.
 * @route GET /api/about

 *  HTTP Response Codes:
 * @returns {Array<Object>} 200 - Array of team members with fields: first_name, last_name.
 * @returns {Object} 500 -  Failed to load team data.
 */
router.get('/about', async (req, res) => {
    try {
        const developers = [
                    { first_name: 'Roy', last_name: 'Rizel' },
                    { first_name: 'Stav', last_name: 'Sivilya' }
                ];
        res.status(200).json(developers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load team data.' });
    }
});

module.exports = router;
