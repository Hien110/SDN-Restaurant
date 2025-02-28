const RestaurantInfor = require("../models/RestaurantInfor");

class RestaurantsController {
  async getAll(req, res, next) {
    try {
      const restaurantInfo = await RestaurantInfor.findOne();
      res.locals.footerData = restaurantInfo || {
        address: "Địa chỉ chưa cập nhật",
        phone: "Chưa có số điện thoại",
      };
      next();
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const restaurantInfo = new RestaurantInfor(req.body);
      await restaurantInfo.save();
      res.json(restaurantInfo);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }
}

const restaurantsController = new RestaurantsController();

module.exports = restaurantsController;

module.exports.getFooterData = restaurantsController.getAll;
