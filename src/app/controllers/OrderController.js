require("dotenv").config();
const BookingTable = require("../models/BookingTable");
const OrderFood = require("../models/OrderFood");
const Menu = require("../models/Menu");

exports.getOrder = async (req, res) => {
  try {
    const bookings = await BookingTable.find()
      .populate("table")
      .populate("customer")
      .populate({
        path: "orderFood",
        populate: {
          path: "dishes.menuItem",
          model: "Menu",
        },
      })
      .exec();

    console.log("bookings", bookings);

    return res.render("listOrderManagement", {
      bookings,
      layout: "layouts/mainAdmin",
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error.message);
    console.error("Chi tiết lỗi:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống, vui lòng thử lại sau",
      error: error.message,
    });
  }
};
exports.orderDishOnline = async (req, res) => {
  const userId = req.user._id;
  const menuItems = await Menu.find({ statusFood: "AVAILABLE" });

  try {
    const bookings = await BookingTable.find({
      customer: userId,
      isPaid: true,
    }).populate("table");

    if (bookings.length === 0) {
      return res.render("orderDishOnline", {
        message:
          "Bạn chưa thanh toán cho bàn nào, vui lòng quay lại và đặt bàn.",
        menuItems: [],
        bookings: [],
      });
    }

    if (!menuItems || menuItems.length === 0) {
      return res.render("orderDishOnline", {
        message: "Hiện tại không có món ăn nào có sẵn để đặt.",
        menuItems: [],
        bookings: bookings,
      });
    }
    console.log("bookings", bookings);
    console.log("menuItems", menuItems);

    return res.render("orderDishOnline", {
      menuItems: menuItems,
      bookings: bookings,
      message: "Chọn món ăn bạn muốn đặt cho bàn",
    });
  } catch (err) {
    console.error(err);
    return res.render("orderDishOnline", {
      error: "Có lỗi xảy ra, vui lòng thử lại sau.", // Đảm bảo rằng error được truyền vào render
      menuItems: [],
      bookings: [],
    });
  }
};
