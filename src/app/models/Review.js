const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewsSchema = new Schema({
  userId: { type: Number, ref: 'User', required: true },
  restaurantId: { type: Number, ref: 'Restaurant', required: true },
  menuId: { type: Number, ref: 'Menu', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reviews', reviewsSchema);
