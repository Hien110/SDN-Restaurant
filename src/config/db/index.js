const mongoose = require("mongoose");
async function connect() {
  try {
    console.log("Connect success!!!");
    await mongoose.connect("mongodb://127.0.0.1:27017/restaurant_manager");
  } catch (error) {
    console.log("Connect failure!!!");
  }
}
module.exports = { connect };
