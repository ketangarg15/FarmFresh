const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { check, validationResult } = require('express-validator');

const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// GET /current-user - Check if user is authenticated and get details
router.get('/current-user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: { _id: req.user._id, username: req.user.username, email: req.user.email, role: req.user.role, name: req.user.name || req.user.username } });
    } else {
        res.json({ user: null });
    }
});

// POST /signup - Handle new user registration (JSON API)
router.post(
    '/signup',
    [
        check('username', 'Username is required and must be at least 3 characters.').isLength({ min: 3 }).trim().escape(),
        check('email', 'Please include a valid email.').isEmail().normalizeEmail(),
        check('password', 'Password must be at least 6 characters.').isLength({ min: 6 }),
        check('role', 'Please select a role.').isIn(['consumer', 'farmer', 'delivery_partner']),
        check('name', 'Name is required.').notEmpty().trim().escape()
    ],
    catchAsync(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, message: errors.array().map(e => e.msg).join('. ') });
        }

        try {
            const { username, email, role, password, name } = req.body;
            const user = new User({ username, email, role, name });
            const registeredUser = await User.register(user, password);

            req.login(registeredUser, (err) => {
                if (err) return next(err);
                res.status(201).json({
                    success: true,
                    user: { _id: registeredUser._id, username: registeredUser.username, email: registeredUser.email, role: registeredUser.role, name: registeredUser.name }
                });
            });
        } catch (e) {
            res.status(400).json({ success: false, message: e.message });
        }
    })
);

// POST /login - Handle user login (JSON API)
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(400).json({ success: false, message: info && info.message ? info.message : 'Invalid username or password' });
        }
        req.login(user, (err) => {
            if (err) return next(err);
            res.json({
                success: true,
                user: { _id: user._id, username: user.username, email: user.email, role: user.role, name: user.name || user.username }
            });
        });
    })(req, res, next);
});

// POST /logout - Handle user logout (JSON API)
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: err.message });
        }
        res.json({ success: true });
    });
});

module.exports = router;