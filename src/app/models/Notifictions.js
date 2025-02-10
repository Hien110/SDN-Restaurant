const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
  userId: { type: Number, ref: 'User', required: true },
  message: { type: String, required: true },
  createAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Sent', 'Read'], required: true }
});

module.exports = mongoose.model('Notification', notificationSchema);

