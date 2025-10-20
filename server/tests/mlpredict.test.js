const request = require('supertest');
const app = require('../app'); // Your Express entry
const nock = require('nock');

describe('ML Prediction API', () => {
  beforeEach(() => {
    // Mock Flask ML server for CI
    nock('http://127.0.0.1:6000')
      .post('/predict')
      .reply(200, { predictedShelfLifeDays: 123 });
  });

  afterEach(() => {
    // Clean up nock mocks
    nock.cleanAll();
  });

  it('predicts shelf life using ML API', async () => {
    const res = await request(app)
      .post('/api/predictions/mlpredict')
      .send({
        cropType: 'rice',
        amountKg: 600,
        warehouseSizeSqm: 200,
        city: 'Delhi',
        temperature: 32,
        humidity: 90,
        insulation: 'poor',
        refrigeration: false,
        baseRemainingDays: 365,
        manufactureDate: '2025-01-15',
        expiryDate: '2026-01-15'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.predictedShelfLifeDays).toBe(123); // matches our mock
    expect(res.body.predictedExpiryDate).toBeDefined();
  });
});
