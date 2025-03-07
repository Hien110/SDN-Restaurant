const mongoose = require("mongoose");
const { Schema } = mongoose;

const TableSchema = new Schema({
  idTable: { type: String, required: true },
  seatNumber: { type: Number, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  depositPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["AVAILABLE", "RESERVED", "OCCUPIED"],
    required: true,
  },
});

module.exports = mongoose.model("Table", TableSchema);
