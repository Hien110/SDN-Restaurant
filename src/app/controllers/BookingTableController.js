const BookingTable = require('../models/BookingTable');


class BookingTableController {

    index(req, res, next) {
        const userInfor = req.session.user
        if (userInfor.firstName == undefined|| userInfor.lastName  == undefined || userInfor.phoneNumber  == undefined || userInfor.address  == undefined ){
            res.render("informationUser", {error : "Bạn cần phải nhập đầy đủ thông tin"})
        }
        res.render("bookingTable");
      }

    findAll = async (req, res) => {
        try {
            const bookings = await BookingTable.find();
            res.json(bookings);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    };

    create = async (req, res) => {
        try {
            const booking = new BookingTable(req.body);
            await booking.save();
            res.status(201).json(booking);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };

    update = async (req, res) => {
        try {
            const updatedBooking = await BookingTable.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedBooking) return res.status(404).json({ message: 'Booking not found.' });
            res.json(updatedBooking);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };

    delete = async (req, res) => {
        try {
            const deletedBooking = await BookingTable.findByIdAndDelete(req.params.id);
            if (!deletedBooking) return res.status(404).json({ message: 'Booking not found.' });
            res.status(200).json(deletedBooking);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    findById = async (req, res) => {
        try {
            const booking = await BookingTable.findById(req.params.id);
            if (!booking) return res.status(404).json({ message: 'Booking not found.' });
            res.status(200).json(booking);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

}

module.exports = new BookingTableController();
