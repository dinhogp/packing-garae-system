const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const {Vehicle, validate} = require('../models/vehicle');
const _ = require('lodash');
const Joi = require('joi');
const express = require('express');

const router = express.Router();


router.post('/', auth, async (req, res) => {
    req.body.user = req.user;
    // console.log(req.body);
    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    let vehicle = new Vehicle(req.body);
    await vehicle.save();

    return res.status(200).send(req.body);
});

router.get('/', async (req, res) => {
    const vehicles = await Vehicle.find();
    return res.status(200).send(vehicles);
});

router.get('/:id', validateObjectId, async (req, res)=>{
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) return res.status(404).send('The vehicle with that id does not exist');

    return res.status(200).send(vehicle);
});

router.put('/:id', [auth, validateObjectId], async (req, res)=>{
    const {error} = validateUpdateVehicle(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, 
        req.body,
        {new: true});

    if (!vehicle) return res.status(404).send('Vehicle with id not found');

    return res.status(200).send(vehicle);
});

router.delete('/:id', [auth,validateObjectId], async (req,res)=>{
    const vehicle = await Vehicle.findByIdAndRemove(req.params.id);

    if (!vehicle) return res.status(404).send('Vehicle with id does not exist');
    return res.status(200).send(vehicle);
});

function validateUpdateVehicle(req){
    const schema = Joi.object({
        vehicle_type: Joi.string().valid('compact','regular','large'),
        license: Joi.string().min(5).max(20)
    });

    return schema.validate(req);
}

module.exports = router;