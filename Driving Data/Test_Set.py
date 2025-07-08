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

    # Generate a GPS path that follows the simulated motion data. The previous
    # implementation picked a random heading at each step, which produced an
    # erratic route.  We now integrate the steering angle over time so the
    # vehicle travels along a coherent path.
    gps_lat = np.empty(n)
    gps_lon = np.empty(n)
    gps_lat[0] = 48.775845
    gps_lon[0] = 9.182932
    heading = 0.0
    for i in range(1, n):
        step = speed[i] * 1e-5 * rng.uniform(0.8, 1.2)
        heading += np.radians(steering[i]) / 5
        gps_lat[i] = gps_lat[i - 1] + step * np.cos(heading)
        gps_lon[i] = gps_lon[i - 1] + step * np.sin(heading)
    gps_lat = np.round(gps_lat, 6)
    gps_lon = np.round(gps_lon, 6)

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
    base_dir = Path(__file__).resolve().parent.parent / "Data Base"
    data_path = base_dir / "fahrtanalyse_daten.csv"
    df.to_csv(data_path, index=False)

    # Export GPS points separately for easy use with mapping tools
    gps_path = base_dir / "gps_route.csv"
    df[["gps_lat", "gps_lon"]].to_csv(gps_path, index=False)

    print(f"CSV geschrieben: {data_path.resolve()}")
    print(f"GPS CSV geschrieben: {gps_path.resolve()}")
