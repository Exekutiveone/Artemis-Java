import pandas as pd

LABELS = ["defensive", "normal", "aggressive"]

class DriveStyleAnalyzer:
    """Simple analyzer deriving a style label and score from drive data."""

    def analyze(self, df: pd.DataFrame) -> dict:
        if df.empty:
            raise ValueError("DataFrame is empty")
        # Use absolute acceleration and steering to gauge driving style
        accel = df["accel_m_s2"].abs()
        steering = df["steering_deg"].abs()
        norm = (accel / accel.max()) + (steering / steering.max())
        score = float(norm.mean() / 2 * 100)
        if score < 33:
            label = LABELS[0]
        elif score < 66:
            label = LABELS[1]
        else:
            label = LABELS[2]
        return {"label": label, "score": score}
