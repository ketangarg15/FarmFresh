const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');

router.use(isLoggedIn);

router.get('/consumer', (req, res) => {
  res.render('dashboard/consumer', { user: req.user });
});

router.get('/farmer', (req, res) => {
  res.render('dashboard/farmer', { user: req.user });
});

router.get('/admin', (req, res) => {
  res.render('dashboard/admin', { user: req.user });
});

module.exports = router;