import sys
import os
import pandas as pd

# Allow importing from repository root
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from drive_style_analyzer import DriveStyleAnalyzer, LABELS
from Test_Set import simulate_drive_data

def test_analyzer_outputs_valid_label_and_score():
    df = simulate_drive_data(n=20, seed=0)
    analyzer = DriveStyleAnalyzer()
    result = analyzer.analyze(df)
    assert result['label'] in LABELS
    assert 0 <= result['score'] <= 100
