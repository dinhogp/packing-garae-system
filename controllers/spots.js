const validateObjectId = require('../middleware/validateObjectId');
const auth = require('../middleware/auth');
const {Spot, validate} = require('../models/spot');
const {Garage} = require('../models/garage');
const _ = require('lodash');
const Joi = require('joi');
const express = require('express');

const router = express.Router();


router.post('/', auth, async (req,res)=>{
    
    if(!req.user.admin) return res.status(403).send('This function is restricted to only admin users');

    if(req.body.garage){
        req.body.rate = getSpotRate(req.body.vehicle_type,req.body.garage);
    }
    const {error} = validate(req.body);

    if (error) return res.status(400).send(error.details[0].message);
    
    let spot = new Spot(req.body);
    await spot.save();
    
    return res.status(200).send(spot);
});

router.get('/', async (req, res) =>{
    const spots = await Spot.find();
    return res.status(200).send(spots);
});

router.get('/:id', validateObjectId, async(req, res)=>{
    const spot = await Spot.findById(req.params.id);

    if(!spot) return res.status(404).send('The spot with this id does not exist');

    return res.status(200).send(spot);
});

router.put('/:id', [auth,validateObjectId], async(req, res)=>{
    console.log('HERE');
if(!req.user.admin) return res.status(403).send('This function is restricted to only admin users');

    const {error} = validateUpdateSpot(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    if(req.body.vehicle_type){
        let temp_spot = await Spot.findById(req.params.id);
        if(temp_spot){
            req.body.rate = getSpotRate(req.body.vehicle_type,temp_spot.garage);
        }else{
            return res.status(404).send('The spot with this id does not exist in the model');
        }
    }

    const spot = await Spot.findByIdAndUpdate(req.params.id, 
        req.body,
        {new: true});
    
    if (!spot) return res.status(404).send('Spot with id not found');

    return res.status(200).send(spot);
});

router.delete('/:id', [auth, validateObjectId], async (req, res)=>{
    if (!req.user.admin) return res.status(403).send('This function is restricted to only admin users');

    const spot = await Spot.findByIdAndRemove(req.params.id);

    if (!spot) res.status(404).send('Spot with the id does not exist');
    return res.status(200).send(spot);

});

function validateUpdateSpot(req){
    let schema = Joi.object({
        status: Joi.string().valid('Occupied','Empty'),
        vehicle_type: Joi.string().valid('compact','regular','large'),
    });

    return schema.validate(req);
}

function getSpotRate(v_type, i_garage){
    switch(v_type){
        case 'compact':
            return i_garage.rate_compact;
        case 'regular':
            return i_garage.rate_regular;
        case 'large':
            return i_garage.rate_large;
        default: 
            return;
    } 
}
module.exports = router;