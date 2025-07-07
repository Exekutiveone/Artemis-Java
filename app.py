#!/usr/bin/env python3
from flask import Flask, render_template
import pandas as pd
from pathlib import Path

CSV_PATH = Path("fahrtanalyse_daten.csv")
app = Flask(__name__)

def load_series():
    df = pd.read_csv(CSV_PATH)
    idx = list(range(len(df)))
    return idx, {
        "speed": df["speed_m_s"].tolist(),
        "rpm": df["rpm"].tolist(),
        "steering": df["steering_deg"].tolist(),
        "distance": df["distance_m"].tolist(),
        "accel": df["speed_m_s"].diff().fillna(0).tolist(),
        "lateral_acc": df["lateral_acc_m_s2"].tolist(),
        "battery": df["battery_pct"].tolist(),
        "distance_front": df["distance_front_m"].tolist(),
        "event": df["event_code"].tolist()
    }

@app.route("/")
def index():
    idx, series = load_series()
    return render_template("chart.html", idx=idx, series=series)

if __name__ == "__main__":
    app.run(debug=True)
