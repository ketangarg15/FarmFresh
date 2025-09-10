const Delivery = require('../models/delivery');
const Order = require('../models/order');

module.exports.index = async (req, res) => {
   const deliveries = await Delivery.find({}).populate('order');
 res.render('deliveries/index', { deliveries });
};

module.exports.show = async (req, res) => {
 const delivery = await Delivery.findById(req.params.id).populate('order');
  // Check if delivery exists
  if (!delivery) {
    req.flash('error', 'Cannot find that delivery.');
    return res.redirect('/deliveries');
  }
  res.render('deliveries/show', { delivery });
};

module.exports.update = async (req, res) => {
  const { id } = req.params;
  // Directly use the status from the request body.
    // The frontend EJS templates already handle formatting for display.
  const { status } = req.body; 

    const delivery = await Delivery.findByIdAndUpdate(
        id,
        { status: status, updatedAt: Date.now() },
        { new: true, runValidators: true }
    );

  if (!delivery) {
    req.flash('error', 'Cannot update a non-existent delivery.');
    return res.redirect('/deliveries');
 }

  req.flash('success', 'Delivery status updated successfully.');
  res.redirect(`/deliveries/${id}`);
};