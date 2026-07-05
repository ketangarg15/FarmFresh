const Delivery = require('../models/delivery');
const Order = require('../models/order');
const User = require('../models/user');

module.exports.index = async (req, res) => {
   try {
       let query = {};
       if (req.user.role === 'delivery_partner') {
           query.deliveryPartner = req.user._id;
       }
       const deliveries = await Delivery.find(query)
           .populate({
               path: 'order',
               populate: { path: 'consumer', select: 'name username address contactNumber' }
           })
           .populate('deliveryPartner', 'name email contactNumber');
       res.json(deliveries);
   } catch (err) {
       res.status(500).json({ error: err.message });
   }
};

module.exports.show = async (req, res) => {
  try {
      const delivery = await Delivery.findById(req.params.id)
          .populate({
              path: 'order',
              populate: { path: 'consumer', select: 'name username address contactNumber' }
          })
          .populate('deliveryPartner', 'name email contactNumber');
      if (!delivery) {
          return res.status(404).json({ error: 'Cannot find that delivery.' });
      }
      res.json(delivery);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('order');

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Mirror status update in Order model
    let orderStatus = 'confirmed';
    if (status === 'picked_up' || status === 'in_transit') {
        orderStatus = 'dispatched';
    } else if (status === 'delivered') {
        orderStatus = 'delivered';
    }
    await Order.findByIdAndUpdate(delivery.order._id, { status: orderStatus });

    return res.json({ success: true, status: delivery.status, id: delivery.id });
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Update failed' });
  }
};

module.exports.listPartners = async (req, res) => {
    try {
        const partners = await User.find({ role: 'delivery_partner' }).select('name email username contactNumber');
        res.json(partners);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports.assignPartner = async (req, res) => {
    try {
        const { id } = req.params;
        const { partnerId } = req.body;
        
        const partner = await User.findById(partnerId);
        if (!partner) {
            return res.status(404).json({ error: 'Delivery partner not found.' });
        }

        const delivery = await Delivery.findByIdAndUpdate(id, {
            deliveryPartner: partnerId,
            partnerName: partner.name || partner.username,
            status: 'picked_up',
            updatedAt: Date.now()
        }, { new: true });

        if (!delivery) {
            return res.status(404).json({ error: 'Delivery record not found.' });
        }

        // Update the order status to dispatched
        await Order.findByIdAndUpdate(delivery.order, { status: 'dispatched' });

        res.json({ success: true, delivery });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};