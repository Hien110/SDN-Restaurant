const siteRouter = require('./siteRouter');
const restaurantRouter = require('./restaurantsRouter')
const tableRouter = require('./tablesRouter')
const { getFooterData } = require('../app/controllers/RestaurantsController');
const { getAllTable } = require('../app/controllers/TablesController');


function routes(app) {
    // app.use(getFooterData);
    app.use('/restaurantInfor', restaurantRouter)
    app.use('/',getFooterData, siteRouter);
    app.use('/tables', tableRouter);
}

module.exports = routes;
