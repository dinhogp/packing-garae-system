const request = require('supertest');
const mongoose = require('mongoose');
const {User} = require('../../models/user');

let server;

describe('/api/users',() => {
    beforeEach(()=>{
        server = require('../../index');
    });

    afterEach(async()=>{
        server.close();
        await User.remove({});
    });

    describe('GET /',()=>{
        it('should return all users', async ()=>{
            const users = [
                {first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123'},
                {first_name: 'James', last_name: 'Parker', email: 'parker1234@yahoo.com', password: 'arithmetic123'}
            ];

            await User.collection.insertMany(users);
            const res = await request(server).get('/api/users');

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.first_name === 'John')).toBeTruthy();
            expect(res.body.some(g => g.first_name === 'James')).toBeTruthy();
        });
    });

    describe('GET /:id',()=>{
        it('should return the user if valid id is passed', async ()=>{
            const user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123'});
            await user.save();

            const res = await request(server).get('/api/users/' + user._id);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('first_name',user.first_name);

        });

        it('should return 404 if invalid id is passed', async ()=>{
            const res = await request(server).get('/api/users/1');

            expect(res.status).toBe(404);
        });

        it('should return 404 if id is not found in user database', async ()=>{
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get('/api/users/'+id);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /', ()=>{
        let user;
        // let token;

        const exec = async ()=>{
            return await request(server)
                .post('/api/users')
                .send(user);
        };

        beforeEach(() => {
            user = {first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123'};
        });

        it('should return 400 if the input is not valid',async ()=>{
            user = {first_name: 'John', last_name: 'Doe'};

            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should return 400 if email is not valid', async ()=>{
            user = {first_name: 'John', last_name: 'Doe', email: 'abc12345678', password: 'arithmetic123'};

            const res = await exec();
            expect(res.status).toBe(400);
        });

        it('should save the user if input is valid', async ()=>{
            const res = await exec();

            const user = await User.find({first_name: 'John'});
            expect(user).not.toBeNull();
        });

        it('should return 400 if login is not successful', async () =>{
            await exec();
            
            const res = await request(server)
                                .post('/api/users/login')
                                .send({email:'test@example.com',password:'pa55w0rd'});
            
            expect(res.status).toBe(400);
        });

        it('should return 200 if login is successful', async () => {
            await exec();

            const res = await request(server)
                                .post('/api/users/login')
                                .send(user);
            
            expect(res.status).toBe(200);
        });
    });

});