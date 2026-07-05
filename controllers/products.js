const Product = require('../models/product');
const { cloudinary } = require('../config/multer-cloudinary');

module.exports.index = async (req, res) => {
    try {
        const products = await Product.find({}).populate('farmer').populate('reviews');
        const productsWithRatings = products.map(p => {
            const ratings = p.reviews.map(r => r.rating);
            const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : 0;
            return { ...p.toObject(), averageRating: avg.toFixed(1) };
        });
        res.json(productsWithRatings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.createProduct = async (req, res) => {
    try {
        // Support both nested object format (product[name]) and direct form-data format
        const productData = req.body.product ? 
            (typeof req.body.product === 'string' ? JSON.parse(req.body.product) : req.body.product) : 
            req.body;

        const product = new Product(productData);
        if (!req.file) {
            return res.status(400).json({ error: 'Product image is required.' });
        }
        product.image = { url: req.file.path, filename: req.file.filename };
        product.farmer = req.user._id;
        await product.save();
        res.status(201).json({ success: true, product });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.showProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: "reviews",
                populate: { path: "author", select: "username" }
            })
            .populate('farmer');

        if (!product) {
            return res.status(404).json({ error: 'Cannot find that product' });
        }

        const ratings = product.reviews.map(r => r.rating);
        const averageRating = ratings.length
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
            : 0;

        res.json({ product, averageRating });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong fetching the product' });
    }
};

module.exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productData = req.body.product ? 
            (typeof req.body.product === 'string' ? JSON.parse(req.body.product) : req.body.product) : 
            req.body;

        const product = await Product.findByIdAndUpdate(id, { ...productData }, { new: true });

        if (req.file) {
            if (product.image && product.image.filename) {
                await cloudinary.uploader.destroy(product.image.filename);
            }
            product.image = { url: req.file.path, filename: req.file.filename };
            await product.save();
        }
        
        res.json({ success: true, product });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (product.image && product.image.filename) {
            await cloudinary.uploader.destroy(product.image.filename);
        }
        await Product.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};