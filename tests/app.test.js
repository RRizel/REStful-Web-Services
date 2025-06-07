const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../app');
const user = require('../models/users');
const cost = require('../models/costs');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Clean DB before tests
    await user.deleteMany({});
    await cost.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('User API', () => {
    const testUser = {
        id: 'user123',
        first_name: 'Test',
        last_name: 'User',
        birthday: new Date('1990-01-01'),
        marital_status: 'single'
    };

    beforeAll(async () => {
        await user.create(testUser);
    });

    afterAll(async () => {
        await user.deleteMany({});
    });

    test('GET /api/users/:id returns user details with total costs', async () => {
        await cost.create([
            { description: 'Food expense', category: 'food', userid: testUser.id, sum: 50 },
            { description: 'Health expense', category: 'health', userid: testUser.id, sum: 30 }
        ]);

        const res = await request(app).get(`/api/users/${testUser.id}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', testUser.id);
        expect(res.body).toHaveProperty('first_name', testUser.first_name);
        expect(res.body).toHaveProperty('last_name', testUser.last_name);
        expect(res.body).toHaveProperty('total', 80);
    });

    test('GET /api/users/:id returns 404 for non-existing user', async () => {
        const res = await request(app).get('/api/users/nonexistent');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error', 'User not found');
    });
});

describe('Costs API', () => {
    const testUserId = 'costUser123';

    beforeAll(async () => {
        await user.create({
            id: testUserId,
            first_name: 'Cost',
            last_name: 'User',
            birthday: new Date('1985-05-15'),
            marital_status: 'married'
        });
    });

    afterAll(async () => {
        await cost.deleteMany({ userid: testUserId });
        await user.deleteMany({ id: testUserId });
    });

    test('POST /api/add adds a new cost item', async () => {
        const newCost = {
            description: 'Lunch',
            category: 'food',
            userid: testUserId,
            sum: 15
        };

        const res = await request(app).post('/api/add').send(newCost);

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            description: 'Lunch',
            category: 'food',
            userid: testUserId,
            sum: 15
        });
    });

    test('POST /api/add returns 400 when required fields are missing', async () => {
        const res = await request(app).post('/api/add').send({ description: 'Incomplete' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('POST /api/add returns 400 for invalid category', async () => {
        const invalidCost = {
            description: 'Invalid category',
            category: 'invalidCat',
            userid: testUserId,
            sum: 10
        };

        const res = await request(app).post('/api/add').send(invalidCost);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('GET /api/report returns monthly report grouped by categories', async () => {
        const costs = [
            { description: 'Dinner', category: 'food', userid: testUserId, sum: 20, Date: new Date('2025-05-10') },
            { description: 'Gym', category: 'sport', userid: testUserId, sum: 40, Date: new Date('2025-05-15') },
            { description: 'Books', category: 'education', userid: testUserId, sum: 30, Date: new Date('2025-05-20') }
        ];
        await cost.insertMany(costs);

        const res = await request(app)
            .get('/api/report')
            .query({ id: testUserId, year: 2025, month: 5 });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('userid', testUserId);
        expect(res.body).toHaveProperty('year', 2025);
        expect(res.body).toHaveProperty('month', 5);
        expect(res.body).toHaveProperty('costs');
        expect(res.body.costs.food.length).toBeGreaterThan(0);
        expect(res.body.costs.sport.length).toBeGreaterThan(0);
        expect(res.body.costs.education.length).toBeGreaterThan(0);
    });

    test('GET /api/report returns 400 if missing params', async () => {
        const res = await request(app).get('/api/report').query({ id: testUserId });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });
});

describe('About API', () => {
    test('GET /api/about returns developers team info', async () => {
        const res = await request(app).get('/api/about');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('first_name');
        expect(res.body[0]).toHaveProperty('last_name');
    });
});