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
        await User.deleteMany({},()=>{
            console.log('All documents successfully deleted');
        });
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

            console.log('after',user);
            const loginData = {email: 'abc1234@yahoo.com', password: 'arithmetic123'};
            const res = await request(server)
                                .post('/api/users/login')
                                .send(loginData);
            expect(res.status).toBe(200);
        });
    });

    describe('PUT /:id',()=>{
        let token;
        let newFirstName;
        let user;
        let id;

        const exec = async ()=>{
            return await request(server)
                .put('/api/users/'+id)
                .set('x-auth-token',token)
                .send({first_name: newFirstName});
        };

        beforeEach(async ()=>{
            //Before each test we need to create a user in the database
            user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123'});
            await user.save();

            token = user.generateAuthToken();
            id = user._id;
            newFirstName = 'Philip';
        });

        it('should return 401 if token is invalid', async ()=>{
            token = '';

            let res = await exec();
            expect(res.status).toBe(401);
        });

        it('should return 400 if firstName is less than 2', async ()=>{
            newFirstName = 'a';
            let res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if id is invalid', async ()=>{
            id = 1;

            let res = await exec();
            expect(res.status).toBe(404);
        });

        it('should update the user if the new firstname is valid', async ()=>{
            let res = await exec();
            
            // console.log('body',res.body);
            // console.log('user',user);
            const updatedUser = await User.findById(user._id);
            // console.log('updatedUser',updatedUser);
            expect(updatedUser.first_name).toBe(newFirstName);
        });

        it('should return user if update is successful', async () => {
            let res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('first_name',newFirstName);
        });

        it('should return 200 if password is changed succesfully', async () => {
            let newPassword = '1234pass$5';

            let res = await request(server)
                .put('/api/users/new/password')
                .send({'email':user.email,'password':newPassword});
            
            expect(res.status).toBe(200);
        });
        
    });

    describe('DELETE /:id', () => {
        let token;
        let user;
        let id;

        const exec = async ()=>{
            return await request(server)
                        .delete('/api/users/'+id)
                        .set('x-auth-token',token)
                        .send();
        };

        beforeEach(async ()=>{
            user = new User({first_name: 'John', last_name: 'Doe', email: 'abc1234@yahoo.com', password: 'arithmetic123'});
            await user.save();

            id = user._id;
            token = user.generateAuthToken();
        });

        it('should return 404 if id is invalid',async ()=>{
            id = 1;

            let res = await exec();
            expect(res.status).toBe(404);
        });

        it('should return 200 and the user if id is valid',async ()=>{
            let res = await exec();
            let deletedUser = await User.findById(id);
            expect(res.status).toBe(200);
            expect(deletedUser).toBeNull();
        });

        it('should return the removed user',async ()=>{
            let res = await exec();

            expect(res.body).toHaveProperty('_id',user._id.toHexString());
            expect(res.body).toHaveProperty('first_name',user.first_name);
        });
    });

});