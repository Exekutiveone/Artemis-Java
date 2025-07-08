import json
import numpy as np
import pandas as pd

PAIRS = [
    ("speed_m_s", "rpm"),
    ("speed_m_s", "distance_m"),
    ("speed_m_s", "steering_deg"),
    ("speed_m_s", "lateral_acc_m_s2"),
    ("accel_m_s2", "rpm"),
    ("steering_deg", "lateral_acc_m_s2"),
    ("speed_m_s", "distance_front_m"),
    ("speed_m_s", "battery_pct"),
]


def compute_pairs(csv_path: str) -> dict:
    df = pd.read_csv(csv_path)
    result = {}
    for x, y in PAIRS:
        X = df[x].values
        Y = df[y].values
        slope, intercept = np.polyfit(X, Y, 1)
        r = np.corrcoef(X, Y)[0, 1]
        result[f"{x}_vs_{y}"] = {
            "x": X.tolist(),
            "y": Y.tolist(),
            "slope": round(float(slope), 4),
            "intercept": round(float(intercept), 4),
            "r": round(float(r), 4),
            "r2": round(float(r * r), 4),
        }
    return result


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Export Regression Data")
    parser.add_argument("csv", help="Input CSV file")
    parser.add_argument("output", help="Output JSON file", nargs="?", default="regression_data.json")
    args = parser.parse_args()

    data = compute_pairs(args.csv)
    with open(args.output, "w") as f:
        json.dump(data, f)
    print(f"Wrote {args.output}")
