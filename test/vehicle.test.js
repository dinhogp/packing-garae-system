const request = require('supertest');
const mongoose = require('mongoose');
const {Vehicle} = require('../models/vehicle');
const {User} = require('../models/user');
const expect = require('expect.js');

let server;

describe('/api/vehicles', ()=>{
    beforeEach(()=>{
        server = require('../index');
    });

    afterEach(async()=>{
        server.close();
        await Vehicle.deleteMany({});
        await User.deleteMany({});
    });

    describe('GET /', ()=>{
        it('should return all vehicles', async ()=>{
            const user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123',admin: true});
            await user.save();
            
            const vehicles = [
                {
                    user:{
                        _id: user._id,
                        first_name: user.first_name,
                        last_name: user.last_name
                    },
                    vehicle_type: 'regular',
                    license: 'NGR12LG10'
                },
                {
                    user:{
                        _id: user._id,
                        first_name: user.first_name,
                        last_name: user.last_name
                    },
                    vehicle_type: 'compact',
                    license: 'NGR34ABJ21'
                }
            ];

            await Vehicle.collection.insertMany(vehicles);
            const res = await request(server).get('/api/vehicles');

            expect(res.status).to.be(200);
            expect(res.body.length).to.be(2);
            expect(res.body.some(g => g.license === 'NGR12LG10')).to.be(true);
            expect(res.body.some(g => g.license === 'NGR34ABJ21')).to.be(true);
        });
    });

    describe('GET /:id ',()=>{
        it('should return the vehicle if the valid id is passed', async () =>{
            const user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save();

            const vehicle = new Vehicle({
                user:{
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
                vehicle_type: 'regular',
                license: 'NGR12LG10'
            });
            await vehicle.save();

            const res = await request(server).get('/api/vehicles/' + vehicle._id);

            expect(res.status).to.be(200);
            expect(res.body).to.have.property('license',vehicle.license);
        });

        it('should return 404 if id is not found in vehicle database', async () =>{
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/vehicles/'+id);

            expect(res.status).to.be(404);
        });
    });

    describe('POST /', ()=>{
        let vehicle;
        let token;
        let user;

        const exec = async ()=>{
            return await request(server)
                    .post('/api/vehicles')
                    .set('x-auth-token',token)
                    .send(vehicle);
        };

        beforeEach(async ()=>{
            user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save();
            
            token = user.generateAuthToken();
            vehicle = {
                vehicle_type: 'regular',
                license: 'NGR12LG10'
            };
        });

        it('should return 400 if the input is not valid', async () => {
            vehicle = {
                vehicle_type: 'regular',
            };

            const res = await exec();
            expect(res.status).to.be(400);
        });

        it('should return 400 if token is invalid', async () => {
            token = 'invalid$token';

            let res = await exec();
            expect(res.status).to.be(400);
        });

        it('should save the vehicle if the input is valid', async()=>{
            await exec();

            const vehicle = await Vehicle.find({license: 'NGR12LG10'});
            expect(vehicle).not.to.be(null);
        });
    });

    describe('PUT /:id',()=>{
        let token;
        let newLicense;
        let vehicle;
        let user;
        let id;

        const exec = async()=>{
            return await request(server)
                        .put('/api/vehicles/'+id)
                        .set('x-auth-token',token)
                        .send({license:newLicense});
        };

        beforeEach(async ()=>{
            //Before each test we need to creata vehicle record in the database
            user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save();

            token = user.generateAuthToken();
            vehicle = new Vehicle({
                user:{
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
                vehicle_type: 'regular',
                license: 'NGR12LG10'
            });
            await vehicle.save();
            id = vehicle._id;
            newLicense = 'NGR23QOW3';
        });

        it('should return 401 if token is invalid', async () =>{
            token = '';

            let res = await exec();
            expect(res.status).to.be(401);
        });

        it('should return 400 if license is less than 5 characters', async () =>{
            newLicense = 'NGR';
            let res = await exec();

            expect(res.status).to.be(400);
        });

        it('should return 404 if id is invalid', async ()=>{
            id = 1;

            let res = await exec();

            expect(res.status).to.be(404);
        });

        it('should update the vehicle if the new license is valid', async()=>{
            let res = await exec();

            const updatedVehicle = await Vehicle.findById(vehicle._id);
            expect(updatedVehicle.license).to.be(newLicense);
        });

        it('should return vehicle if update is successfull', async()=>{
            let res = await exec();

            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('license',newLicense);
        });
    });

    describe('DELETE /:id', ()=>{
        let token;
        let user;
        let vehicle;
        let id;

        const exec = async ()=>{
            return await request(server)
                    .delete('/api/vehicles/'+id)
                    .set('x-auth-token',token)
                    .send();
        };

        beforeEach(async ()=>{
            //Before each test we need to creata vehicle record in the database
            user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save();

            token = user.generateAuthToken();
            vehicle = new Vehicle({
                user:{
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name
                },
                vehicle_type: 'regular',
                license: 'NGR12LG10'
            });

            await vehicle.save();
            id = vehicle._id;
        });

        it('should return 404 if id is invalid', async()=>{
            id = 1;

            let res = await exec();
            expect(res.status).to.be(404);
        });

        it('should return 200 and the vehicle if the id is valid', async()=>{
            let res = await exec();
            let deleteVehicle = await Vehicle.findById(id);
            expect(res.status).to.be(200);
            expect(deleteVehicle).to.be(null);
        });

        it('should return the removed vehicle', async ()=>{
            let res = await exec();
            expect(res.body).to.have.property('_id',vehicle._id.toHexString());
            expect(res.status).to.be(200);
        });

    });

});