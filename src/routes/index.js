const express = require("express");
const authRouter = require("./authRouter");
const siteRouter = require("./siteRouter");
const bookingRouter = require("./bookingTableRouter");
const restaurantRouter = require("./restaurantsRouter");
const { getFooterData } = require("../app/controllers/RestaurantsController");
const userRoutes = require("./usersRoutes");
const isAuth = require("../app/middlewares/is-auth");
const BookingTable = require("../app/models/BookingTable");
const Table = require("../app/models/Table");
const User = require("../app/models/User");
const staffRouter = require("./staffRouter");
const router = express.Router();
const menuRoutes = require('./menuRoutes');
const takeCareRouter = require('./takecareRouter');


function routes(app) {
  app.use('/admin/menu', menuRoutes);
  app.use("/restaurantInfor", restaurantRouter);
  app.use("/",isAuth.setUser, getFooterData, siteRouter);
  app.use("/auth", authRouter);
  app.use("/", authRouter);
  app.use('/users', userRoutes); 
  app.use('/bookingTable', bookingRouter); 
  app.use('/admin/staffs', staffRouter);
  app.use('/admin/takeCare', takeCareRouter);

  app.post("/bookingTable", async (req, res) => {
    try {
        const { userId, tableId, orderDate, timeUse, request } = req.body;

        // Kiểm tra user có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại." });
        }

        // Kiểm tra bàn có tồn tại không
        const table = await Table.findById(tableId);
        if (!table) {
            return res.status(400).json({ message: "Bàn không tồn tại." });
        }

        // Kiểm tra bàn có bị trùng thời gian đặt không
        const existingBooking = await BookingTable.findOne({
            table: tableId,
            orderDate: new Date(orderDate),
            $expr: {
                $lte: [
                    { $abs: { $subtract: ["$timeUse", timeUse] } },
                    3 * 60 * 60 * 1000, // 3 giờ
                ],
            },
        });

        if (existingBooking) {
            return res.status(400).json({ message: "Bàn đã được đặt trong khoảng thời gian này." });
        }

        // Tạo mới bookingTable
        const newBooking = new BookingTable({
            quantity: table.seatNumber,
            orderDate: new Date(orderDate),
            timeUse,
            customer: userId,
            table: tableId,
            request,
        });

        await newBooking.save();

        res.status(201).json({ message: "Đặt bàn thành công!", booking: newBooking });
    } catch (error) {
        console.error("Lỗi khi đặt bàn:", error);
        res.status(500).json({ message: "Lỗi máy chủ, vui lòng thử lại sau." });
    }
});
  
}

module.exports = routes;
