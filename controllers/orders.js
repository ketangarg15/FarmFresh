const Order = require('../models/order');
const Product = require('../models/product');
const mongoose = require('mongoose');

// Lists orders belonging ONLY to the currently logged-in user.
module.exports.index = async (req, res) => {
    const orders = await Order.find({ consumer: req.user._id })
        .populate('products.product')
        .sort({ createdAt: -1 }); // Sort by newest first
    res.render('orders/index', { orders });
};

// Shows a single order, but ONLY if it belongs to the logged-in user.
module.exports.showOrder = async (req, res) => {
    // SECURITY FIX: Added 'consumer: req.user._id' to the query.
    // This ensures a user can only view their own orders.
    const order = await Order.findOne({ _id: req.params.id, consumer: req.user._id })
        .populate('products.product')
        .populate('consumer');

    if (!order) {
        req.flash('error', 'Cannot find that order.');
        return res.redirect('/orders');
    }

    res.render('orders/show', { order });
};

module.exports.placeOrder = async (req, res) => {
    try {
        const { productId, quantity: rawQuantity } = req.body;
        const quantity = parseInt(rawQuantity, 10) || 1;

        if (quantity <= 0) {
            req.flash('error', 'Quantity must be at least 1.');
            return res.redirect('back');
        }

        const product = await Product.findById(productId);
        if (!product) {
            req.flash('error', 'Product not found.');
            return res.redirect('back');
        }

        // Check stock BEFORE creating the order
        if (product.quantity < quantity) {
            req.flash('error', `Sorry, only ${product.quantity} of "${product.name}" is available.`);
            return res.redirect('back');
        }

        // All checks passed, proceed with creating the order
        const totalAmount = Number((product.price * quantity).toFixed(2));

        const order = new Order({
            consumer: req.user._id,
            products: [{ product: product._id, quantity, price: product.price }],
            totalAmount,
            status: 'pending'
        });

        // Decrease the product's stock quantity
        product.quantity -= quantity;

        // Save both operations
        await product.save();
        await order.save();
        
        req.flash('success', 'Order placed successfully!');
        res.redirect(`/orders/${order._id}`);

    } catch (err) {
        console.error('placeOrder error:', err);
        req.flash('error', err.message || 'Unable to place order. Please try again later.');
        res.redirect('back');
    }
};