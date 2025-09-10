const Product = require('./models/product');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.isFarmer = (req, res, next) => {
    if (req.user.role !== 'farmer') {
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect('/products');
    }
    next();
};

// NEW: Authorization middleware to check product ownership
module.exports.isProductAuthor = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        req.flash('error', 'Cannot find that product.');
        return res.redirect('/products');
    }
    if (!product.farmer.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that.');
        return res.redirect(`/products/${id}`);
    }
    next();
}