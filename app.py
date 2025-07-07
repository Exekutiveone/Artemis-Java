#!/usr/bin/env python3
from flask import Flask, render_template
import pandas as pd
from pathlib import Path

CSV_PATH = Path("simulated_drive_data.csv")
app = Flask(__name__)

def load_series():
    df = pd.read_csv(CSV_PATH)
    idx = list(range(len(df)))
    return idx, {
        "speed":    df["speed_m_s"].tolist(),
        "rpm":      df["rpm"].tolist(),
        "steering": df["steering_deg"].tolist(),
        "distance": df["distance_m"].tolist()
    }

@app.route("/")
def index():
    idx, series = load_series()
    return render_template("index.html", idx=idx, series=series)

if __name__ == "__main__":
    app.run(debug=True)
