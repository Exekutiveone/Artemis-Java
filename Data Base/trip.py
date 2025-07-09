#!/usr/bin/env python3
# realistic_drive_var_distance.py – Mischfahrt mit zufällig gestreckten/gestauchten Wegabschnitten

import json
from pathlib import Path

import numpy as np
import pandas as pd

DT = 0.1
SEGMENTS = [
    (30, 0, 0, "idle"),          # Stand
    (15, 0, 13.9, "accel_urban"),
    (120, 13.9, 13.9, "city"),
    (20, 13.9, 27.8, "accel_highway"),
    (200, 27.8, 27.8, "highway"),
    (25, 27.8, 0, "decel_exit"),
    (10, 0, 0, "idle"),
]

TOTAL_STEPS = int(sum(s[0] for s in SEGMENTS) / DT)
speed = np.zeros(TOTAL_STEPS)

idx = 0
rng = np.random.default_rng(42)
for duration, v0, v1, mode in SEGMENTS:
    steps = int(duration / DT)
    stretch = rng.uniform(0.8, 1.25)       # zufällig größere/kleinere Weglänge
    if v0 == v1:
        base = np.full(steps, v0)
    else:
        base = np.linspace(v0, v1, steps)
    if mode == "city":
        base += 1.5 * np.sin(0.3 * np.arange(steps))
        for k in range(0, steps, int(30 / DT)):
            base[k : k + int(5 / DT)] = 0
    if mode == "highway":
        base += 0.8 * np.sin(0.15 * np.arange(steps))
    noise = rng.normal(0, 0.3, steps)
    speed[idx : idx + steps] = np.clip((base + noise) * stretch, 0, None)
    idx += steps

time = np.arange(TOTAL_STEPS) * DT
accel = np.gradient(speed, DT)
dist_step = speed * DT
distance = np.cumsum(dist_step)

heading = np.zeros(TOTAL_STEPS)
heading[np.where((speed > 0) & (time % 60 < 10))] = np.deg2rad(45)
heading += rng.normal(0, 0.02, TOTAL_STEPS)  # kleine Richtungsstreuung
steering = np.degrees(np.gradient(heading, DT))
lateral_acc = speed ** 2 * np.tan(np.deg2rad(steering)) / 9.81

rpm = 500 + speed * 210 + rng.normal(0, 40, TOTAL_STEPS)
battery = 100 - 0.00025 * distance - 0.00005 * np.cumsum(abs(accel) * DT)
battery = np.clip(battery, 0, None)

distance_front = np.clip(speed * 1.6 + 5 + rng.normal(0, 1.5, TOTAL_STEPS), 2, 200)

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

terrain_type = np.where(time < 165, "urban", np.where(time < 360, "highway", "urban"))
weather_condition = np.full(TOTAL_STEPS, "clear")

BASE_LAT = 48.775845
BASE_LON = 9.182932
M_PER_DEG = 111_111
lat = BASE_LAT + (distance * np.cos(heading)).cumsum() / M_PER_DEG
lon = BASE_LON + (distance * np.sin(heading)).cumsum() / (M_PER_DEG * np.cos(np.deg2rad(BASE_LAT)))

df = pd.DataFrame(
    {
        "time_s": time,
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

base_dir = Path(__file__).resolve().parent / "Data Base"
base_dir.mkdir(parents=True, exist_ok=True)
csv_path = base_dir / "realistic_drive_var_distance.csv"
json_path = base_dir / "realistic_regression_var_distance.json"
df.to_csv(csv_path, index=False)
with open(json_path, "w") as f:
    json.dump(compute_pairs(df), f)
