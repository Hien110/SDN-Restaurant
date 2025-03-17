const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  dishes: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true,
      },
      quantity: { type: Number, required: true },
      statusOrder: {
        type: String,
        enum: ["Pending", "In Progress", "Completed", "Cancelled"],
        required: true,
      },
      typeOrder: { type: String, enum: ["Offline", "Online"], required: true },
      orderDate: { type: Date, default: Date.now },
    },
  ],
  bookingTable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BookingTable",
    required: false,
  },
  totalPrice: { type: Number, required: false },
  statusPayment: {
    type: String,
    enum: ["Pending", "Paid"],
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["Cash", "Card"],
    required: true,
  },
});

orderSchema.pre("save", async function (next) {
  await this.calculateTotalPrice();
  next();
});

orderSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.dishes) {
    const order = await this.model
      .findOne(this.getQuery())
      .populate("dishes.menuItem");
    if (order) {
      order.dishes = update.dishes;
      await order.calculateTotalPrice();
      this.set("totalPrice", order.totalPrice);
    }
  }
  next();
});

orderSchema.methods.calculateTotalPrice = async function () {
  await this.populate("dishes.menuItem");

  let total = 0;
  this.dishes.forEach((dish) => {
    total += parseFloat(dish.menuItem.price) * dish.quantity;
  });

  this.totalPrice = total;
};

module.exports = mongoose.model("OrderFood", orderSchema);
