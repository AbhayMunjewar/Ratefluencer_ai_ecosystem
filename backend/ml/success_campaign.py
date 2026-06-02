"""
Train campaign success classifier on campaign_success_dataset CSV.

Run from repo root:
  .venv\\Scripts\\python.exe -m backend.ml.success_campaign

Or:
  .venv\\Scripts\\python.exe backend\\ml\\success_campaign.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
if str(BACKEND_DIR.parent) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR.parent))

TRAINING_DIR = BACKEND_DIR / "training_dataset"
MODEL_OUTPUT = BACKEND_DIR / "models" / "campaign_success_classifier.pkl"
META_OUTPUT = BACKEND_DIR / "models" / "campaign_success_meta.json"

TARGET = "campaign_success"

# Prefer canonical name; fall back to copy with "(1)" in filename
def _resolve_dataset_path() -> Path:
    candidates = [
        TRAINING_DIR / "campaign_success_dataset.csv",
        TRAINING_DIR / "campaign_success_dataset(1).csv",
    ]
    for path in candidates:
        if path.is_file():
            return path
    raise FileNotFoundError(
        f"No campaign dataset found. Expected one of: {[str(p) for p in candidates]}"
    )


def train_campaign_success_classifier() -> dict:
    dataset_path = _resolve_dataset_path()
    df = pd.read_csv(dataset_path)
    print(f"Loaded {len(df)} rows from {dataset_path.name}")

    df.columns = (
        df.columns.str.strip().str.lower().str.replace(" ", "_")
    )

    if TARGET not in df.columns:
        raise KeyError(f"Missing target column '{TARGET}'. Columns: {list(df.columns)}")

    df = df[df[TARGET].notna()].copy()
    df[TARGET] = df[TARGET].astype(int)

    print("\nTarget distribution:")
    print(df[TARGET].value_counts())
    print(f"Success rate: {df[TARGET].mean():.2%}")

    # Post-campaign / outcome proxies — must not be used as inputs
    drop_cols = [
        "influencer_id",
        "influencer_name",
        "username",
        "brand_name",
        "target_audience",
        "estimated_clicks",
        "estimated_ctr",
        "estimated_conversions",
        "estimated_sales",
        "estimated_revenue",
        "estimated_roi",
        TARGET,
    ]
    feature_cols = [c for c in df.columns if c not in drop_cols]
    print(f"\nFeatures used ({len(feature_cols)})")

    x = df[feature_cols]
    y = df[TARGET]

    numeric_features = x.select_dtypes(include=["int64", "float64"]).columns.tolist()
    categorical_features = [c for c in x.columns if c not in numeric_features]

    numeric_transformer = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_transformer = Pipeline(
        [
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )
    preprocessor = ColumnTransformer(
        [
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )
    pipeline = Pipeline([("preprocessor", preprocessor), ("model", model)])

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTrain size: {len(x_train)} | Test size: {len(x_test)}")

    print("\nTraining model...")
    pipeline.fit(x_train, y_train)

    preds = pipeline.predict(x_test)
    proba = pipeline.predict_proba(x_test)[:, 1]
    accuracy = accuracy_score(y_test, preds)
    roc_auc = roc_auc_score(y_test, proba)
    cm = confusion_matrix(y_test, preds)

    print("\n========== RESULTS ==========")
    print(f"Accuracy  : {accuracy:.4f}")
    print(f"ROC-AUC   : {roc_auc:.4f}")
    print(f"\nConfusion Matrix:\n{cm}")
    print(classification_report(y_test, preds, target_names=["Failure", "Success"]))

    feat_names = pipeline.named_steps["preprocessor"].get_feature_names_out()
    importances = pipeline.named_steps["model"].feature_importances_
    imp_df = (
        pd.DataFrame({"feature": feat_names, "importance": importances})
        .sort_values("importance", ascending=False)
    )
    print("\n========== TOP 15 FEATURES ==========")
    print(imp_df.head(15).to_string(index=False))

    meta = {
        "version": "2.0.0-no-leakage",
        "feature_cols": feature_cols,
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "target": TARGET,
        "classes": [0, 1],
        "dataset": str(dataset_path),
        "metrics": {"accuracy": round(accuracy, 4), "roc_auc": round(roc_auc, 4)},
    }

    MODEL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline, "version": meta["version"]}, MODEL_OUTPUT)
    print(f"\nModel saved -> {MODEL_OUTPUT}")
    with open(META_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)
    print(f"Meta saved   -> {META_OUTPUT}")

    return meta


def main() -> None:
    train_campaign_success_classifier()


if __name__ == "__main__":
    main()
