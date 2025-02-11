const siteRouter = require('./siteRouter');
const router = require('./routes/usersRoutes');


function routes(app) {
    app.use('/', siteRouter);
    app.use('/account', siteRouter);
}

module.exports = routes;
module.exports = router; 
