const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { check, validationResult } = require('express-validator');

/**
 * A utility function to wrap async route handlers and catch errors.
 * This avoids repetitive try-catch blocks in each async function.
 * @param {Function} fn - The asynchronous function to execute.
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

// --- SIGNUP ROUTES ---

// GET /signup - Render the signup form
router.get('/signup', (req, res) => {
    res.render('users/signup');
});

// POST /signup - Handle new user registration
router.post(
    '/signup',
    // IMPROVEMENT: Use express-validator for robust and declarative validation.
    [
        check('username', 'Username is required and must be at least 3 characters.').isLength({ min: 3 }).trim().escape(),
        check('email', 'Please include a valid email.').isEmail().normalizeEmail(),
        check('password', 'Password must be at least 6 characters.').isLength({ min: 6 }),
        check('role', 'Please select a role.').isIn(['consumer', 'farmer']),
        check('agreeTerms', 'You must agree to the terms and conditions.').equals('on')
    ],
    catchAsync(async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // If there are validation errors, flash them and re-render.
            errors.array().forEach(error => req.flash('error', error.msg));
            return res.redirect('/signup');
        }

        try {
            const { username, email, role, password } = req.body;
            const user = new User({ username, email, role });
            const registeredUser = await User.register(user, password);

            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash('success', 'Welcome to FarmFresh!');
                res.redirect(`/dashboard/${registeredUser.role}`);
            });
        } catch (e) {
            req.flash('error', e.message);
            res.redirect('/signup');
        }
    })
);


// --- LOGIN ROUTES ---

// GET /login - Render the login form
router.get('/login', (req, res) => {
    res.render('users/login');
});

// POST /login - Handle user login
router.post(
    '/login',
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login',
        keepSessionInfo: true, // Recommended for preserving session data on failure
    }),
    (req, res) => {
        // Redirect to the originally intended page or the user's dashboard.
        const redirectUrl = req.session.returnTo || `/dashboard/${req.user.role}`;
        delete req.session.returnTo;
        req.flash('success', 'Welcome back!');
        res.redirect(redirectUrl);
    }
);


// --- LOGOUT ROUTE ---

// POST /logout - Handle user logout
// Note: Using POST for logout is a good security practice to prevent CSRF.
router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have been successfully logged out.');
        res.redirect('/');
    });
});

module.exports = router;