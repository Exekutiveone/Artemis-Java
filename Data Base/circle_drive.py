#!/usr/bin/env python3
# single_circle_strict.py – exakt ein Umlauf, Summe aller Lenk­winkel = 360 °

import json
from pathlib import Path
import numpy as np
import pandas as pd

DT = 0.1
RADIUS_M = 60.0
SPEED_M_S = 15.0
LOOP_TIME = 2 * np.pi * RADIUS_M / SPEED_M_S
STEPS = int(LOOP_TIME / DT) + 1        # +1 für identischen Endpunkt

t = np.arange(STEPS) * DT
theta = 2 * np.pi * t / LOOP_TIME

x = RADIUS_M * np.cos(theta)
y = RADIUS_M * np.sin(theta)

# Fahrdynamik
speed = np.full(STEPS, SPEED_M_S)
heading = theta + np.pi / 2
steering = np.degrees(np.diff(heading, prepend=heading[0]))
steering[-1] += 360.0 - steering.sum()   # Korrektur: Σ steering = 360°

accel = np.diff(speed, prepend=speed[0]) / DT
lat_acc = speed**2 / RADIUS_M
distance_step = speed * DT
distance = np.cumsum(distance_step)

rpm = 600 + speed * 180
battery = np.clip(100 - 0.0003 * distance, 0, None)
distance_front = np.full(STEPS, 25.0)

def ev(s, a, st, d):
    if s < 0.5: return "stand"
    if d < 5:   return "gefahr"
    if a > 1.5: return "beschleunigung"
    if a < -1.5:return "bremsung"
    if abs(st) > 15: return "kurve"
    return "fahrt"

def man(s, st, a):
    if abs(st) < 5: return "geradeaus"
    if st > 15: return "rechtskurve"
    if st < -15: return "linkskurve"
    if a < -3 and s > 10: return "notbremsung"
    if s < 2 and abs(st) > 25: return "wenden"
    return "normal"

event_code = [ev(s, a, st, d) for s, a, st, d in zip(speed, accel, steering, distance_front)]
manoeuvre  = [man(s, st, a)   for s, st, a        in zip(speed, steering, accel)]

terrain_type      = np.full(STEPS, "test_track")
weather_condition = np.full(STEPS, "clear")

BASE_LAT = 48.775845
BASE_LON = 9.182932
M_PER_DEG = 111_111
lat = BASE_LAT + y / M_PER_DEG
lon = BASE_LON + x / (M_PER_DEG * np.cos(np.deg2rad(BASE_LAT)))

df = pd.DataFrame({
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
})

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
        X, Y = d[x].to_numpy(), d[y].to_numpy()
        if np.ptp(X) == 0 or np.ptp(Y) == 0:
            slope, intercept, r = 0.0, float(Y.mean()), 0.0
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

base = Path(__file__).resolve().parent / "Data Base"
base.mkdir(parents=True, exist_ok=True)
(df_path := base / "fahrtanalyse_daten.csv").write_text(df.to_csv(index=False))
with open(base / "single_circle_regression.json", "w") as f:
    json.dump(compute_pairs(df), f)

