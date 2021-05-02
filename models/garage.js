const Joi = require('joi');
const mongoose = require('mongoose');

const garageSchema = new mongoose.Schema({
    zipcode:{
        type:String,
        required:true,
        minlength: 3,
        maxlength:20
    },
    rate_compact:{type: String,required:true},
    rate_regular:{type:String,required:true},
    rate_large:{type:String,required:true} 
});

var Garage = mongoose.model('Garage',garageSchema);

function validateGarage(garage){
    const schema = {
        zipcode: Joi.string().min(3).max(20).required(),
        rate_compact: Joi.string().required(),
        rate_regular: Joi.string().required(),
        rate_large: Joi.string().required()
    };

    return Joi.validate(garage,schema); 
}

exports.Garage = Garage;
exports.validateGarage = validateGarage;