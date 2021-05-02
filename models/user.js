const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
    },
    email:{
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 255
    },
    password:{
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    }
});

userSchema.methods.generateAuthToken = function(){
    const user = {
        _id: this._id,
        first_name: this.first_name,
        last_name: this.last_name
    };
    const token = jwt.sign(user,config.get('jwtPrivateKey'));
    return token;
};

const User = mongoose.model('User',userSchema);

function validateUser(user){
    const schema = {
        first_name: Joi.string().min(5).max(50).required(),
        last_name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(user,schema);
}

exports.User = User;
exports.validateUser = validateUser;
