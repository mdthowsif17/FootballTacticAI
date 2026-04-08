"""
TactIQ AI - Model Training Script
Trains Random Forest models for 11s, 7s, and 5s match types.
Place this file in the football_app/ directory alongside app.py.
Run: python train.py
"""

import pandas as pd
import pickle
import json
import os
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# ─────────────────────────────────────────────
# CONFIGURATION — update paths if needed
# ─────────────────────────────────────────────
DATASETS = {
    "11s": "datasets/11s_dataset.xlsx",
    "7s":  "datasets/7s_dataset.xlsx",
    "5s":  "datasets/5s_dataset.xlsx",
}
MODELS_DIR   = "models"
STATIC_JS    = "static/js"
RANDOM_STATE = 42
N_ESTIMATORS = 100

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(STATIC_JS,  exist_ok=True)
os.makedirs("datasets",  exist_ok=True)


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def load_11s(path):
    df = pd.read_excel(path)
    return df

def load_7s_or_5s(path):
    """7s and 5s sheets have two blank header rows before real data."""
    df = pd.read_excel(path, skiprows=2, header=None)
    df.columns = [
        "_drop",
        "our_formation", "our_possession_percentage",
        "our_shot", "our_shot_on_target", "our_goal",
        "opp_formation", "opp_possession_percentage",
        "opp_shot", "opp_shot_on_target", "opp_goal",
        "opp_play_style",
        "recom_formation", "recom_play_style",
        "win_probability_increase",
    ]
    df = df.drop(columns=["_drop"]).dropna(subset=["our_formation"]).reset_index(drop=True)
    numeric_cols = [
        "our_possession_percentage", "our_shot", "our_shot_on_target", "our_goal",
        "opp_possession_percentage", "opp_shot", "opp_shot_on_target", "opp_goal",
        "win_probability_increase",
    ]
    for c in numeric_cols:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    return df


def encode_and_train(df, cat_cols, num_cols, out_cols, tag):

    encoders = {}
    df_enc = df.copy()

    for col in cat_cols + out_cols:
        le = LabelEncoder()
        df_enc[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    X = df_enc[cat_cols + num_cols].values
    y_cls = df_enc[out_cols].values
    y_reg = df["win_probability_increase"].values

    # Train / test split for evaluation only
    X_tr, X_te, yc_tr, yc_te, yr_tr, yr_te = train_test_split(
        X, y_cls, y_reg, test_size=0.15, random_state=RANDOM_STATE
    )

    # Classifier
    clf = MultiOutputClassifier(
        RandomForestClassifier(n_estimators=N_ESTIMATORS, random_state=RANDOM_STATE)
    )
    clf.fit(X_tr, yc_tr)
    yc_pred = clf.predict(X_te)
    per_output_acc = [
        accuracy_score(yc_te[:, i], yc_pred[:, i]) for i in range(yc_te.shape[1])
    ]
    clf_acc = sum(per_output_acc) / len(per_output_acc)

    # Regressor
    reg = RandomForestRegressor(n_estimators=N_ESTIMATORS, random_state=RANDOM_STATE)
    reg.fit(X_tr, yr_tr)
    reg_score = reg.score(X_te, yr_te)

    # Re-train on full data for deployment
    clf.fit(X, y_cls)
    reg.fit(X, y_reg)

    model_bundle = {
        "clf":      clf,
        "reg":      reg,
        "encoders": encoders,
        "cat_cols": cat_cols,
        "num_cols": num_cols,
        "out_cols": out_cols,
    }

    out_path = os.path.join(MODELS_DIR, f"model_{tag}.pkl")
    with open(out_path, "wb") as f:
        pickle.dump(model_bundle, f)

    return encoders


# ─────────────────────────────────────────────
# 11-a-SIDE
# ─────────────────────────────────────────────
def train_11s():
    df = load_11s(DATASETS["11s"])

    cat_cols = [
        "our_formation", "our_pressing_level",
        "opp_formation", "opp_pressing_level",
        "opp_attack_side", "opp_play_style",
    ]
    num_cols = [
        "our_possession_percentage", "our_shot", "our_shot_target", "our_goal_count",
        "opp_possession_percentage", "opp_shot", "opp_shot_on_target", "opp_goal_count",
    ]
    out_cols = [
        "recom_formation", "recom_playstyle",
        "recom_pressing_level", "recom_defensive_line", "recom_focus_side",
    ]

    return encode_and_train(df, cat_cols, num_cols, out_cols, "11s")


# ─────────────────────────────────────────────
# 7-a-SIDE
# ─────────────────────────────────────────────
def train_7s():
    df = load_7s_or_5s(DATASETS["7s"])

    cat_cols = ["our_formation", "opp_formation", "opp_play_style"]
    num_cols = [
        "our_possession_percentage", "our_shot", "our_shot_on_target", "our_goal",
        "opp_possession_percentage", "opp_shot", "opp_shot_on_target", "opp_goal",
    ]
    out_cols = ["recom_formation", "recom_play_style"]

    return encode_and_train(df, cat_cols, num_cols, out_cols, "7s")


# ─────────────────────────────────────────────
# 5-a-SIDE
# ─────────────────────────────────────────────
def train_5s():
    df = load_7s_or_5s(DATASETS["5s"])

    cat_cols = ["our_formation", "opp_formation", "opp_play_style"]
    num_cols = [
        "our_possession_percentage", "our_shot", "our_shot_on_target", "our_goal",
        "opp_possession_percentage", "opp_shot", "opp_shot_on_target", "opp_goal",
    ]
    out_cols = ["recom_formation", "recom_play_style"]

    return encode_and_train(df, cat_cols, num_cols, out_cols, "5s")


# ─────────────────────────────────────────────
# SAVE LABEL MAP  (used by frontend autocomplete)
# ─────────────────────────────────────────────
def save_label_data(enc_11s, enc_7s, enc_5s):
    label_data = {
        "11s": {col: le.classes_.tolist() for col, le in enc_11s.items()},
        "7s":  {col: le.classes_.tolist() for col, le in enc_7s.items()},
        "5s":  {col: le.classes_.tolist() for col, le in enc_5s.items()},
    }
    out_path = os.path.join(STATIC_JS, "label_data.json")
    with open(out_path, "w") as f:
        json.dump(label_data, f, indent=2)


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":

    enc_11s = train_11s()
    enc_7s  = train_7s()
    enc_5s  = train_5s()

    save_label_data(enc_11s, enc_7s, enc_5s)