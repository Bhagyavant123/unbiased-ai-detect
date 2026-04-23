import pandas as pd
from models.anomaly_model import detect_anomalies

def detect_errors(df: pd.DataFrame):
    report = {}

    # Missing values
    report["missing_values"] = df.isnull().sum().to_dict()

    # Duplicates
    report["duplicates"] = int(df.duplicated().sum())

    # Anomalies
    report["anomalies"] = detect_anomalies(df)

    return report