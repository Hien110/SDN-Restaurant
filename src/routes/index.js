const siteRouter = require('./siteRouter');

function routes(app) {
    //app.use(getFooterData);
    //app.use('/restaurantInfor', restaurantRouter)
    //app.use('/',getFooterData, siteRouter);
    app.get('/admin', (req, res) => {
        res.render('layouts/admin');
    }); 
}

module.exports = routes;
