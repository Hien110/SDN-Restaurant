const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewsSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  restaurantId: { type: String, ref: 'Restaurant', required: true },
  menuId: { type: String, ref: 'Menu', required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  createAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reviews', reviewsSchema);
