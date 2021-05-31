const Joi = require('joi');
const mongoose = require('mongoose');

const garageSchema = new mongoose.Schema({
    alias:{type:String,required:true,minlength:3},
    zipcode:{
        type:String,
        required:true,
        minlength: 3,
        maxlength:20
    },
    prefix:{type: String,minlength:1,maxlength:5,unique:true,required:true},
    location:{type:String,required:true},
    rate_compact:{type: String,required:true},
    rate_regular:{type:String,required:true},
    rate_large:{type:String,required:true} 
});

var Garage = mongoose.model('Garage',garageSchema);

function validateGarage(garage){
    const schema = Joi.object({
        alias: Joi.string().min(3).required(),
        location: Joi.string().min(5).required(),
        zipcode: Joi.string().min(3).max(20).required(),
        prefix: Joi.string().min(1).max(5).required(),
        rate_compact: Joi.string().required(),
        rate_regular: Joi.string().required(),
        rate_large: Joi.string().required()
    });
    return schema.validate(garage); 
}

exports.Garage = Garage;
exports.validate = validateGarage;