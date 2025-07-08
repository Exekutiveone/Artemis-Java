import pandas as pd
import numpy as np
from drive_style_analyzer import LABELS

LABEL_MAP = {
    "defensive": "Defensiv",
    "normal": "Normal",
    "aggressive": "Aggressiv",
}

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


def compute_regression_pairs(csv_path: str) -> dict:
    """Compute regression statistics for predefined pairs."""
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


def compute_drive_style_series(csv_path: str) -> list:
    """Return driving style score and label for each row of the CSV."""
    df = pd.read_csv(csv_path)
    max_acc = df["accel_m_s2"].abs().max()
    max_steer = df["steering_deg"].abs().max()
    score = ((df["accel_m_s2"].abs() / max_acc) + (df["steering_deg"].abs() / max_steer)) / 2
    labels = score.apply(lambda s: LABELS[0] if s < 0.33 else LABELS[1] if s < 0.66 else LABELS[2])
    german_labels = labels.map(LABEL_MAP)
    series = [
        {"style": style, "score": round(float(sc), 2)}
        for style, sc in zip(german_labels, score)
    ]
    return series
