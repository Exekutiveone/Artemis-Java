import json
import pandas as pd
import os
import sys

# Allow importing from this directory when executed as a script
sys.path.insert(0, os.path.dirname(__file__))
from drive_style_analyzer import LABELS

LABEL_MAP = {
    "defensive": "Defensiv",
    "normal": "Normal",
    "aggressive": "Aggressiv",
}


def compute_series(csv_path: str) -> dict:
    df = pd.read_csv(csv_path)
    max_acc = df["accel_m_s2"].abs().max()
    max_steer = df["steering_deg"].abs().max()
    score = ((df["accel_m_s2"].abs() / max_acc) + (df["steering_deg"].abs() / max_steer)) / 2
    labels = score.apply(lambda s: LABELS[0] if s < 0.33 else LABELS[1] if s < 0.66 else LABELS[2])
    german_labels = labels.map(LABEL_MAP)
    return {
        "index": df.index.tolist(),
        "style": german_labels.tolist(),
        "score": score.round(2).tolist(),
    }


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Export drive style series")
    parser.add_argument("csv", help="Input CSV file")
    parser.add_argument("output", nargs="?", default="drive_style_output.json", help="Output JSON file")
    args = parser.parse_args()

    data = compute_series(args.csv)
    with open(args.output, "w") as f:
        json.dump(data, f)
    print(f"Wrote {args.output}")
