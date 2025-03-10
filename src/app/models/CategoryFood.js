const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategoryFoodSchema = new Schema({
  categoryName: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
});

module.exports = mongoose.model('CategoryFood', CategoryFoodSchema);
