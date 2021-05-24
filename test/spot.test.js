// const request = require('supertest');
// const mongoose = require('mongoose');
// const {Spot} = require('./../models/spot');
// const {User} = require('./../models/user');
// const {Garage} = require('./../models/garage');
// const { post } = require('../controllers/users');

// let server;

// describe('/api/spots', ()=>{
//     beforeEach(()=>{
//         server = require('../index');
//     });

//     afterEach(async ()=>{
//         server.close();
//         await Spot.deleteMany({});
//         await User.deleteMany({});
//         await Spot.deleteMany({});
//     });

//     describe('GET /', ()=>{
//         it('should return all spots', async ()=>{
//             const user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123',admin: true});
//             await user.save();

//             const garage = new Garage({
//                 alias: "Porto Livramento",
//                 zipcode: "4050",
//                 location: "27.2046N,77.4977E",
//                 rate_compact: "0.10",
//                 rate_regular: "0.22",
//                 rate_large: "0.34"
//             });

//             await garage.save();

//             const spots = [
//                 {
//                     garage:{
//                         _id:garage._id,
//                         alias: garage.alias,
//                         zipcode: garage.zipcode,
//                     },
//                     vehicle_type: 'compact',
//                     status: 'Empty',
//                     rate:garage.rate_compact
//                 },
//                 {
//                     garage:{
//                         _id:garage._id,
//                         alias: garage.alias,
//                         zipcode: garage.zipcode,
//                     },
//                     vehicle_type: 'regular',
//                     status: 'Empty',
//                     rate:garage.rate_regular
//                 },
//             ];

//             await Spot.collection.insertMany(spots);
//             const res = await request(server).get('/api/spots');

//             expect(res.status).to.be(200);
//             expect(res.body.length).to.be(2);
//         });
//     });

//     describe('GET /:id', ()=>{
//         it('should return the spot if the valid id is passed', async()=>{
//             const user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123',admin: true});
//             await user.save();

//             const garage = new Garage({
//                 alias: "Porto Livramento",
//                 zipcode: "4050",
//                 location: "27.2046N,77.4977E",
//                 rate_compact: "0.10",
//                 rate_regular: "0.22",
//                 rate_large: "0.34"
//             });

//             await garage.save();

//             const spot = new Spot({
//                 garage:{
//                     _id:garage._id,
//                     alias: garage.alias,
//                     zipcode: garage.zipcode,
//                 },
//                 vehicle_type: 'compact',
//                 status: 'Empty',
//                 rate:garage.rate_compact
//             });
//             await spot.save();

//             const res = await request(server).get('/api/spots/'+spot._id);

//             expect(res.status).to.be(200);
//             expect(res.body.vehicle_type).to.be('compact');
//         });

//         it('should return 404 if id is not found in spot database', async () => {
//             const id = mongoos.Types.ObjectId();
//             const res = await request(server).get('/api/spots/'+spot._id);

//             expect(res.status).to.be(401);
//         });
//     });

//     describe('POST /', ()=>{
//         let spot;
//         let token;
//         let user;
//         let garage;

//         const exec = async ()=>{
//             return await request(server)
//                             .post('/api/spots')
//                             .set('x-auth-token',token)
//                             .send(spot);
//         };

//         beforeEach(async ()=>{
//             user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123', admin: true});
//             await user.save();

//             token = user.generateAuthToken();
//             garage = new Garage({
//                 alias: "Porto Livramento",
//                 zipcode: "4050",
//                 location: "27.2046N,77.4977E",
//                 rate_compact: "0.10",
//                 rate_regular: "0.22",
//                 rate_large: "0.34"
//             });
//             await garage.save();

//             spot = {
//                 garage:{
//                     _id:garage._id,
//                     alias: garage.alias,
//                     zipcode: garage.zipcode,
//                 },
//                 vehicle_type: 'compact',
//                 status: 'Empty',
//                 rate:garage.rate_compact
//             };
//         });

//         it('should return 400 if the input is not valid', async()=>{
//             spot = {
//                 vehicle_type: 'compact',
//                 status: 'Empty',
//                 rate:garage.rate_compact
//             };

//             const res = await exec();
//             expect(res.status).to.be(400);
//         });

//         it('should return 401 if token is invalid', async()=>{
//             token = 'invalid$Token';

//             const res = await exec();
//             expect(res.status).to.be(401);
//         });
//     });
// });