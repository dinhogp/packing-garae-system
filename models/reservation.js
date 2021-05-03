const Joi = require('joi');
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    spot:{
        type: new mongoose.Schema({
            garage:{
                type: new mongoose.Schema({
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
            }
        }),
        required: true
    },
    vehicle:{
        user:{
            type: new mongoose.Schema({
                first_name:{
                    type: String,
                    required: true,
                    minlength: 5,
                    maxlength: 50
                },
                last_name:{
                    type: String,
                    required: true,
                    minlength: 5,
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
    },
    start_time: {
        type: Date,
        required:true,
        default: Date.now
    },
    end_time: {
        type: Date
    },
    paid:{
        type: boolean,
        default: false
    },
    rental_fee:{
        type:String
    }
});

const Reservation = mongoose.model('Reservation',reservationSchema);

function validateReservation(reservation){
    const schema = {
        spot: Joi.objectId().required(),
        vehicle: Joi.objectId().required(),
        start_time: Joi.date(),
        end_time: Joi.date(),
        paid: Joi.boolean(),
        rental_fee: Joi.string()
    };

    return Joi.validate(reservation,schema);
}

exports.Reservation = Reservation;
exports.validateReservation = validateReservation;