# ml/test_ml_api.py
import requests

def test_ml_predict():
    url = 'http://localhost:6000/predict'
    payload = {
        "cropType": "wheat",
        "amountKg": 300,
        "warehouseSizeSqm": 80,
        "city": "Delhi",
        "temperature": 36,
        "humidity": 91,
        "insulation": "poor",
        "refrigeration": False,
        "baseRemainingDays": 330
    }
    resp = requests.post(url, json=payload)
    assert resp.status_code == 200
    assert 'predictedShelfLifeDays' in resp.json()
