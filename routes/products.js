const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');
const { isLoggedIn, isFarmer, isProductAuthor } = require('../middleware');
const { upload } = require('../config/multer-cloudinary');

// View all products
router.get('/', productController.index);

// New product form
router.get('/new', isLoggedIn, isFarmer, productController.renderNewForm);

// Create product (with file upload)
router.post('/', isLoggedIn, isFarmer, upload.single('image'), productController.createProduct);

// Show one product
router.get('/:id', productController.showProduct);

// Edit form (protected by authorization)
router.get('/:id/edit', isLoggedIn, isFarmer, isProductAuthor, productController.renderEditForm);

// Update (with file upload and authorization)
router.put('/:id', isLoggedIn, isFarmer, isProductAuthor, upload.single('image'), productController.updateProduct);

// Delete (protected by authorization)
router.delete('/:id', isLoggedIn, isFarmer, isProductAuthor, productController.deleteProduct);

module.exports = router;