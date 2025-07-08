import argparse
import pandas as pd
from pathlib import Path


def export_gps(csv_path: str, output_path: str) -> None:
    df = pd.read_csv(csv_path, usecols=["gps_lat", "gps_lon"])
    df.to_csv(output_path, index=False)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Export GPS coordinates")
    parser.add_argument("csv", help="Input CSV file")
    parser.add_argument("output", nargs="?", default="gps_route.csv", help="Output CSV file")
    args = parser.parse_args()

    export_gps(args.csv, args.output)
    print(f"Wrote {Path(args.output).resolve()}")
