const Order = require('../models/order');
const Product = require('../models/product');
const Delivery = require('../models/delivery');
const mongoose = require('mongoose');

// Lists orders belonging ONLY to the currently logged-in user.
module.exports.index = async (req, res) => {
    try {
        const orders = await Order.find({ consumer: req.user._id })
            .populate('products.product')
            .sort({ createdAt: -1 }); // Sort by newest first
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Shows a single order, but ONLY if it belongs to the logged-in user.
module.exports.showOrder = async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, consumer: req.user._id })
            .populate('products.product')
            .populate('consumer');

        if (!order) {
            return res.status(404).json({ error: 'Cannot find that order.' });
        }

        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.placeOrder = async (req, res) => {
    try {
        const { productId, quantity: rawQuantity, items } = req.body;
        
        let orderItems = [];
        let totalAmount = 0;
        
        // Handle checkout of multiple items (Cart check out)
        if (items && Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                const product = await Product.findById(item.productId);
                if (!product) {
                    return res.status(404).json({ error: `Product not found: ${item.productId}` });
                }
                const qty = parseInt(item.quantity, 10) || 1;
                if (product.quantity < qty) {
                    return res.status(400).json({ error: `Sorry, only ${product.quantity} of "${product.name}" is available.` });
                }
                
                orderItems.push({
                    product: product._id,
                    quantity: qty,
                    price: product.price
                });
                totalAmount += Number((product.price * qty).toFixed(2));
                
                // Deduct stock
                product.quantity -= qty;
                await product.save();
            }
        } else {
            // Handle single item checkout
            const quantity = parseInt(rawQuantity, 10) || 1;
            if (quantity <= 0) {
                return res.status(400).json({ error: 'Quantity must be at least 1.' });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found.' });
            }

            if (product.quantity < quantity) {
                return res.status(400).json({ error: `Sorry, only ${product.quantity} of "${product.name}" is available.` });
            }

            orderItems.push({
                product: product._id,
                quantity,
                price: product.price
            });
            totalAmount = Number((product.price * quantity).toFixed(2));
            
            // Deduct stock
            product.quantity -= quantity;
            await product.save();
        }

        const order = new Order({
            consumer: req.user._id,
            products: orderItems,
            totalAmount: Number(totalAmount.toFixed(2)),
            status: 'pending'
        });
        await order.save();

        // Automatically create associated Delivery
        const delivery = new Delivery({
            order: order._id,
            partnerName: 'Fresh Express Cargo',
            status: 'pending'
        });
        await delivery.save();
        
        res.status(201).json({ success: true, order });

    } catch (err) {
        console.error('placeOrder error:', err);
        res.status(500).json({ error: err.message || 'Unable to place order. Please try again later.' });
    }
};

module.exports.cancel = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({ _id: id, consumer: req.user._id });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'pending') return res.status(400).json({ message: 'Only pending orders can be cancelled' });

        order.status = 'cancelled';
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({ status: 'cancelled', timestamp: new Date() });
        await order.save();

        return res.json({ success: true });
    } catch (e) {
        return res.status(400).json({ message: e.message || 'Cancel failed' });
    }
};

module.exports.reorder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findOne({ _id: id, consumer: req.user._id }).populate('products.product');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // For simplicity, just acknowledge success. Hook to cart service here.
        return res.json({ success: true });
    } catch (e) {
        return res.status(400).json({ message: e.message || 'Reorder failed' });
    }
};