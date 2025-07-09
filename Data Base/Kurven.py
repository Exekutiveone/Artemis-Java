#!/usr/bin/env python3
# circle_drive.py – konstante Kreisfahrt mit drei Umläufen, robuste Regressions­berechnung (NumPy ≥2.0)

import json
from pathlib import Path

import numpy as np
import pandas as pd

DT = 0.1
RADIUS_M = 60
LOOPS = 3
SPEED_M_S = 15
CIRCUMFERENCE = 2 * np.pi * RADIUS_M
TOTAL_TIME = (CIRCUMFERENCE * LOOPS) / SPEED_M_S
STEPS = int(TOTAL_TIME / DT)

t = np.arange(STEPS) * DT
theta = 2 * np.pi * LOOPS * t / TOTAL_TIME

x = RADIUS_M * np.cos(theta)
y = RADIUS_M * np.sin(theta)

dx = np.gradient(x, DT)
dy = np.gradient(y, DT)
speed = np.hypot(dx, dy) + np.random.normal(0, 0.2, STEPS)
heading = np.unwrap(np.arctan2(dy, dx))
steering = np.degrees(np.gradient(heading, DT))
accel = np.gradient(speed, DT)
lat_acc = speed**2 / RADIUS_M

distance_step = speed * DT
distance = np.cumsum(distance_step)

rpm = 600 + speed * 180 + np.random.normal(0, 40, STEPS)
battery = np.clip(100 - 0.0003 * distance - 0.00005 * np.abs(accel).cumsum(), 0, None)
distance_front = np.full(STEPS, 25.0)

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

terrain_type = np.full(STEPS, "test_track")
weather_condition = np.full(STEPS, "clear")

BASE_LAT = 48.775845
BASE_LON = 9.182932
M_PER_DEG = 111_111
lat = BASE_LAT + y / M_PER_DEG
lon = BASE_LON + x / (M_PER_DEG * np.cos(np.deg2rad(BASE_LAT)))

df = pd.DataFrame(
    {
        "time_s": t,
        "speed_m_s": speed,
        "rpm": rpm,
        "steering_deg": steering,
        "distance_m": distance,
        "accel_m_s2": accel,
        "lateral_acc_m_s2": lat_acc,
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
        X = d[x].values
        Y = d[y].values
        if np.ptp(X) == 0 or np.ptp(Y) == 0:
            slope = 0.0
            intercept = float(Y.mean())
            r = 0.0
        else:
            slope, intercept = np.polyfit(X, Y, 1)
            r = np.corrcoef(X, Y)[0, 1]
        res[f"{x}_vs_{y}"] = {
            "slope": round(slope, 4),
            "intercept": round(intercept, 4),
            "r": round(r, 4),
            "r2": round(r * r, 4),
        }
    return res

out_dir = Path(__file__).resolve().parent / "Data Base"
out_dir.mkdir(parents=True, exist_ok=True)
csv_path = out_dir / "circle_drive.csv"
json_path = out_dir / "circle_regression.json"
df.to_csv(csv_path, index=False)
with open(json_path, "w") as f:
    json.dump(compute_pairs(df), f)
