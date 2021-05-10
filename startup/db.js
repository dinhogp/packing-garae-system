const mongoose = require('mongoose');
const config = require('config');

module.exports = function(){
    mongoose.connect(config.get('db'),{ 
        useNewUrlParser: true, 
        useUnifiedTopology: true,
        useFindAndModify: false })
        .then(()=>console.log(`Connected to ${config.get('db')}`))
        .catch((err)=>console.log(`Mongoose connect failed - ${err}`));
};
