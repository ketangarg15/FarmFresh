const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders');
const { isLoggedIn } = require('../middleware');

router.get('/', isLoggedIn, orderController.index);
router.post('/', isLoggedIn, orderController.placeOrder);
router.get('/:id', isLoggedIn, orderController.showOrder);

module.exports = router;