const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveries');
const { isLoggedIn } = require('../middleware');

router.get('/partners', isLoggedIn, deliveryController.listPartners);
router.post('/:id/assign', isLoggedIn, deliveryController.assignPartner);
router.get('/', isLoggedIn, deliveryController.index);
router.get('/:id', isLoggedIn, deliveryController.show);
router.put('/:id', isLoggedIn, deliveryController.update);

module.exports = router;