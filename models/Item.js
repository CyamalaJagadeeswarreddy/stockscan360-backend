const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    barcode: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    category: String,
    quantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        default: 0.0
    },
    reorder: {
        type: Number,
        default: 5
    },
    // --- NEW FIELD: Links item to a User ---
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Item', itemSchema);
