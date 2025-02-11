const mongoose = require('mongoose');
const { Schema } = mongoose;

const feedbackSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  restaurantId: { type: String, ref: 'Restaurant', required: true },
  message: { type: String, required: true },
  rating: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

