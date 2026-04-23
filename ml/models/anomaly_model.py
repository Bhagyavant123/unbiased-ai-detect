from sklearn.ensemble import IsolationForest

def detect_anomalies(df):
    numeric_df = df.select_dtypes(include=['number'])

    if numeric_df.empty:
        return "No numeric data"

    model = IsolationForest(contamination=0.05)
    preds = model.fit_predict(numeric_df)

    anomalies = numeric_df[preds == -1]
    return anomalies.to_dict(orient="records")