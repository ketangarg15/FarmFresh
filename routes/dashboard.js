const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware');
const Order = require('../models/order');
const Product = require('../models/product');
const Delivery = require('../models/delivery');

router.use(isLoggedIn);

router.get('/data', async (req, res) => {
  try {
    const role = req.user.role;
    if (role === 'consumer') {
      const orders = await Order.find({ consumer: req.user._id })
        .populate('products.product')
        .sort({ createdAt: -1 });

      const totalOrders = orders.length;
      const moneySaved = Math.round(orders.reduce((sum, order) => sum + order.totalAmount, 0) * 0.15); // assume 15% savings compared to standard supermarkets

      res.json({
        role,
        stats: {
          totalOrders,
          savedItemsCount: 0,
          moneySaved
        },
        recentOrders: orders.slice(0, 5)
      });

    } else if (role === 'farmer') {
      const products = await Product.find({ farmer: req.user._id });
      const productIds = products.map(p => p._id);

      // Find pending orders containing farmer's products
      const pendingOrdersCount = await Order.countDocuments({
        "products.product": { $in: productIds },
        status: 'pending'
      });

      // Calculate revenue from farmer's products sold
      const orders = await Order.find({ 
        "products.product": { $in: productIds },
        status: { $ne: 'cancelled' } 
      }).populate('products.product');

      let revenue = 0;
      for (const order of orders) {
        for (const item of order.products) {
          if (item.product && productIds.some(id => id.equals(item.product._id))) {
            revenue += (item.quantity * (item.product.price || 0));
          }
        }
      }

      res.json({
        role,
        stats: {
          totalListings: products.length,
          pendingOrders: pendingOrdersCount,
          revenue: Math.round(revenue)
        },
        recentProducts: products.slice(0, 5)
      });

    } else if (role === 'admin') {
      const totalOrders = await Order.countDocuments({});
      const totalDeliveries = await Delivery.countDocuments({});
      const pendingDeliveries = await Delivery.countDocuments({ status: { $ne: 'delivered' } });

      const recentDeliveries = await Delivery.find({})
        .populate({
          path: 'order',
          populate: { path: 'consumer', select: 'username name' }
        })
        .populate('deliveryPartner', 'name email contactNumber')
        .sort({ updatedAt: -1 })
        .limit(10);

      res.json({
        role,
        stats: {
          totalOrders,
          totalDeliveries,
          pendingDeliveries
        },
        recentDeliveries
      });
    } else if (role === 'delivery_partner') {
      const deliveries = await Delivery.find({ deliveryPartner: req.user._id })
        .populate({
          path: 'order',
          populate: { path: 'consumer', select: 'username name address contactNumber' }
        })
        .populate('deliveryPartner', 'name email contactNumber')
        .sort({ updatedAt: -1 });

      res.json({
        role,
        stats: {
          totalDeliveries: deliveries.length
        },
        recentDeliveries: deliveries
      });
    } else {
      res.status(400).json({ error: 'Invalid user role' });
    }
  } catch (err) {
    console.error('Dashboard endpoint error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;