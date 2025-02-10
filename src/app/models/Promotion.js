const mongoose = require('mongoose');
const { Schema } = mongoose;

const promotionsSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  discount: { type: Number, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  restaurantId: { type: Number, ref: 'Restaurant', required: true }
});

module.exports = mongoose.model('Promotions', promotionsSchema);
