const mongoose = require('mongoose');
const { Schema } = mongoose;

const loyaltySchema = new Schema({
  userId: { type: Number, ref: 'User', required: true },
  points: { type: Number, required: true },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Loyalty', loyaltySchema);
