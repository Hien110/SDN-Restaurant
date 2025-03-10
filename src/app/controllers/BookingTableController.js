require("dotenv").config();
const BookingTable = require("../models/BookingTable");
const User = require("../models/User");
const Table = require("../models/Table");
const mongoose = require("mongoose");
const moment = require("moment");

const bankId = process.env.BANK_ID;
const accountNo = process.env.ACCOUNT_NO;
class BookingTableController {
  index = async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      if (
        user.firstName == undefined ||
        user.firstName == "" ||
        user.lastName == undefined ||
        user.lastName == "" ||
        user.phoneNumber == undefined ||
        user.phoneNumber == "" ||
        user.address == undefined ||
        user.address == ""
      ) {
        return res.redirect(
          `/users/${userId}?error=${encodeURIComponent(
            "Bạn cần phải nhập đầy đủ thông tin"
          )}`
        );
      }
      const tables = await Table.find();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00 để lấy từ đầu ngày

      const bookings = await BookingTable.find({ orderDate: { $gte: today } });
      if (!tables.length) {
        return res.render("bookingTable", {
          user: user,
          tables: [],
          message: "Không có bàn trống.",
        });
      }

      if (!bookings.length) {
        return res.render("bookingTable", {
          user: user,
          tables: tables,
          bookings: [],
        });
      }
      return res.render("bookingTable", {
        user: user,
        tables: tables,
        bookings: bookings,
      });
    } catch (err) {
      console.error("Lỗi tại bookingTable:", err); // Log lỗi ra console
      return res.render("errorpage", {
        message: "Đã có lỗi xảy ra, vui lòng thử lại sau.",
      });
    }
  };

  findAll = async (req, res) => {
    try {
      const bookings = await BookingTable.find();
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  createBooking = async (req, res) => {
    try {
      const { dateBooking, timeBooking, selectedTableId, requests } = req.body;
      const userId = req.session.user._id;

      const table = await Table.findById(selectedTableId);
      if (!table) {
        return res.status(404).json({ message: "Bàn không tồn tại" });
      }

      const dateTimeString = `${dateBooking}T${timeBooking}:00Z`;

      let bookings = await BookingTable.findOne({
        table: selectedTableId,
        isPaid: false,
        customer: userId,
      });

      if (!bookings) {
        const bookingTable = new BookingTable({
          quantity: table.seatNumber,
          customer: userId,
          table: selectedTableId,
          request: requests,
        });

        bookings = await bookingTable.save();
      }

      const orderDate = moment(bookings.orderDate);
      const formattedBooking = {
        ...bookings.toObject(),
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
        amount: table.depositPrice,
        bankId, // Đảm bảo các biến này đã được định nghĩa trước đó
        accountNo,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  update = async (req, res) => {
    try {
      const updatedBooking = await BookingTable.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedBooking)
        return res.status(404).json({ message: "Booking not found." });
      res.json(updatedBooking);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  delete = async (req, res) => {
    try {
      const deletedBooking = await BookingTable.findByIdAndDelete(
        req.params.id
      );
      if (!deletedBooking)
        return res.status(404).json({ message: "Booking not found." });
      res.status(200).json(deletedBooking);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  historyDetail = async (req, res) => {
    const moment = require("moment");
    require("moment/locale/vi");
    try {
      const booking = await BookingTable.findById(req.params.id)
        .populate("table") // Populate thông tin từ collection `tables`
        .populate("customer"); // Populate thông tin từ collection `customers`

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      const orderDate = moment(booking.orderDate);
      const formattedBooking = {
        ...booking.toObject(),
        orderDay: orderDate
          .format("dddd") // Lấy thứ (ví dụ: "thứ hai")
          .split(" ") // Tách thành mảng ["thứ", "hai"]
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu của từng từ
          .join(" "), // Ghép lại thành "Thứ Hai"// Viết hoa chữ cái đầu của thứ
        orderDate: orderDate.format("DD/MM/YYYY"),
        orderTime: orderDate.format("HH:mm"), // Tách riêng giờ
      };

      return res.render("historyBookingDetail", {
        bookingDetail: formattedBooking,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  bookingHistory = async (req, res, next) => {
    const moment = require("moment");
    require("moment/locale/vi"); // Import ngôn ngữ tiếng Việt

    try {
      const userId = new mongoose.Types.ObjectId(String(req.params.id));
      const bookings = await BookingTable.find({ customer: userId }).populate(
        "table"
      );

      if (!bookings.length) {
        return res.status(404).json({ message: "Không tìm thấy booking nào" });
      }

      // Chuyển đổi ngày
      const formattedBookings = bookings.map((booking) => {
        const orderDate = moment(booking.orderDate);
        return {
          ...booking.toObject(),
          orderDay: orderDate
            .format("dddd") // Lấy thứ (ví dụ: "thứ hai")
            .split(" ") // Tách thành mảng ["thứ", "hai"]
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu của từng từ
            .join(" "), // Ghép lại thành "Thứ Hai"
          orderDate: orderDate.format("DD/MM/YYYY"), // Lấy ngày
          orderTime: orderDate.format("HH:mm"), // Lấy giờ
        };
      });

      return res.render("historyBooking", {
        historyBookings: formattedBookings,
      });
    } catch (error) {
      console.log({ message: error.message });
      return res.render("errorpage");
    }
  };

  historyDetailEdit = async (req, res) => {
    const moment = require("moment");
    require("moment/locale/vi");
    try {
      const booking = await BookingTable.findById(req.params.id)
        .populate("table") // Populate thông tin từ collection `tables`
        .populate("customer"); // Populate thông tin từ collection `customers`

      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      const orderDate = moment(booking.orderDate);
      const formattedBooking = {
        ...booking.toObject(),
        orderDay: orderDate
          .format("dddd") // Lấy thứ (ví dụ: "thứ hai")
          .split(" ") // Tách thành mảng ["thứ", "hai"]
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Viết hoa chữ cái đầu của từng từ
          .join(" "), // Ghép lại thành "Thứ Hai"// Viết hoa chữ cái đầu của thứ
        orderDate: orderDate.format("DD/MM/YYYY"),
        orderTime: orderDate.format("HH:mm"), // Tách riêng giờ
      };

      return res.render("historyBookingEdit", {
        bookingDetail: formattedBooking,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  deleteBooking = async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const bookingId = req.params.id; // Sửa lại cách lấy id

      const booking = await BookingTable.findById(bookingId);
      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy đặt bàn!" });
      }

      await BookingTable.findByIdAndDelete(bookingId);

      res.json({
        success: true,
        redirectURL: `/bookingTable/bookingHistory/${userId}`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi server!" });
    }
  };
}

module.exports = new BookingTableController();
