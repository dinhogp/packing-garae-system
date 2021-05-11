const request = require('supertest');
const expect = require('expect.js');

describe('basic test to confrim configuration',()=>{
    it('should successfully run the test',()=>{
        const val = 'Test Passed';
        expect(val).to.be('Test Passed');
    });
});
