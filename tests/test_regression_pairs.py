import os
import sys
import tempfile

REPO_ROOT = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, REPO_ROOT)
sys.path.insert(0, os.path.join(REPO_ROOT, "Driving Data"))

from analysis_utils import compute_regression_pairs, PAIRS
from Test_Set import simulate_drive_data
from app import app


def test_compute_regression_pairs_returns_keys():
    df = simulate_drive_data(n=20, seed=0)
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as tmp:
        df.to_csv(tmp.name, index=False)
        path = tmp.name
    try:
        result = compute_regression_pairs(path)
    finally:
        os.remove(path)
    assert isinstance(result, dict)
    for x, y in PAIRS:
        assert f"{x}_vs_{y}" in result


def test_api_regression_pairs():
    client = app.test_client()
    resp = client.get("/api/regression_pairs")
    assert resp.status_code == 200
    data = resp.get_json()
    assert isinstance(data, dict)
    k = f"{PAIRS[0][0]}_vs_{PAIRS[0][1]}"
    assert k in data

