const BookingTable = require("../models/BookingTable");
const User = require("../models/User");
const Table = require("../models/Table");

class BookingTableController {
  index = async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      console.log(user.firstName + '.. ' + user.lastName  + '.. ' + user.phoneNumber + '.. '+  user.address );
      
      if (
        user.firstName == undefined || user.firstName == "" ||
        user.lastName == undefined || user.lastName == "" ||
        user.phoneNumber == undefined || user.phoneNumber == "" ||
        user.address == undefined || user.address == ""
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
        return res.render("bookingTable", { user: user, tables: [], message: "Không có bàn trống." });
      }

      if (!bookings.length) {
        return res.render("bookingTable", { user: user, tables: tables, bookings: [] });
      }
      return res.render("bookingTable", { user: user, tables: tables, bookings: bookings });
    } catch (err) {
        console.error("Lỗi tại bookingTable:", err); // Log lỗi ra console
        return res.render("errorpage", { message: "Đã có lỗi xảy ra, vui lòng thử lại sau." });
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
      const {dateBooking, timeBoooking, selectedTableId, requests} = req.body;
      const userId = req.session.user._id;
      const table =await Table.findById(selectedTableId)
      const dateTimeString = `${dateBooking}T${timeBoooking}:00Z`;
      const bookingTable = new BookingTable ({
          quantity: table.seatNumber,
          orderDate: dateTimeString,
          customer: userId,
          table: selectedTableId,
          request: requests 
      })
      await bookingTable.save();
      res.redirect('bookingTable');
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

  findById = async (req, res) => {
    try {
      const booking = await BookingTable.findById(req.params.id);
      if (!booking)
        return res.status(404).json({ message: "Booking not found." });
      res.status(200).json(booking);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}

module.exports = new BookingTableController();
