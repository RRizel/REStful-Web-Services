const express = require('express');
const router = express.Router();
const cost = require('../models/costs');

//Add cost
/**
 * @route POST /add
 * @description Adds a new cost item to the database.
 * @body {string} description - A brief description of the expense.
 * @body {string} category - The category of the expense (e.g., food, health, housing, sport, education).
 * @body {string} userid - The ID of the user associated with the expense.
 * @body {number} sum - The monetary value of the expense. Must be a positive number.
 * @body {Date} [date] - (Optional) The date of the expense. Defaults to current server date if not provided.

 *   HTTP Response Codes:
 * @returns {Object} 201 - Created cost item.
 * @returns {Object} 400 - Error object due to invalid input (missing fields, invalid category or date).
 * @returns {Object} 404 - User not found.
 * @returns {Object} 500 - Server error.
 */
router.post('/add', async (req, res) => {
    try {
        const { description, category, userid, sum, date } = req.body;

        if (!description || !category || !userid || sum === undefined) {
            return res.status(400).json({ error: 'Missing required fields: description, category, userid, or sum.' });
        }

        const allowedCategories = ['food', 'health', 'housing', 'sport', 'education'];
        if (!allowedCategories.includes(category)) {
            return res.status(400).json({ error: `Invalid category. Allowed categories are: ${allowedCategories.join(', ')}` });
        }

        const cost = await cost.create({
            description,
            category,
            userid,
            sum,
            date: date || new Date()
        });

        res.status(201).json(cost);

    } catch (error) {
        console.error('Server error while adding cost:', error); // optional logging
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//Get a monthly report by user id
/**
 * @route GET /api/report
 * @description Retrieves a monthly cost report for a specific user.
 * @queryparam {string} id - The ID of the user for whom the report is requested.
 * @queryparam {number} year - The year for the report (e.g., 2025).
 * @queryparam {number} month - The month for the report (1–12).

 * HTTP Response Codes:
 * @returns {Object} 200 - JSON object representing the monthly report.
 * @returns {string} 200.userid - The user ID.
 * @returns {number} 200.year - The requested year.
 * @returns {number} 200.month - The requested month.
 * @returns {Array} 200.costs - An array of category objects with expense details.
 *
 * @returns {Object} 400 - If required parameters are missing or invalid.
 * @returns {Object} 500 - If an internal server error occurs.
 */
router.get('/report', async (req, res) => {
    try {
        const { id, year, month } = req.query;

        if (!id || !year || !month) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        const startDate = new Date(yearNum, monthNum - 1, 1);
        const endDate = new Date(yearNum, monthNum, 1);

        const costs = await cost.find({
            userid: id,
            Date: { $gte: startDate, $lt: endDate }
        });

        const grouped = {
            food: [],
            health: [],
            housing: [],
            sport: [],
            education: []
        };

        costs.forEach(cost => {
            const category = cost.category?.toLowerCase();
            if (grouped[category]) {
                grouped[category].push({
                    sum: cost.sum,
                    description: cost.description,
                    day: new Date(cost.Date).getUTCDate()
                });
            }
        });

        res.status(200).json({
            userid: id,
            year: yearNum,
            month: monthNum,
            costs: grouped
        });

    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;

