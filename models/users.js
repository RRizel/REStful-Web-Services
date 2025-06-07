// User Schema
/**
 * Mongoose schema for user documents.
 * Defines the structure and constraints for user data stored in the database.
 *
 * Each user has:
 * @typedef {Object} userSchema
 * @property {string} id - A unique identifier for the user.
 * @property {string} first_name - The user's first name.
 * @property {string} last_name - The user's last name.
 * @property {Date} birthday - The user's date of birth.
 * @property {string} marital_status - The user's marital status. Must be one of: 'single', 'married', 'divorced', 'widowed'.
 */

const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },

    first_name: {
        type: String,
        required: true
    },

    last_name: {
        type: String,
        required: true
    },

    birthday: {
        type: Date,
        required: true
    },

    marital_status: {
        type: String,
        enum: ['single', 'married', 'divorced', 'widowed'],
        required: true
    }
});

const user = mongoose.model("user", userSchema);

module.exports = user;