const mongoose = require('mongoose');
const { Schema } = mongoose;

const reservationSchema = new Schema({
  userId: { type: Number, ref: 'User', required: true },
  restaurantId: { type: Number, ref: 'Restaurant', required: true },
  tableId: { type: Number, ref: 'Tables', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], required: true }
});

module.exports = mongoose.model('Reservation', reservationSchema);
