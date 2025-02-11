const mongoose = require('mongoose');
const { Schema } = mongoose;

const menuSchema = new Schema({
  restaurantId: { type: String, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Schema.Types.Decimal128, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true }
});

module.exports = mongoose.model('Menu', menuSchema);
