const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const User = require('../models/user');

// Homepage Route
router.get('/', async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            return res.redirect(`/dashboard/${req.user.role}`);
        }
        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('farmer', 'name');
            
        res.render('home', { products, pageTitle: 'Welcome to FarmFresh' });
    } catch (err) {
        next(err); // Pass errors to the main error handler
    }
});

// About Page Route
router.get('/about', (req, res) => {
    res.render('about', { pageTitle: 'About Us' });
});

// Find Farmers Page Route
router.get('/farmers', async (req, res, next) => {
    try {
        const farmers = await User.find({ role: 'farmer' });
        res.render('farmers', { farmers, pageTitle: 'Meet Our Farmers' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;