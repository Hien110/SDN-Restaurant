const Menu = require('../models/Menu');

exports.getMenu = async (req, res) => {
    try {
      const menus = await Menu.find({ statusFood: "AVAILABLE" }).populate('category');
      const selectedCategory = "All";
      res.render('menu', { menus });
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
  