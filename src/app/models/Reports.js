const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportsSchema = new Schema({
  restaurantId: { type: Number, ref: 'Restaurant', required: true },
  reportDate: { type: Date, required: true },
  totalSales: { type: Schema.Types.Decimal128, required: true },
  totalOrders: { type: Number, required: true },
  details: { type: Schema.Types.Mixed, required: true } // Cho phep luu tru du lieu json
});

module.exports = mongoose.model('Reports', reportsSchema);
