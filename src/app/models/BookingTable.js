const mongoose = require("mongoose");
const { Schema } = mongoose;

const BookingTableSchema = new Schema({
  quantity: { type: Number, required: false },
  orderDate: { type: Date, default: Date.now },
  timeUse: { type: Number, default: 3 },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  table: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  request: { type: String, required: false },
  isPaid: { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 60000) },
  orderFood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OrderFood",
    required: false,
  },
});

module.exports = mongoose.model("BookingTable", BookingTableSchema);
