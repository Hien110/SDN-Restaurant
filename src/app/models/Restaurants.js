const mongoose = require('mongoose');
const { Schema } = mongoose;

const restaurantSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  openingHours: { type: String, required: true },
  bannerUrl: { type: String, required: true },
  phone: { type: String, required: true }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);

