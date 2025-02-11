const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: Boolean, required: true },
  role: { type: String, enum: ['Admin', 'User'], required: true },
  status: { type: String, enum: ['Active', 'Inactive'], required: true }
});

module.exports = mongoose.model('User', userSchema);
