// tests/mlpredict.test.js
const request = require('supertest');
const app = require('../app'); // Or wherever you export your Express app

describe('ML Prediction API', () => {
  it('predicts shelf life using ML API', async () => {
    const res = await request(app)
      .post('/api/mlpredict')
      .send({
        cropType: 'rice',
        amountKg: 600,
        warehouseSizeSqm: 200,
        city: 'Delhi',
        temperature: 32,
        humidity: 90,
        insulation: 'poor',
        refrigeration: false,
        manufactureDate: '2025-01-15',
        expiryDate: '2026-01-15'
      });
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.predictedShelfLifeDays).toBe('number');
    expect(res.body.predictedExpiryDate).toBeDefined();
  });
});
