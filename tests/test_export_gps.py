import os
import sys
import tempfile
import pandas as pd

REPO_ROOT = os.path.dirname(os.path.dirname(__file__))
sys.path.insert(0, REPO_ROOT)
sys.path.insert(0, os.path.join(REPO_ROOT, "Driving Data"))

from export_gps_points import export_gps
from Test_Set import simulate_drive_data


def test_export_gps_creates_two_columns():
    df = simulate_drive_data(n=10, seed=0)
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as tmp:
        df.to_csv(tmp.name, index=False)
        path = tmp.name
    try:
        out = tempfile.NamedTemporaryFile(mode="r", suffix=".csv", delete=False)
        out.close()
        export_gps(path, out.name)
        result = pd.read_csv(out.name)
    finally:
        os.remove(path)
        os.remove(out.name)
    assert list(result.columns) == ["gps_lat", "gps_lon"]
    assert len(result) == 10
