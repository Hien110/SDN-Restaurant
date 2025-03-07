const mongoose = require('mongoose');
const { Schema } = mongoose;

const TableSchema = new Schema({
    idTable: { type: String, required: true },
    seatNumber: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: false },
    depositPrice: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'OCCUPIED'], required: true },
    type: {type: String, enum: ['NORMAL', 'VIPS'] ,required: true},
    avatar: { type: String, default: 'https://shopbanghe.vn/wp-content/uploads/2019/08/ban-ghe-nha-hang-sang-trong-1.jpg'},
});

module.exports = mongoose.model('Table', TableSchema);
