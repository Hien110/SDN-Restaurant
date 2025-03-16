require("dotenv").config();
const apiGetPaid = process.env.API_GET_BANK;
const BookingTable = require("../models/BookingTable");
const bankId = process.env.BANK_ID;
const accountNo = process.env.ACCOUNT_NO;
exports.checkPaid = async (req, res) => {
  try {
    const description = req.params.description?.trim();

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin mô tả (description)",
      });
    }

    const response = await fetch(apiGetPaid);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const descriptions = await response.json();
    console.log("Danh sách mô tả giao dịch:", descriptions);
    if (!Array.isArray(descriptions) || descriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không có dữ liệu giao dịch",
      });
    }

    const descriptionSet = new Set(descriptions.map((desc) => desc.trim()));

    const isPaid = descriptionSet.has(description);

    if (!isPaid) {
      console.log(`Không tìm thấy giao dịch với mô tả: ${description}`);
    }
    const booking = await BookingTable.findByIdAndUpdate(description);
    booking.isPaid = isPaid;
    booking.save();
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
