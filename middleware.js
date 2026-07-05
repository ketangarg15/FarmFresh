const Product = require('./models/product');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'You must be signed in first!' });
    }
    next();
};

module.exports.isFarmer = (req, res, next) => {
    if (!req.user || req.user.role !== 'farmer') {
        return res.status(403).json({ error: 'You do not have permission to do that. Farmers only.' });
    }
    next();
};

// Authorization middleware to check product ownership
module.exports.isProductAuthor = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return res.status(404).json({ error: 'Cannot find that product.' });
    }
    if (!req.user || !product.farmer.equals(req.user._id)) {
        return res.status(403).json({ error: 'You do not have permission to do that.' });
    }
    next();
}