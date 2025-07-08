#!/usr/bin/env python3
# test.z.py – erweiterte Simulation mit Manöverklassifikation

import numpy as np
import pandas as pd
from pathlib import Path

def classify_event(speed, acc, steering, distance_front):
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

def classify_manoeuvre(speed, steering, acc):
    if abs(steering) < 5:
        return "geradeaus"
    elif steering > 15:
        return "rechtskurve"
    elif steering < -15:
        return "linkskurve"
    elif acc < -3 and speed > 10:
        return "notbremsung"
    elif speed < 2 and abs(steering) > 25:
        return "wenden"
    else:
        return "normal"

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

    accel = np.gradient(speed)

    event_code = [classify_event(s, a, st, d) for s, a, st, d in zip(speed, accel, steering, distance_front)]
    manoeuvre = [classify_manoeuvre(s, st, a) for s, st, a in zip(speed, steering, accel)]

    terrain_choices = ["indoor", "outdoor", "street", "forest", "field", "trail", "unknown"]
    weather_choices = ["clear", "rain", "heavy_rain", "wind", "storm", "fog", "snow", "unknown"]
    terrain_type = rng.choice(terrain_choices, n)
    weather_condition = rng.choice(weather_choices, n)
    gps_lat = np.round(48.775845 + rng.normal(0, 0.01, n), 6)
    gps_lon = np.round(9.182932 + rng.normal(0, 0.01, n), 6)

    return pd.DataFrame({
        "speed_m_s": speed,
        "rpm": rpm,
        "steering_deg": steering,
        "distance_m": distance,
        "accel_m_s2": accel,
        "lateral_acc_m_s2": lateral_acc,
        "battery_pct": battery_pct,
        "distance_front_m": distance_front,
        "event_code": event_code,
        "manoeuvre": manoeuvre,
        "terrain_type": terrain_type,
        "weather_condition": weather_condition,
        "gps_lat": gps_lat,
        "gps_lon": gps_lon,
    })

if __name__ == "__main__":
    df = simulate_drive_data()
    path = Path("fahrtanalyse_daten.csv")
    df.to_csv(path, index=False)
    print(f"CSV geschrieben: {path.resolve()}")
