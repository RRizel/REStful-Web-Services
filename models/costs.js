//Cost Schema
/**
 * Mongoose schema for cost items.
 * Defines the structure and constraints for expense documents stored in the database.
 *
 * Each cost item is linked to a user and contains:
 * @typedef {Object} costSchema
 * @property {string} description - A short description of the expense.
 * @property {string} category - The category of the expense. Must be one of: 'food', 'health', 'housing', 'sport', 'education'.
 * @property {string} userid - The ID of the user associated with this expense.
 * @property {number} sum - The total amount of the expense.
 * @property {Date} date - The date the expense was recorded. Defaults to the current date.
 */

const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const costsSchema = new Schema({
    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: ['food', 'health', 'housing', 'sport', 'education'],
        required: true
    },

    userid: {
        type: String,
        required: true
    },

    sum: {
        type: Number,
        required: true
    },

    Date: {
        type: Date,
        default: Date.now
    },
});

const cost = mongoose.model("cost", costsSchema);

module.exports = cost;
