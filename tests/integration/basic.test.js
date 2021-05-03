const request = require('supertest');

describe('basic test to confrim configuration',()=>{
    it('should successfully run the test',()=>{
        const val = 'Test Passed';
        expect(val).toBe('Test Passed');
    });
});