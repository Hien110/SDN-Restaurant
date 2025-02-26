const userRoutes = require('./usersRoutes');

function routes(app) {
    app.use('/users', userRoutes); 
}

module.exports = routes;