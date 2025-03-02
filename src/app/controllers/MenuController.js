const Menu = require('../models/Menu');
require('../models/CategoryFood'); 

exports.getList = async (req, res) => {
  try {
    const menus = await Menu.find().populate('category');
    res.render('menu', { menus, layout: 'layouts/mainAdmin' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.renderDetailDish = async (req, res) => {
  try {
    const dish = await Menu.findById(req.params.id);
    if (!dish) {
      return res.status(404).send("Món ăn không tồn tại");
    }
    res.render("detailDish", { dish, layout: "layouts/mainAdmin" });
  } catch (error) {
    res.status(500).send(error.message);
  }
};


exports.deleteDish = async (req, res) => {
  try {
    const dishId = req.params.id;
    const deletedDish = await Menu.findByIdAndDelete(dishId);
    if (!deletedDish) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    res.status(200).json({ message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.renderCreateForm = (req, res) => {
  res.render('createDish', { layout: 'layouts/mainAdmin' });
};


exports.createDish = async (req, res) => {
    try {
      const { foodName, description, price, imageUrl } = req.body;
      const defaultStatusFood = "AVAILABLE";
      const defaultCategoryId = "64e72dfc1234567890abcdef";

      const newDish = new Menu({
        foodName,
        description,
        price,
        imageUrl,
        statusFood: defaultStatusFood,
        category: defaultCategoryId,
      });
      await newDish.save();
      res.json({ success: true, message: "Tạo món ăn thành công!" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
};

exports.renderEditForm = async (req, res) => {
  try {
    const dish = await Menu.findById(req.params.id);
    if (!dish) {
      return res.status(404).send('Dish not found');
    }
    res.render('editDish', { dish, layout: 'layouts/mainAdmin' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.updateDish = async (req, res) => {
  try {
    const dishId = req.params.id;
    const updatedDish = await Menu.findByIdAndUpdate(dishId, req.body, { new: true });
    if (!updatedDish) {
      return res.status(404).json({ success: false, message: "Món ăn không tồn tại!" });
    }
    res.status(200).json({ success: true, message: "Cập nhật món ăn thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


  
  exports.searchDish = async (req, res) => {
    try {
      const { q } = req.query;
      const dishes = await Menu.find({
        foodName: { $regex: q, $options: 'i' }  // tìm kiếm không phân biệt hoa thường
      }).populate('category');
      res.status(200).json(dishes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };