#!/usr/bin/env python3
from flask import Flask, render_template
import pandas as pd
from pathlib import Path
import os

CSV_PATH = Path(__file__).resolve().parent / "fahrtanalyse_daten.csv"

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Verhindert Browser-Caching statischer Dateien

def load_series():
    df = pd.read_csv(CSV_PATH)
    idx = list(range(len(df)))
    return idx, {
        "speed": df["speed_m_s"].tolist(),
        "rpm": df["rpm"].tolist(),
        "steering": df["steering_deg"].tolist(),
        "distance": df["distance_m"].tolist(),
        "accel": df["accel_m_s2"].tolist(),
        "lateral_acc": df["lateral_acc_m_s2"].tolist(),
        "battery": df["battery_pct"].tolist(),
        "distance_front": df["distance_front_m"].tolist(),
        "event": df["event_code"].tolist(),
        "manoeuvre": df["manoeuvre"].tolist(),
        "terrain_type": df["terrain_type"].tolist(),
        "weather_condition": df["weather_condition"].tolist(),
        "gps_lat": df["gps_lat"].round(6).tolist(),
        "gps_lon": df["gps_lon"].round(6).tolist(),
    }

@app.route("/")
def index():
    idx, series = load_series()
    return render_template("chart.html", idx=idx, series=series)

if __name__ == "__main__":
    app.run(debug=True)
