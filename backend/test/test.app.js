const request = require('supertest');
const app = require('../index');
const mongoose = require("mongoose");
const { expect, assert } = require('chai');
const { User, Account } = require('../db'); // Assuming User and Account models are in db.js
const jwt = require('jsonwebtoken');


// Generate a valid token
const generateToken = (userId) => {
    return jwt.sign({ userId }, 'aasmaan', { expiresIn: '1d' });
};

// Database Setup/Teardown
before((done) => {
    if (mongoose.connection.readyState === 0) {
        mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => done())
            .catch((err) => done(err));
    } else {
        done();
    }
});

after((done) => {
    mongoose.disconnect()
        .then(() => done())
        .catch((err) => done(err));
});

// Create user and account before each test
beforeEach(async () => {
    await User.deleteMany({});
    await Account.deleteMany({});

    const user = await User.create({
        username: 'validUser@gmail.com',
        firstName: 'Valid',
        lastName: 'User',
        password: 'password'
    });

    await Account.create({
        userId: user._id,
        balance: 1000
    });
});

// Test Suite for User Signup
describe('POST /api/v1/user/signup', () => {
    it('attempts to create an existing user', (done) => {
        request(app)
            .post('/api/v1/user/signup')
            .send({ username: 'validUser@gmail.com', firstName: 'Valid', lastName: 'User', password: 'password' })
            .expect(409)
            .end((err, res) => {
                if (err) return done(err);
                assert.equal(res.body.message, 'Email already taken');
                done();
            });
    });
});

// Test Suite for Fund Transfer
describe('POST /api/v1/account/transfer', () => {
    it('attempts to transfer funds with insufficient balance', async () => {
        const user = await User.findOne({ username: 'validUser@gmail.com' });
        const token = generateToken(user._id);
        request(app)
            .post('/api/v1/account/transfer')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 1000000, to: 'recipientUserId' })
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.body.message, 'Insufficient balance');
            });
    });

    it('attempts to transfer funds to an invalid account', async () => {
        const user = await User.findOne({ username: 'validUser@gmail.com' });
        const token = generateToken(user._id);
        request(app)
            .post('/api/v1/account/transfer')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 500, to: 'invalidUserId' })
            .expect(400)
            .end((err, res) => {
                if (err) throw err;
                assert.equal(res.body.message, 'Invalid account');
            });
    });

    // it('attempts to transfer funds successfully', async () => {
    //     const user = await User.findOne({ username: 'aasmaan@gmail.com' });
    //     const token = generateToken(user._id);
    //     request(app)
    //         .post('/api/v1/account/transfer')
    //         .set('Authorization', `Bearer ${token}`)
    //         .send({ amount: 500, to: 'aasmaan2@gmail.com' })
    //         .expect(200)
    //         .end((err, res) => {
    //             if (err) throw err;
    //             assert.equal(res.body.message, 'Transfer successful');
    //         });
    // });
});

// Run the tests
// npm test
