const siteRouter = require('./siteRouter');
const restaurantRouter = require('./restaurantsRouter')
const { getFooterData } = require('../app/controllers/RestaurantsController');
const menuRoutes = require('./menuRoutes');

function routes(app) {
    // app.use(getFooterData);
    app.use('/restaurantInfor', restaurantRouter);
    app.use('/',getFooterData, siteRouter);
    app.use('/api/menu', menuRoutes );
}

module.exports = routes;

