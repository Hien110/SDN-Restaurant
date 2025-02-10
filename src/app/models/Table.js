const mongoose = require('mongoose');
const { Schema } = mongoose;

const tablesSchema = new Schema({
  restaurantId: { type: Number, ref: 'Restaurant', required: true },
  capacity: { type: Number, required: true },
  status: { type: String, enum: ['Available', 'Reserved', 'Occupied'], required: true }
});

module.exports = mongoose.model('Tables', tablesSchema);
