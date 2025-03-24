require("dotenv").config();
const apiGetPaid = process.env.API_GET_BANK;
const BookingTable = require("../models/BookingTable");
const OrderFood = require("../models/OrderFood");
const moment = require("moment");
const bankId = process.env.BANK_ID;
const accountNo = process.env.ACCOUNT_NO;
exports.checkPaid = async (req, res) => {
  try {
    const description = req.params.description?.trim();
    const amount = parseInt(req.query.amount);

    if (!description || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin mô tả hoặc giá trị thanh toán",
      });
    }

    const response = await fetch(apiGetPaid);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const transactions = await response.json();
    console.log("Danh sách giao dịch:", transactions);
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có dữ liệu giao dịch",
      });
    }

    const isPaid = transactions.some(
      (item) =>
        item["Mô tả"]?.trim() === description &&
        parseInt(item["Giá trị"]) === amount
    );

    if (!isPaid) {
      console.log(
        `Không tìm thấy giao dịch với mô tả: ${description} và giá trị: ${amount}`
      );
    }

    const booking = await BookingTable.findById(description);
    if (booking) {
      booking.isPaid = isPaid;
      await booking.save();
    } else {
      const order = await OrderFood.findById(description);
      if (order) {
        order.statusPayment = isPaid ? "Paid" : "Unpaid";
        await order.save();
      }
    }

    return res.status(200).json({ success: true, isPaid });
  } catch (error) {
    console.error("Lỗi khi kiểm tra thanh toán:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    });
  }
};

exports.reOpenPayment = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.session.user._id;

    const booking = await BookingTable.findById(bookingId)
      .populate("table")
      .populate("customer")
      .exec();
    console.log("Đơn đặt bàn:", booking);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn đặt bàn",
      });
    }

    if (userId.toString() !== booking.customer._id.toString()) {
      return res.redirect("/");
    }

    const moment = require("moment");
    require("moment/locale/vi");

    const orderDate = moment.utc(booking.orderDate);
    const formattedBooking = {
      ...booking.toObject(),
      orderDay: orderDate
        .format("dddd")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      orderDate: orderDate.format("DD/MM/YYYY"),
      orderTime: orderDate.format("HH:mm"),
    };

    return res.render("payment", {
      bookingTable: formattedBooking,
      amount: booking.table.depositPrice,
      bankId,
      accountNo,
    });
  } catch (error) {
    console.error("Lỗi khi mở lại thanh toán:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống, vui lòng thử lại sau",
    });
  }
};

exports.paymentOrder = async (req, resp) => {
  const orderId = req.params.orderId;
  try {
    const order = await OrderFood.findById(orderId)
      .populate("dishes.menuItem")
      .populate("table")
      .populate("bookingTable");

    if (!order) {
      return resp.status(404).json({ error: "Order not found." });
    }

    if (order.statusPayment === "Paid") {
      return resp
        .status(400)
        .json({ error: "This order has already been paid." });
    }

    const totalAmount = order.dishes.reduce(
      (total, dish) => total + dish.menuItem.price * dish.quantity,
      0
    );

    const paymentDetails = {
      amount: totalAmount,
      bankId,
      accountNo,
      orderId,
    };

    order.statusPayment = "Paid";
    await order.save();

    return resp.render("payment", {
      paymentDetails,
      order,
    });
  } catch (error) {
    return resp.status(500).json({ error: error.message });
  }
};
exports.paymentOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await OrderFood.findById(orderId)
      .populate("dishes.menuItem")
      .populate("table")
      .populate("bookingTable");

    if (!order) return res.status(404).json({ error: "Order not found." });
    if (order.statusPayment === "Paid")
      return res
        .status(400)
        .json({ error: "This order has already been paid." });

    const totalAmount = order.dishes.reduce(
      (total, dish) => total + dish.menuItem.price * dish.quantity,
      0
    );

    const createdAt = moment.utc(order.createdAt);
    const formattedOrder = {
      ...order.toObject(),
      orderDay: createdAt
        .format("dddd")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      orderDate: createdAt.format("DD/MM/YYYY"),
      orderTime: createdAt.format("HH:mm"),
    };

    return res.render("payment", {
      bookingTable: formattedOrder,
      amount: totalAmount,
      bankId,
      accountNo,
      type: "order",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
