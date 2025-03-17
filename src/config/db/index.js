const mongoose = require("mongoose");
const dbUri = process.env.DB_URI;
const BookingTable = require("../../app/models/BookingTable");

async function connect() {
  try {
    console.log("Connect success!!!");
    await mongoose.connect(dbUri);
  } catch (error) {
    console.log("Connect failure!!!");
  }

  // Hàm xóa booking hết hạn
  const deleteExpiredBookings = async () => {
    try {
      const currentTime = new Date();
      const thirtyMinutesAgo = new Date(currentTime.getTime() - 10000); // Thời gian 30 phút trước

      const result = await BookingTable.deleteMany({
        createdAt: { $lte: thirtyMinutesAgo }, // Đặt điều kiện xóa là thời gian tạo booking đã qua 30 phút
        isPaid: false, // Chỉ xóa những booking chưa thanh toán
      });

      console.log(
        `Đã thực hiện xóa ${result.deletedCount} đơn hàng hết hạn chưa thanh toán.`
      );
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng hết hạn:", error);
    }
  };

  // Đặt interval để kiểm tra và xóa hàng loạt booking hết hạn mỗi phút
  setInterval(deleteExpiredBookings, 1000 * 60);
}

module.exports = { connect };
