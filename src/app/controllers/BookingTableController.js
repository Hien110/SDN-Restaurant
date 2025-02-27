const BookingTable = require('../models/BookingTable');

exports.findAll = async (req, res) => {
    try {
        const bookings = await BookingTable.find();
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const booking = new BookingTable(req.body);
        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updatedBooking = await BookingTable.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBooking) return res.status(404).json({ message: 'Booking not found.' });
        res.json(updatedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deletedBooking = await BookingTable.findByIdAndDelete(req.params.id);
        if (!deletedBooking) return res.status(404).json({ message: 'Booking not found.' });
        res.status(200).json(deletedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.findById = async (req, res) => {
    try {
        const booking = await BookingTable.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


