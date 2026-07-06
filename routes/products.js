const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');
const Product = require("../models/product");
const Review = require("../models/review");
const { isLoggedIn, isFarmer, isProductAuthor } = require('../middleware');
const { upload } = require('../config/multer-cloudinary');

// View all products
router.get('/', productController.index);

// Create product (with file upload)
router.post('/', isLoggedIn, isFarmer, upload.single('image'), productController.createProduct);

// Show one product
router.get('/:id', productController.showProduct);

// Update (with file upload and authorization)
router.put('/:id', isLoggedIn, isFarmer, isProductAuthor, upload.single('image'), productController.updateProduct);

// Delete (protected by authorization)
router.delete('/:id', isLoggedIn, isFarmer, isProductAuthor, productController.deleteProduct);

router.post("/:id/reviews", isLoggedIn, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const review = new Review({
      rating: req.body.review.rating,
      comment: req.body.review.text || req.body.review.comment
    });
    review.author = req.user._id;
    await review.save();

    product.reviews.push(review);
    await product.save();

    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
});

module.exports = router;