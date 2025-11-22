const fs = require('fs');
const path = require('path');
const request = require('supertest');

const TEST_DB_PATH = path.join(__dirname, 'tmp-test-db.json');
process.env.NEURACARE_DB_PATH = TEST_DB_PATH;

const app = require('../src/app');
const { DEFAULT_DB } = require('../src/lib/db');

beforeEach(async () => {
  fs.writeFileSync(TEST_DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));

  await request(app).post('/api/consent').send({
    userId: 'user-123',
    consentGiven: true,
    timestamp: new Date().toISOString(),
    retentionDays: 30
  });
});

afterAll(() => {
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

describe('POST /api/analyze', () => {
  it('rejects invalid payloads with 400', async () => {
    const response = await request(app).post('/api/analyze').send({});
    expect(response.status).toBe(400);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  it('returns sentiment analysis for valid payloads', async () => {
    const payload = {
      userId: 'user-123',
      text: 'I feel exhausted but hopeful about my progress.',
      timestamp: new Date().toISOString()
    };

    const response = await request(app).post('/api/analyze').send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      userId: payload.userId,
      sentimentLabel: expect.any(String),
      burnoutRisk: expect.stringMatching(/low|medium|high/)
    });
    expect(typeof response.body.sentimentScore).toBe('number');
    expect(Array.isArray(response.body.suggestions)).toBe(true);
  });
});
