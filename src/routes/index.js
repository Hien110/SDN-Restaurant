const siteRouter = require('./siteRouter');

function routes(app) {
    app.use('/', siteRouter);
}

module.exports = routes;
