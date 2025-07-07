#!/usr/bin/env python3
# interactive_drive_data.py
import pathlib
import numpy as np
import pandas as pd

def ask_float(prompt_text: str, default: float) -> float:
    s = input(f"{prompt_text} [{default}]: ").strip()
    return float(s) if s else default

def ask_int(prompt_text: str, default: int) -> int:
    s = input(f"{prompt_text} [{default}]: ").strip()
    return int(s) if s else default

def simulate(n: int, rpm_coeff: float, steering_speed_slope: float,
             seed: int = 0) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    speed = np.clip(rng.normal(20, 5, n), 0, None)
    rpm = rpm_coeff * speed + rng.normal(0, 100, n)
    steering = rng.normal(0, 5, n) + steering_speed_slope * (speed - 20) + rng.normal(0, 2, n)
    distance = rng.normal(30, 5, n) - 0.5 * steering + rng.normal(0, 3, n)

    return pd.DataFrame({
        "speed_m_s": speed,
        "rpm": rpm,
        "steering_deg": steering,
        "distance_m": distance
    })

def main():
    print("Synthetic driving-data generator\n")

    n = ask_int("Anzahl Beobachtungen", 1000)
    rpm_coeff = ask_float("RPM-Steigung (RPM pro m/s)", 200.0)
    steering_slope = ask_float("Lenkwinkel-Steigung (° pro m/s)", -0.25)
    seed = ask_int("Zufallsseed", 0)
    out_path = input("Ausgabedatei [simulated_drive_data.csv]: ").strip() or "simulated_drive_data.csv"

    df = simulate(n, rpm_coeff, steering_slope, seed)

    p = pathlib.Path(out_path)
    df.to_csv(p, index=False)
    print(f"CSV geschrieben: {p.resolve()}")

if __name__ == "__main__":
    main()
