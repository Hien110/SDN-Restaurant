const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSpecialSchema = new Schema({
  userId: { type: String, ref: 'User', required: true },
  type: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true }
});

module.exports = mongoose.model('EventSpecial', eventSpecialSchema);

