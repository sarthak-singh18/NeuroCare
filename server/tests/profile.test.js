const fs = require('fs');
const path = require('path');
const request = require('supertest');

const TEST_DB_PATH = path.join(__dirname, 'tmp-test-db.json');
process.env.NEURACARE_DB_PATH = TEST_DB_PATH;

const app = require('../src/app');
const { DEFAULT_DB } = require('../src/lib/db');

beforeEach(() => {
  fs.writeFileSync(TEST_DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
});

afterAll(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

describe('Profile routes', () => {
  const payload = {
    userId: 'coach-1',
    name: 'Coach Jane',
    timezone: 'America/New_York',
    preferences: {
      nudgesPerWeek: 3
    }
  };

  it('creates or updates a profile', async () => {
    const response = await request(app).post('/api/profile').send(payload);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(payload);
  });

  it('retrieves an existing profile', async () => {
    await request(app).post('/api/profile').send(payload);
    const response = await request(app).get(`/api/profile/${payload.userId}`);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(payload);
  });

  it('returns 404 when profile missing', async () => {
    const response = await request(app).get('/api/profile/missing-user');
    expect(response.status).toBe(404);
  });
});
