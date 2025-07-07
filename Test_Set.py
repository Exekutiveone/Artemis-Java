#!/usr/bin/env python3
# generate_drive_data_with_events.py

import numpy as np
import pandas as pd
from pathlib import Path

def classify_event(speed, acc, steering, distance_front):
    """Ereignisklassifikation basierend auf Fahrdaten"""
    if speed < 0.5:
        return "stand"
    elif distance_front < 5:
        return "gefahr"
    elif acc > 1.5:
        return "beschleunigung"
    elif acc < -1.5:
        return "bremsung"
    elif abs(steering) > 15:
        return "kurve"
    else:
        return "fahrt"

def simulate_drive_data(n: int = 1000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    speed = np.clip(rng.normal(20, 5, n), 0, None)
    steering = rng.normal(0, 5, n) - 0.15 * (speed - 20) + rng.normal(0, 1, n)
    rpm = 180 * speed + rng.normal(0, 100, n)
    distance = 35 - 0.4 * speed + rng.normal(0, 3, n)
    lateral_acc = (np.radians(steering) * speed**2) / 9.81 + rng.normal(0, 0.1, n)
    consumption_rate = 0.002 * speed + 0.001 * np.abs(np.gradient(speed))
    battery_pct = np.clip(100 - np.cumsum(consumption_rate + rng.normal(0, 0.01, n)), 0, 100)
    distance_front = np.clip(30 - 0.25 * np.abs(steering) + rng.normal(0, 2, n), 0.5, 100)

    # Beschleunigung approximieren (1. Ableitung von speed)
    acc = np.gradient(speed)

    # Ereignisklassifikation
    event_code = [classify_event(s, a, st, d) for s, a, st, d in zip(speed, acc, steering, distance_front)]

    return pd.DataFrame({
        "speed_m_s": speed,
        "rpm": rpm,
        "steering_deg": steering,
        "distance_m": distance,
        "lateral_acc_m_s2": lateral_acc,
        "battery_pct": battery_pct,
        "distance_front_m": distance_front,
        "event_code": event_code
    })

if __name__ == "__main__":
    df = simulate_drive_data()
    path = Path("fahrtanalyse_daten.csv")
    df.to_csv(path, index=False)
    print(f"CSV geschrieben: {path.resolve()}")
