const express  = require('express');
const users = require('./../controllers/users');
const vehicles = require('./../controllers/vehicles');


module.exports = function(app){
    app.use(express.json());
    app.use('/api/users', users);
    app.use('/api/vehicles', vehicles);
};