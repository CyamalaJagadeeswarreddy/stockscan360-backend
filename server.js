const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// --- IMPORT MODELS & MIDDLEWARE ---
// Make sure you have Item.js inside the 'models' folder
const Item = require('./models/Item'); 
const User = require('./models/User');
const auth = require('./middleware/auth');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json()); 

// --- DATABASE CONNECTION ---
// This now uses the MONGO_URI from your Render Environment Variables (Secure!)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const JWT_SECRET = 'stockscan360_secret_key_123';

// ==========================================
// AUTH ROUTES (Public - No Login Required)
// ==========================================

// 1. REGISTER USER
app.post('/api/auth/register', async (req, res) => {
    const { name, phone, username, password } = req.body;

    try {
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({ 
            name, 
            phone, 
            username, 
            password: hashedPassword 
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// 2. LOGIN USER
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            token, 
            user: { name: user.name, username: user.username } 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// INVENTORY ROUTES (Protected - Login Required)
// ==========================================

// 1. GET all items
app.get('/api/inventory', auth, async (req, res) => {
    try {
        const items = await Item.find({ userId: req.user.id });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. ADD a new item
app.post('/api/inventory', auth, async (req, res) => {
    try {
        const item = new Item({
            barcode: req.body.barcode,
            name: req.body.name,
            category: req.body.category,
            quantity: req.body.quantity,
            price: req.body.price,
            reorder: req.body.reorder,
            userId: req.user.id 
        });

        const newItem = await item.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. UPDATE an item
app.put('/api/inventory/:id', auth, async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });

        if (!item) {
            return res.status(404).json({ message: 'Item not found or access denied' });
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        
        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. DELETE an item (Added back so your Delete button works!)
app.delete('/api/inventory/:id', auth, async (req, res) => {
    try {
        const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });
        
        if (!item) {
            return res.status(404).json({ message: 'Item not found or access denied' });
        }

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
