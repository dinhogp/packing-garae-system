const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const {Garage, validate} = require('../models/garage');
const _ = require('lodash');
const Joi = require('joi');
const express = require('express');

const router = express.Router();


router.post('/', auth, async (req,res) =>{
    if(!req.user.admin) return res.status(403).send('This function is restricted to only admin users');
    const {error} = validate(req.body);
    
    // console.log("ERROR",error.details[0].message);
    if (error) return res.status(400).send(error.details[0].message);

    let garage = await Garage.find({prefix:req.body.prefix}); 

    if (garage.length > 0) return res.status(400).send("A garage with the same prefix already exist.");

    garage = new Garage(req.body);
    await garage.save();

    return res.status(200).send(req.body);
});

router.get('/', async (req,res) => {
    const garages = await Garage.find();
    return res.status(200).send(garages);
});

router.get('/:id', validateObjectId, async (req, res) => {
    const garage = await Garage.findById(req.params.id);

    if(!garage) return res.status(404).send('The garage with the id does not exist');

    return res.status(200).send(garage);
});

router.put('/:id', [auth, validateObjectId] , async (req, res) => {
    if (!req.user.admin) return res.status(403).send('This function is restricted to only admin users');
    
    const {error} = validateUpdateGarage(req.body);

    if (error) return res.status(400).send(error.details[0].message);

    const garage = await Garage.findByIdAndUpdate(req.params.id,
        req.body,
        {new: true}
    );
    if(!garage) return res.status(404).send('The garage with the id does not exist');

    return res.status(200).send(garage);
});

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    if (!req.user.admin) return res.status(403).send('This function is restricted to only admin users');

    const garage = await Garage.findByIdAndRemove(req.params.id);
    if (!garage) return res.status(404).send('The garage with the id does not exist');

    return res.status(200).send(garage);
});

function validateUpdateGarage(req){
    const schema = Joi.object({
        alias: Joi.string().min(3),
        location: Joi.string().min(5),
        prefix: Joi.string().min(1).max(5),
        zipcode: Joi.string().min(3).max(20),
        rate_compact: Joi.string(),
        rate_regular: Joi.string(),
        rate_large: Joi.string()
    });

    return schema.validate(req);
}

module.exports = router;