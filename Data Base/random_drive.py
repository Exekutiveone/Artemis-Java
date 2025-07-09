#!/usr/bin/env python3
# random_drive.py – vollständig zufällige Fahrzeugfahrt

import json
from pathlib import Path

import numpy as np
import pandas as pd

DT = 0.1
N = 3600                              # 6 min

rng = np.random.default_rng(2025)

# Zufallsprozesse
speed = np.zeros(N)
delta_v = rng.normal(0, 1.2, N)       # Schritt­änderungen
for i in range(1, N):
    speed[i] = np.clip(speed[i - 1] + delta_v[i], 0, 40)

accel = np.gradient(speed, DT)
steering = rng.normal(0, 20, N)
heading = np.unwrap(np.cumsum(np.deg2rad(steering) * DT))
lateral_acc = speed**2 * np.tan(np.deg2rad(steering)) / 9.81

dist_step = speed * DT
distance = np.cumsum(dist_step)

rpm = 600 + speed * 180 + rng.normal(0, 60, N)
battery = np.clip(100 - 0.0003 * distance - 0.0001 * np.abs(accel).cumsum(), 0, None)
distance_front = rng.uniform(2, 100, N)

def classify_event(s, a, st, d):
    if s < 0.5:
        return "stand"
    if d < 5:
        return "gefahr"
    if a > 1.5:
        return "beschleunigung"
    if a < -1.5:
        return "bremsung"
    if abs(st) > 15:
        return "kurve"
    return "fahrt"

def classify_manoeuvre(s, st, a):
    if abs(st) < 5:
        return "geradeaus"
    if st > 15:
        return "rechtskurve"
    if st < -15:
        return "linkskurve"
    if a < -3 and s > 10:
        return "notbremsung"
    if s < 2 and abs(st) > 25:
        return "wenden"
    return "normal"

event_code = [classify_event(s, a, st, d) for s, a, st, d in zip(speed, accel, steering, distance_front)]
manoeuvre = [classify_manoeuvre(s, st, a) for s, st, a in zip(speed, steering, accel)]

terrain_choices = ["indoor", "outdoor", "street", "forest", "field", "trail", "unknown"]
weather_choices = ["clear", "rain", "heavy_rain", "wind", "storm", "fog", "snow", "unknown"]
terrain_type = rng.choice(terrain_choices, N)
weather_condition = rng.choice(weather_choices, N)

BASE_LAT = 48.775845
BASE_LON = 9.182932
M_PER_DEG = 111_111
lat = BASE_LAT + np.cumsum(np.cos(heading) * dist_step) / M_PER_DEG
lon = BASE_LON + np.cumsum(np.sin(heading) * dist_step) / (M_PER_DEG * np.cos(np.deg2rad(BASE_LAT)))

df = pd.DataFrame(
    {
        "time_s": np.arange(N) * DT,
        "speed_m_s": speed,
        "rpm": rpm,
        "steering_deg": steering,
        "distance_m": distance,
        "accel_m_s2": accel,
        "lateral_acc_m_s2": lateral_acc,
        "battery_pct": battery,
        "distance_front_m": distance_front,
        "event_code": event_code,
        "manoeuvre": manoeuvre,
        "terrain_type": terrain_type,
        "weather_condition": weather_condition,
        "gps_lat": lat,
        "gps_lon": lon,
    }
)

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

def compute_pairs(d: pd.DataFrame):
    res = {}
    for x, y in PAIRS:
        slope, intercept = np.polyfit(d[x], d[y], 1)
        r = np.corrcoef(d[x], d[y])[0, 1]
        res[f"{x}_vs_{y}"] = {
            "slope": round(float(slope), 4),
            "intercept": round(float(intercept), 4),
            "r": round(float(r), 4),
            "r2": round(float(r * r), 4),
        }
    return res

out_dir = Path(__file__).resolve().parent / "Data Base"
out_dir.mkdir(parents=True, exist_ok=True)
csv_path = out_dir / "fahrtanalyse_daten.csv"
json_path = out_dir / "fahrtanalyse_regression.json"
df.to_csv(csv_path, index=False)
with open(json_path, "w") as f:
    json.dump(compute_pairs(df), f)
