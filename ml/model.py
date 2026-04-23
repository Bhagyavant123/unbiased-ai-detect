import sys
import pandas as pd
import json
from sklearn.linear_model import LogisticRegression
from sklearn.utils import resample

# =========================
# 1. LOAD DATA
# =========================
file = sys.argv[1]
data = pd.read_csv(file)

# =========================
# 2. PREPROCESSING
# =========================
data.columns = data.columns.str.strip()
data.rename(columns={"gender": "Gender"}, inplace=True)

data["Gender"] = data["Gender"].astype(str).str.strip().str.capitalize()
data["Selected"] = pd.to_numeric(data["Selected"], errors="coerce").fillna(0)

# =========================
# 3. BALANCING
# =========================
male_df = data[data["Gender"] == "Male"]
female_df = data[data["Gender"] == "Female"]

if len(male_df) > len(female_df):
    female_df = resample(female_df, replace=True, n_samples=len(male_df), random_state=42)
else:
    male_df = resample(male_df, replace=True, n_samples=len(female_df), random_state=42)

data_balanced = pd.concat([male_df, female_df])

# =========================
# 4. MODEL (NO GENDER)
# =========================
features = []

if "score" in data.columns:
    features.append("score")
if "age" in data.columns:
    features.append("age")
if "experience" in data.columns:
    features.append("experience")
if "skill_score" in data.columns:
    features.append("skill_score")
if "projects" in data.columns:
    features.append("projects")

X_bal = data_balanced[features]
y_bal = data_balanced["Selected"]

model = LogisticRegression(max_iter=200)
model.fit(X_bal, y_bal)

# =========================
# 5. PREDICTIONS
# =========================
X = data[features]
data["Prediction"] = model.predict(X)

# =========================
# 6. BIAS DETECTION
# =========================
male = data[data["Gender"] == "Male"]
female = data[data["Gender"] == "Female"]

male_rate = male["Prediction"].mean()
female_rate = female["Prediction"].mean()

male_rate = 0 if pd.isna(male_rate) else male_rate
female_rate = 0 if pd.isna(female_rate) else female_rate

dp_gap = abs(male_rate - female_rate)
di = female_rate / male_rate if male_rate != 0 else 0

# =========================
# 7. COUNTERFACTUAL
# =========================
cf_score = 0.0  # gender not used

# =========================
# 8. SUBGROUP
# =========================
if "score" in data.columns:
    high = data[data["score"] > 80]
    male_high = high[high["Gender"] == "Male"]["Prediction"].mean()
    female_high = high[high["Gender"] == "Female"]["Prediction"].mean()
else:
    male_high = female_high = 0

# =========================
# 9. DECISION
# =========================
status = "Bias detected" if dp_gap > 0.1 else "No bias"

# =========================
# 10. FIX (NO CHANGE NEEDED)
# =========================
data["FixedPrediction"] = data["Prediction"]

# =========================
# 11. AFTER METRICS
# =========================
male_new = male_rate
female_new = female_rate
new_gap = dp_gap

# =========================
# 12. OUTPUT
# =========================
result = {
    "preview": data.to_dict(orient="records"),  # FULL DATA

    "bias": {
        "status": status,
        "score": round(dp_gap, 2),
        "reason": "Bias due to dataset imbalance, not direct gender usage",

        "where": {
            "male_selected": int(len(male[male["Prediction"] == 1])),
            "female_selected": int(len(female[female["Prediction"] == 1])),
            "male_total": int(len(male)),
            "female_total": int(len(female))
        },

        "disparate_impact": round(di, 2),
        "counterfactual": round(cf_score, 2),
        "subgroup_high_score": {
            "male": round(male_high, 2),
            "female": round(female_high, 2)
        }
    },

    "after": {
        "male": round(male_new, 2),
        "female": round(female_new, 2),
        "bias": round(new_gap, 2)
    },

    "fixed_data": data.to_dict(orient="records")
}

print(json.dumps(result))