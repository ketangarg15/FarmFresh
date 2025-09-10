const Product = require('../models/product');
const { cloudinary } = require('../config/multer-cloudinary');

module.exports.index = async (req, res) => {
    const products = await Product.find({}).populate('farmer');
    res.render('products/index', { products });
};

module.exports.renderNewForm = (req, res) => {
    res.render('products/new');
};

module.exports.createProduct = async (req, res) => {
    const product = new Product(req.body.product);
    // Handle the uploaded file from Multer/Cloudinary
    if (!req.file) {
        req.flash('error', 'Product image is required.');
        return res.redirect('/products/new');
    }
    product.image = { url: req.file.path, filename: req.file.filename };
    product.farmer = req.user._id;
    await product.save();
    req.flash('success', 'Product created successfully!');
    res.redirect(`/products/${product._id}`);
};

module.exports.showProduct = async (req, res) => {
    const product = await Product.findById(req.params.id).populate('farmer');
    if (!product) {
        req.flash('error', 'Cannot find that product');
        return res.redirect('/products');
    }
    res.render('products/show', { product });
};

module.exports.renderEditForm = async (req, res) => {
    // isProductAuthor middleware already finds and verifies the product
    const product = await Product.findById(req.params.id);
    res.render('products/edit', { product });
};

module.exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product });

    // If a new image is uploaded, update it and delete the old one
    if (req.file) {
        if (product.image && product.image.filename) {
            await cloudinary.uploader.destroy(product.image.filename);
        }
        product.image = { url: req.file.path, filename: req.file.filename };
        await product.save();
    }
    
    req.flash('success', 'Product updated successfully!');
    res.redirect(`/products/${product._id}`);
};

module.exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    // Delete the image from Cloudinary before deleting the product from DB
    if (product.image && product.image.filename) {
        await cloudinary.uploader.destroy(product.image.filename);
    }
    await Product.findByIdAndDelete(id);
    req.flash('success', 'Product deleted successfully.');
    res.redirect('/products');
};