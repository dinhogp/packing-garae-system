const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User,validate} = require('../models/user');
const Joi = require('joi');
const express = require('express');

const router = express.Router();

/** 
@ POST api/user/ :
Function for registering new user
**/
router.post('/', async(req,res)=>{
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email:req.body.email});
    if (user) return res.status(400).send('User already exists');

    user = new User(_.pick(req.body, ['first_name','last_name','email','password']));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    const token = user.generateAuthToken();
    return res.header('x-auth-token',token).send(_.pick(user,['_id','first_name','last_name','email']));
});

/** 
@ POST api/user/login :
Function for auth user login
**/
router.post('/login', async(req, res) => {
    const {error} = validateLogin(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findOne({email:req.body.email});
    if(!user) return res.status(400).send('Invalid email or password');

    const validPassword = await bcrypt.compare(req.body.password,user.password);
    if(!validPassword) return res.status(400).send('Invalid password');

    const token = user.generateAuthToken();
    return res.status(200).send(token);
});

/** 
@ GET api/user/ :
Function for getting all users
**/
router.get('/', async (req, res)=>{
    const users = await User.find().sort('first_name');
    return res.status(200).send(users);
});

/** 
@ GET api/user/id :
Function for getting current user data
**/
router.get('/:id',  async (req, res)=>{
    const user = await User.findById(req.params.id).select('-password');

    if (!user) return res.status(404).send('The user with the given id was not found');
    
    return res.status(200).send(user);
});

/** 
@ POST api/user/ :
Function for updating user data
**/
router.put('/:id', [auth, validateObjectId] , async (req, res)=>{
    const {error} = validateUpdateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findByIdAndUpdate(req.params.id,
        req.body,
        {new: true});
    
    if (!user) return res.status(404).send('User with id not found');
    
    return res.status(200).send(_.pick(user,['_id','first_name','last_name','email']));
    
});

/** 
@ POST api/user/ :
Function for updating new password
**/
router.put('/new/password', async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(404).send('User with email not found');

    const salt = await bcrypt.genSalt(10);
    let newPassword = await bcrypt.hash(req.body.password, salt);

    const updatedUser = await User.findByIdAndUpdate(user._id,
        {password: newPassword},
        {new: true});
    
    return res.status(200).send(updatedUser);
});

/** 
@ POST api/user/ :
Function for deleting user
**/
router.delete('/:id', [auth, validateObjectId], async (req, res)=>{
    const user = await User.findByIdAndRemove(req.params.id);

    if(!user) return res.status(404).send('User with id does not exist');

    return res.status(200).send(user);
});

//validate user login data
function validateLogin(req){
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    });

    return schema.validate(req);
}

//validate update user data
function validateUpdateUser(req){
    const schema = Joi.object({
        first_name: Joi.string().min(2).max(50),
        last_name: Joi.string().min(2).max(50)
    });

    return schema.validate(req);
}

module.exports = router;