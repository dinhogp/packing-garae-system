const request = require('supertest');
const mongoose = require('mongoose');
const {Garage} = require('../models/garage');
const {User} = require('../models/user');
const expect = require('expect.js');

let server;

describe('/api/garage',()=>{
    beforeEach(()=>{
        server = require('../index');
    });

    afterEach(async ()=>{
        server.close();
        await Garage.deleteMany({});
        await User.deleteMany({});
    });

    describe('GET /', ()=>{
        it('Should return all garages in the database', async()=>{
            const garages = [
                { 
                    alias: "Porto Livramento",
                    zipcode: "4050",
                    location: "27.2046N,77.4977E",
                    rate_compact: "0.10",
                    rate_regular: "0.22",
                    rate_large: "0.34"
                },
                {
                    alias: "London Bridge",
                    zipcode: "E16AN",
                    location: "0.5123S,12.3109E",
                    rate_compact: "0.15",
                    rate_regular: "0.27",
                    rate_large: "0.41"
                }
            ];

            await Garage.collection.insertMany(garages);
            const res = await request(server).get('/api/garages');

            expect(res.status).to.be(200);
            expect(res.body.length).to.be(2);
            expect(res.body.some(g => g.alias === 'Porto Livramento'));
            expect(res.body.some(g => g.alias === 'London Bridge'));
        });

    });

    describe('GET /:id', () => {
        it('should return the garage if the valid id is passed', async ()=>{
            const garage = new Garage({
                alias: "Porto Livramento",
                zipcode: "4050",
                location: "27.2046N,77.4977E",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            });

            await garage.save();

            const res = await request(server).get('/api/garages/'+garage._id);

            expect(res.status).to.be(200);
            expect(res.body).to.have.property('alias',garage.alias);
        });

        it('should return 404 if id is not found in garage database', async ()=>{
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/garages/'+id);

            expect(res.status).to.be(404);
        });
    });

    describe('POST /', ()=>{
        let garage;
        let token;

        const exec = async ()=>{
            return await request(server)
                    .post('/api/garages')
                    .set('x-auth-token',token)
                    .send(garage);
        };

        beforeEach(async ()=>{
            let user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save(); 

            token = user.generateAuthToken();
            // console.log(token);
            garage = {
                alias: "Porto Livramento",
                zipcode: "4050",
                location: "27.2046N,77.4977E",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            };
        });

        it('should return 401 if token is invalid', async ()=>{
            token = '';
            let res = await exec();
            expect(res.status).to.be(401);
        });

        it('should return 400 if the input is not valid', async ()=>{
            garage = {
                alias: "Porto Livramento",
                zipcode: "4050",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            };

            const res = await exec();
            // console.log(res);
            // console.log("TOKEN",token);
            expect(res.status).to.be(400);
        });

        it('should return 403 if the user does not have admin rights', async ()=>{
            let user = new User({first_name: 'Paul', last_name: 'Philip', email: 'dgfhd1234@yahoo.com', password: 'arithmetic123', admin: false});
            await user.save();

            token = user.generateAuthToken();
            let res = await exec();
            expect(res.status).to.be(403);
        });

        it('should save the garage if the input is valid', async () => {
            await exec();

            const new_garage = await Garage.find({alias:"Porto Livramento"});
            expect(new_garage).to.not.be.empty();
        });
    });

    describe('PUT /:id', ()=>{
        let token;
        let newLocation;
        let id;
        let garage;

        const exec = async () => {
            return await request(server)
                    .put('/api/garages/'+id)
                    .set('x-auth-token',token)
                    .send({location:newLocation});
        };

        beforeEach(async ()=>{
            let user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save();

            token = user.generateAuthToken();
            garage = new Garage({
                alias: "Porto Livramento",
                zipcode: "4050",
                location: "27.2046N,77.4977E",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            });
            await garage.save();

            id = garage._id;
            newLocation = "4.2146N,17.4977E";
        });
        
        it('should return 401 if the token is invalid', async()=>{
            token = '';

            let res = await exec();
            expect(res.status).to.be(401);
        });

        it('should return 403 if the user does not have admin rights', async ()=>{
            let user = new User({first_name: 'Dehn', last_name: 'Woe', email: 'wodpdf1234@yahoo.com', password: 'arithmetic123', admin: false});
            await user.save();

            token = user.generateAuthToken();
            let res = await exec();
            expect(res.status).to.be(403);
        });

        it('should return 400 if location is less than 5 characters', async()=>{
            newLocation = 'abc';
            let res = await exec();
            expect(res.status).to.be(400);
        });

        it('should return 404 if id is invalid', async()=>{
            id = 1;

            let res = await exec();
            expect(res.status).to.be(404);
        });

        it('should update garage record if the input is correct', async()=>{
            await exec();

            let updatedGarage = await Garage.findById(garage._id);
            expect(updatedGarage.location).to.be(newLocation);
        });

        it('should return garage if update is successful', async()=>{
            let res = await exec();

            expect(res.body).to.have.property('_id');
            expect(res.body).to.have.property('location',newLocation);
        });
    });

    describe('DELETE /:id', ()=>{
        let token;
        let garage;
        let id;
        const exec = async ()=>{
            return await request(server)
                .delete('/api/garages/'+id)
                .set('x-auth-token',token)
                .send();
        };

        beforeEach(async ()=>{
            let user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
            await user.save();

            token = user.generateAuthToken();
            garage = new Garage({
                alias: "Porto Livramento",
                zipcode: "4050",
                location: "27.2046N,77.4977E",
                rate_compact: "0.10",
                rate_regular: "0.22",
                rate_large: "0.34"
            });
            await garage.save();

            id = garage._id;
        });

        it('should return 401 if the token is invalid', async()=>{
            token = '';

            let res = await exec();
            expect(res.status).to.be(401);
        });

        it('should return 403 if the user does not have admin rights', async ()=>{
            let user = new User({first_name: 'Jane', last_name: 'Philip', email: 'philip1234@yahoo.com', password: 'arithmetic123', admin: false});
            await user.save();

            token = user.generateAuthToken();
            let res = await exec();
            expect(res.status).to.be(403);
        });

        it('should return 404 if id is invalid', async()=>{
            id = 1;

            let res = await exec();
            expect(res.status).to.be(404);
        });

        it('should return 200 and garage if the id is invalid', async()=>{
            let res = await exec();
            let deletedGarage = await Garage.findById(id);
            
            expect(res.status).to.be(200);
            expect(deletedGarage).to.be(null);
        });

        it('should return the removed garage', async ()=>{
            let res = await exec();
            expect(res.status).to.be(200);
            expect(res.body).to.have.property('_id',garage._id.toHexString());
        });
    });
});