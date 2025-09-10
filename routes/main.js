const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');

// Homepage Route
router.get('/', async (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect(`/dashboard/${req.user.role}`);
    }
    const products = await Product.find({}).sort({ createdAt: -1 }).limit(8);
    res.render('home', { products, pageTitle: 'Welcome to FarmFresh' });
});

// About Page Route
router.get('/about', (req, res) => {
    res.render('about', { pageTitle: 'About Us' });
});

// Find Farmers Page Route
router.get('/farmers', async (req, res) => {
    const farmers = await User.find({ role: 'farmer' });
    res.render('farmers', { farmers, pageTitle: 'Meet Our Farmers' });
});

module.exports = router;