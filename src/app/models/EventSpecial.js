const mongoose = require('mongoose');

const eventSpecialSchema = new mongoose.Schema({
  userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  type: { type: String, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true }
});

module.exports = mongoose.model('EventSpecial', eventSpecialSchema);

