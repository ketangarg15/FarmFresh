const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  consumer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  products: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number
    }
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);