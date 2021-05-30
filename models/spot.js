const Joi = require('joi');
const mongoose = require('mongoose');

const spotSchema = new mongoose.Schema({
    garage:{
        type: new mongoose.Schema({
            alias:{type:String,required:true,minlength:3},
            zipcode:{
                type:String,
                required:true,
                minlength: 3,
                maxlength:20
            },
            rate_compact:{type: String,required:true},
            rate_regular:{type:String,required:true},
            rate_large:{type:String,required:true} 
        }),
        required: true
    },
    vehicle_type:{
        type: String,
        enum: ['compact','regular','large'],
        default: 'compact'
    },
    status:{
        type: String,
        enum: ['Occupied','Empty'],
        default: 'Empty' 
    },
    rate:{type:String,required:true}
});

const Spot = mongoose.model('Spot',spotSchema);

function validateSpot(spot){
    const schema = Joi.object({
        garage: Joi.object().required(),
        vehicle_type: Joi.string().valid('compact','regular','large'),
        status: Joi.string().valid('Occupied','Empty'),
        rate: Joi.string().required()
    });

    return schema.validate(spot);
}

exports.Spot = Spot;
exports.validate = validateSpot;
