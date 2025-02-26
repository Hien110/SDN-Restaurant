const siteRouter = require('./siteRouter');
const restaurantRouter = require('./restaurantsRouter')
const { getFooterData } = require('../app/controllers/RestaurantsController');

function routes(app) {
    // app.use(getFooterData);
    app.use('/restaurantInfor', restaurantRouter)
    app.use('/',getFooterData, siteRouter);
}

module.exports = routes;

