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

exports.createDish = async (req, res) => {
    try {
      const { foodName, description, price, imageUrl, starRating, statusFood, category } = req.body;
      const newDish = new Menu({
        foodName,
        description,
        price,
        imageUrl,
        starRating,
        statusFood,
        category
      });
      const savedDish = await newDish.save();
      res.status(201).json(savedDish);
    } catch (error) {
      res.status(500).json({ error: error.message });
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

exports.updateDish = async (req, res) => {
    try {
      const dishId = req.params.id;
      const updatedDish = await Menu.findByIdAndUpdate(dishId, req.body, { new: true });
      if (!updatedDish) {
        return res.status(404).json({ error: 'Dish not found' });
      }
      res.status(200).json(updatedDish);
    } catch (error) {
      res.status(500).json({ error: error.message });
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