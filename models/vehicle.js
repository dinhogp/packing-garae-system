const Joi = require('joi');
const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    user:{
        type: new mongoose.Schema({
            first_name:{
                type: String,
                required: true,
                minlength: 2,
                maxlength: 50
            },
            last_name:{
                type: String,
                required: true,
                minlength: 2,
                maxlength: 50
            }
        }),
        required: true
    },
    vehicle_type:{
        type: String,
        enum: ['compact','regular','large'],
        default: 'compact'
    },
    license:{
        type: String,
        required:true,
        minlength: 5,
        maxlength: 20
    }
});

const Vehicle = mongoose.model('Vehicle',vehicleSchema);

function validateVehicle(vehicle){
    const schema = Joi.object({
        userId: Joi.object().required(),
        vehicle_type: Joi.string().valid('compact','regular','large'),
        license: Joi.string().min(5).max(20).required()
    });
    return schema.validate(vehicle);
}

exports.Vehicle = Vehicle;
exports.validate = validateVehicle;
