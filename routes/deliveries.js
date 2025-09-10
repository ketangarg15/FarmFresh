const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveries');
const { isLoggedIn } = require('../middleware');

router.get('/', isLoggedIn, deliveryController.index);
router.get('/:id', isLoggedIn, deliveryController.show);
router.put('/:id', isLoggedIn, deliveryController.update);

module.exports = router;