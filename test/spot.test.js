const request = require('supertest');
const mongoose = require('mongoose');
const {Spot} = require('./../models/spot');
const {User} = require('./../models/user');
const {Garage} = require('./../models/garage');
const expect = require('expect.js');

let server;

describe('/api/spots', ()=>{
    beforeEach(()=>{
        server = require('../index');
    });

    afterEach(async ()=>{
        server.close();
        await Spot.deleteMany({});
        await User.deleteMany({});
        await Garage.deleteMany({});
    });

    describe('GET /', ()=>{
        it('should return all spots', async ()=>{
            const user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123',admin: true});
            await user.save();

            const garage = new Garage({
                alias: "Porto Livramento",
                zipcode: "4050",
                prefix: "PL",
                location: "27.2046N,77.4977E",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            });

            await garage.save();

            const spots = [
                {
                    garage:{
                        _id:garage._id,
                        alias: garage.alias,
                        zipcode: garage.zipcode,
                        prefix: garage.prefix,
                        rate_compact: garage.rate_compact,
                        rate_regular: garage.rate_regular,
                        rate_large: garage.rate_large
                    },
                    vehicle_type: 'compact',
                    status: 'Empty',
                    rate:garage.rate_compact
                },
                {
                    garage:{
                        _id:garage._id,
                        alias: garage.alias,
                        zipcode: garage.zipcode,
                        prefix: garage.prefix,
                        rate_compact: garage.rate_compact,
                        rate_regular: garage.rate_regular,
                        rate_large: garage.rate_large
                    },
                    vehicle_type: 'regular',
                    status: 'Empty',
                    rate:garage.rate_regular
                },
            ];

            await Spot.collection.insertMany(spots);
            const res = await request(server).get('/api/spots');

            expect(res.status).to.be(200);
            expect(res.body.length).to.be(2);
        });
    });

    describe('GET /:id', ()=>{
        it('should return the spot if the valid id is passed', async()=>{
            const user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123',admin: true});
            await user.save();

            const garage = new Garage({
                alias: "Porto Livramento",
                zipcode: "4050",
                prefix: "PL",
                location: "27.2046N,77.4977E",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            });

            await garage.save();

            const spot = new Spot({
                garage:{
                    _id:garage._id,
                    alias: garage.alias,
                    zipcode: garage.zipcode,
                    prefix: garage.prefix,
                    rate_compact: garage.rate_compact,
                    rate_regular: garage.rate_regular,
                    rate_large: garage.rate_large
                },
                vehicle_type: 'compact',
                status: 'Empty',
                rate:garage.rate_compact
            });
            await spot.save();

            const res = await request(server).get('/api/spots/'+spot._id);

            expect(res.status).to.be(200);
            expect(res.body.vehicle_type).to.be('compact');
        });

        it('should return 404 if id is not found in spot database', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/spots/'+id);

            expect(res.status).to.be(404);
        });
    });

    describe('POST /', ()=>{
        let spot;
        let token;
        let user;
        let garage;

        const exec = async ()=>{
            return await request(server)
                            .post('/api/spots')
                            .set('x-auth-token',token)
                            .send(spot);
        };

        beforeEach(async ()=>{
            user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save();

            token = user.generateAuthToken();
            garage = new Garage({
                alias: "Porto Livramento",
                zipcode: "4050",
                prefix: "PL",
                location: "27.2046N,77.4977E",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            });
            await garage.save();

            spot = {
                garage:{
                    _id:garage._id,
                    alias: garage.alias,
                    zipcode: garage.zipcode,
                    prefix: garage.prefix,
                    rate_compact: garage.rate_compact,
                    rate_regular: garage.rate_regular,
                    rate_large: garage.rate_large
                },
                vehicle_type: 'compact',
                status: 'Empty'            };
        });

        it('should return 401 if token is invalid', async()=>{
            token = '';

            const res = await exec();
            expect(res.status).to.be(401);
        });

        it('should return 403 if the user does not have admin rights', async ()=>{
            user = new User({first_name: 'Dave', last_name: 'Azpi', email: 'xyz1234@yahoo.com', password: 'arithmetic123', admin: false});
            await user.save();

            token = user.generateAuthToken();
            const res = await exec();
            expect(res.status).to.be(403);
        });

        it('should return 400 if the input is invalid', async ()=>{
            spot = {
                garage:{
                    _id:garage._id,
                    alias: garage.alias,
                    zipcode: garage.zipcode,
                    prefix: garage.prefix,
                    rate_compact: garage.rate_compact,
                    rate_regular: garage.rate_regular,
                    rate_large: garage.rate_large
                },
                vehicle_type: 'JEEP',
                status: 'Empty'
            };

            const res = await exec();
            expect(res.status).to.be(400);
        });

        it('should save the spot record if the input is valid', async () => {
            let res = await exec();

            const newSpot = await Spot.findById(res.body._id);

            expect(res.status).to.be(200);
            expect(newSpot).to.not.be(null);
            expect(newSpot.rate).to.be(garage.rate_compact);
        });
    });

    describe('PUT /:id',()=>{
        let token;
        let newStatus;
        let newVehicleType;
        let id;
        let spot;
        let updateItem;

        const exec = async ()=> {
            return await request(server)
                        .put('/api/spots/'+id)
                        .set('x-auth-token',token)
                        .send(updateItem);
        };

        beforeEach(async ()=>{
            let user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save();

            token = user.generateAuthToken();
            let garage = new Garage({
                alias: "Porto Livramento",
                zipcode: "4050",
                prefix: "PL",
                location: "27.2046N,77.4977E",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            });
            await garage.save();

            spot = new Spot({
                garage:{
                    _id:garage._id,
                    alias: garage.alias,
                    zipcode: garage.zipcode,
                    prefix: garage.prefix,
                    rate_compact: garage.rate_compact,
                    rate_regular: garage.rate_regular,
                    rate_large: garage.rate_large
                },
                vehicle_type: 'compact',
                status: 'Empty',
                rate: garage.rate_compact            
            });
            await spot.save();
            id = spot._id;

            newStatus = 'Occupied';
            newVehicleType = 'large';
            updateItem = {status:newStatus};
        });

        it('should return 401 if the token is invalid', async ()=>{
            token = '';
            
            let res = await exec();
            
            expect(res.status).to.be(401);
        });

        it('should return 403 if the user does not have admin rights', async () =>{
            let user = new User({first_name: 'Dehn', last_name: 'Woe', email: 'wodpdf1234@yahoo.com', password: 'arithmetic123', admin: false});
            await user.save();

            token = user.generateAuthToken();
            let res = await exec();
            expect(res.status).to.be(403);
        });

        it('should return 400 if the new Status input is wrong', async()=>{
            newStatus = 'Closed';
            updateItem = {status:newStatus};
            let res = await exec();
            expect(res.status).to.be(400);
        });

        it('should return 404 if id is invalid', async ()=>{
            id = 1;

            let res = await exec();
            expect(res.status).to.be(404);
        });

        it('should update spot if update is successful', async ()=>{
            let res = await exec();

            let newSpot = await Spot.findById(spot._id);
            expect(newSpot.status).to.be(newStatus);
        });

        it('should update vehicle type and vehicle rate of spot if update is successful', async ()=>{
            updateItem = {vehicle_type:newVehicleType};
            let res = await exec();

            let newSpot = await Spot.findById(spot._id);
            expect(newSpot.vehicle_type).to.be(newVehicleType);
            expect(newSpot.rate).to.be(newSpot.garage.rate_large);
        });

        it('should return the spot if update is successful', async ()=>{
            let res = await exec();

            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('status',newStatus);
        });
    });

    describe('DELETE /:id', ()=>{
        let token;
        let spot;
        let id;

        const exec = async ()=> {
            return await request(server)
                        .delete('/api/spots/'+id)
                        .set('x-auth-token',token)
                        .send();
        };

        beforeEach(async () => {
            let user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save();

            token = user.generateAuthToken();
            let garage = new Garage({
                alias: "Porto Livramento",
                zipcode: "4050",
                prefix: "PL",
                location: "27.2046N,77.4977E",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            });
            await garage.save();

            spot = new Spot({
                garage:{
                    _id:garage._id,
                    alias: garage.alias,
                    zipcode: garage.zipcode,
                    prefix: garage.prefix,
                    rate_compact: garage.rate_compact,
                    rate_regular: garage.rate_regular,
                    rate_large: garage.rate_large
                },
                vehicle_type: 'compact',
                status: 'Empty',
                rate: garage.rate_compact            
            });
            await spot.save();
            id = spot._id;
        });

        it('should return 401 if the token is invalid', async ()=>{
            token = '';

            let res = await exec();
            expect(res.status).to.be(401);
        });

        it('should return 403 if the user does not have admin rights', async ()=> {
            let user = new User({first_name: 'Jane', last_name: 'Philip', email: 'philip1234@yahoo.com', password: 'arithmetic123', admin: false});
            await user.save();

            token = user.generateAuthToken();
            let res = await exec();
            expect(res.status).to.be(403);
        });

        it('should return 404 if id is invalid', async () => {
            id = 1;

            let res = await exec();
            expect(res.status).to.be(404);
        });

        it('should return 200 and spot if the id is invalid', async () => {
            let res = await exec();
            let deletedSpot = await Spot.findById(spot._id);

            expect(res.status).to.be(200);
            expect(deletedSpot).to.be(null);
        });

        it('should return the removed spot', async ()=> {
            let res = await exec();

            expect(res.status).to.be(200);
            expect(res.body).to.have.property('_id',spot._id.toHexString());
        });
    });
});