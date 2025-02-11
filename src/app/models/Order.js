const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  restaurantId: { type: String, ref: 'Restaurant', required: true },
  tableNumber: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], required: true },
  orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
