const Joi = require('joi');
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    spot:{
        type: new mongoose.Schema({
            garage:{
                type: new mongoose.Schema({
                    prefix:{type: String,minlength:1,maxlength:5,unique:true,required:true},
                }),
                required: true
            },
            vehicle_type:{
                type: String,
                enum: ['compact','regular','large'],
                default: 'compact'
            },
            rate:{type:String,required:true}
        }),
        required: true
    },
    vehicle:{
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
    },
    ticket_no:{type:String,required:true},
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
    const schema = Joi.object({
        spot: Joi.object().required(),
        vehicle: Joi.object().required(),
        ticket_no: Joi.string().required(),
        start_time: Joi.date(),
        end_time: Joi.date(),
        paid: Joi.boolean(),
        rental_fee: Joi.string()
    });

    return schema.validate(reservation);
}

exports.Reservation = Reservation;
exports.validate = validateReservation;