#!/usr/bin/env python3
"""Labyrinth‑Style Drive Simulation

The vehicle moves through a serpentine corridor layout (labyrinth) inside a
bounded rectangle. Each grid step equals `GRID_STEP_M` metres.  Right‑angle
turns generate large steering angles; straight sections keep steering near
zero.  All downstream analytics (event_code, manoeuvre) remain compatible.

Compared to the original circular route, only the path generation and the
resulting dynamics have changed.  All outputs and filenames are identical.
"""
from __future__ import annotations

import math
from pathlib import Path
from typing import List, Tuple

import numpy as np
import pandas as pd

# --- Classification helpers -------------------------------------------------

def classify_event(speed: float, acc: float, steering: float, distance_front: float) -> str:
    if speed < 0.5:
        return "stand"
    if distance_front < 5:
        return "gefahr"
    if acc > 1.5:
        return "beschleunigung"
    if acc < -1.5:
        return "bremsung"
    if abs(steering) > 15:
        return "kurve"
    return "fahrt"


def classify_manoeuvre(speed: float, steering: float, acc: float) -> str:
    if abs(steering) < 5:
        return "geradeaus"
    if steering > 15:
        return "rechtskurve"
    if steering < -15:
        return "linkskurve"
    if acc < -3 and speed > 10:
        return "notbremsung"
    if speed < 2 and abs(steering) > 25:
        return "wenden"
    return "normal"


# --- Path generation --------------------------------------------------------

CENTER_LAT = 48.775845
CENTER_LON = 9.182932
# Mean metres per degree
M_PER_DEG_LAT = 111_139.0
M_PER_DEG_LON = M_PER_DEG_LAT * math.cos(math.radians(CENTER_LAT))

GRID_STEP_M = 4.0  # distance between path points in metres
GRID_W = 40        # cells in x (≈160 m)
GRID_H = 20        # cells in y (≈80 m)


def build_serpentine_path() -> List[Tuple[float, float]]:
    """Return list of (x_m, y_m) coordinates describing a labyrinth path."""
    pts: List[Tuple[float, float]] = []
    for row in range(GRID_H):
        x_range = range(GRID_W) if row % 2 == 0 else range(GRID_W - 1, -1, -1)
        for col in x_range:
            pts.append((col * GRID_STEP_M, row * GRID_STEP_M))
    return pts


PATH_METRIC = build_serpentine_path()
PATH_LEN = len(PATH_METRIC)


# --- Simulation core --------------------------------------------------------

_TERRAIN_CHOICES = np.array(
    ["indoor", "outdoor", "street", "forest", "field", "trail", "unknown"],
    dtype=object,
)
_WEATHER_CHOICES = np.array(
    ["clear", "rain", "heavy_rain", "wind", "storm", "fog", "snow", "unknown"],
    dtype=object,
)


def _meters_to_latlon(x_m: float, y_m: float) -> Tuple[float, float]:
    lat = CENTER_LAT + y_m / M_PER_DEG_LAT
    lon = CENTER_LON + x_m / M_PER_DEG_LON
    return round(lat, 6), round(lon, 6)


def _heading(p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
    """Return heading angle in degrees from p1 to p2 (0° = east, counter‑clockwise positive)."""
    dx, dy = p2[0] - p1[0], p2[1] - p1[1]
    return math.degrees(math.atan2(dy, dx))


def simulate_drive_data(n: int = 3600, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    cols = [
        "speed_m_s",
        "rpm",
        "steering_deg",
        "distance_m",
        "accel_m_s2",
        "lateral_acc_m_s2",
        "battery_pct",
        "distance_front_m",
        "event_code",
        "manoeuvre",
        "terrain_type",
        "weather_condition",
        "gps_lat",
        "gps_lon",
    ]
    records: List[List[float | str]] = []

    battery = 100.0

    # Prepare extended path long enough for n samples
    idx_sequence = np.arange(n) % PATH_LEN

    prev_speed = 0.0
    prev_heading = _heading(PATH_METRIC[0], PATH_METRIC[1])

    for k in idx_sequence:
        p_curr = PATH_METRIC[k]
        p_next = PATH_METRIC[(k + 1) % PATH_LEN]

        # Kinematics
        hdg = _heading(p_curr, p_next)
        steering = (hdg - prev_heading + 180) % 360 - 180  # shortest signed diff
        speed_base = 8.0
        if abs(steering) > 45:
            speed = 2.0
        elif abs(steering) > 15:
            speed = 5.0
        else:
            speed = speed_base + rng.normal(0, 0.5)

        accel = speed - prev_speed
        lateral_acc = (math.radians(steering) * speed ** 2) / 9.81 + rng.normal(0, 0.05)

        distance = 10.0 + rng.normal(0, 2)  # arbitrary placeholder sensor
        distance_front = np.clip(15.0 - 0.3 * abs(steering) + rng.normal(0, 1), 0.5, 50)

        battery = max(0.0, battery - (0.0015 * speed + 0.001 * abs(accel)) + rng.normal(0, 0.003))

        lat, lon = _meters_to_latlon(*p_curr)

        # Classifications
        event = classify_event(speed, accel, steering, distance_front)
        manoeuvre = classify_manoeuvre(speed, steering, accel)

        records.append(
            [
                speed,
                180 * speed + rng.normal(0, 50),  # rpm
                steering,
                distance,
                accel,
                lateral_acc,
                battery,
                distance_front,
                event,
                manoeuvre,
                rng.choice(_TERRAIN_CHOICES),
                rng.choice(_WEATHER_CHOICES),
                lat,
                lon,
            ]
        )

        prev_speed = speed
        prev_heading = hdg

    df = pd.DataFrame(records, columns=cols)
    return df


# --- Entry‑point ------------------------------------------------------------

if __name__ == "__main__":
    df = simulate_drive_data()
    base_dir = Path(__file__).resolve().parent.parent / "Data Base"
    base_dir.mkdir(parents=True, exist_ok=True)

    data_path = base_dir / "fahrtanalyse_daten.csv"
    df.to_csv(data_path, index=False)

    gps_path = base_dir / "gps_route.csv"
    df[["gps_lat", "gps_lon"]].to_csv(gps_path, index=False)

    print(f"CSV geschrieben: {data_path.resolve()}")
    print(f"GPS CSV geschrieben: {gps_path.resolve()}")
