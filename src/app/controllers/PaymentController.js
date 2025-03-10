require("dotenv").config();
const apiGetPaid = process.env.API_GET_BANK;
const BookingTable = require("../models/BookingTable");

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
