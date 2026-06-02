"""
Train XGBoost growth tier classifier on Instagram_Analytics.csv.

Run from repo root (d:\\ratefluencer_ai_ecosystem):

  .venv\\Scripts\\python.exe -m backend.ml.train_growth_classifier

Or from anywhere:

  .venv\\Scripts\\python.exe backend\\ml\\train_growth_classifier.py
"""
from __future__ import annotations

import json
import logging
import sys
from pathlib import Path

# Allow `python backend/ml/train_growth_classifier.py` from any cwd
_REPO_ROOT = Path(__file__).resolve().parents[2]
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))
from typing import Any, Dict, List, Tuple

import joblib  # noqa: E402
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder
from xgboost import XGBClassifier

from backend.ml.growth_features import (
    CATEGORICAL_FEATURES,
    NUMERIC_FEATURES,
    TARGET_COLUMN,
    TIER_COLUMN,
    TIER_LABELS,
    assign_growth_tier,
    engineer_features,
    normalize_column_names,
)

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[1]
DATASET_PATH = BACKEND_DIR / "training_dataset" / "Instagram_Analytics.csv"
MODEL_OUTPUT = BACKEND_DIR / "models" / "growth_classifier.pkl"
REPORT_OUTPUT = BACKEND_DIR / "models" / "growth_classifier_report.json"

def _one_hot_encoder() -> OneHotEncoder:
    try:
        return OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    except TypeError:
        return OneHotEncoder(handle_unknown="ignore", sparse=False)


XGB_PARAMS = {
    "n_estimators": 500,
    "max_depth": 6,
    "learning_rate": 0.05,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "random_state": 42,
    "objective": "multi:softprob",
    "num_class": 3,
    "eval_metric": "mlogloss",
    "n_jobs": -1,
}


def load_and_prepare_data(path: Path = DATASET_PATH) -> pd.DataFrame:
    if not path.is_file():
        raise FileNotFoundError(f"Training dataset not found: {path}")

    df = pd.read_csv(path)
    logger.info("Loaded %s rows, %s columns", len(df), len(df.columns))
    df = normalize_column_names(df)

    if TARGET_COLUMN not in df.columns:
        raise ValueError(f"Missing target column: {TARGET_COLUMN}")

    df = df[df[TARGET_COLUMN].notna()].copy()
    df[TARGET_COLUMN] = pd.to_numeric(df[TARGET_COLUMN], errors="coerce")
    df = df[df[TARGET_COLUMN] >= 0]

    df[TIER_COLUMN] = assign_growth_tier(df[TARGET_COLUMN])
    df = engineer_features(df)

    return df


def build_pipeline() -> Pipeline:
    numeric_transformer = Pipeline(
        steps=[("imputer", SimpleImputer(strategy="median"))]
    )
    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            (
                "encoder",
                _one_hot_encoder(),
            ),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERIC_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ]
    )

    classifier = XGBClassifier(**XGB_PARAMS)

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("classifier", classifier),
        ]
    )


def extract_feature_importance(
    pipeline: Pipeline, top_n: int = 20
) -> List[Dict[str, Any]]:
    preprocessor: ColumnTransformer = pipeline.named_steps["preprocessor"]
    classifier: XGBClassifier = pipeline.named_steps["classifier"]

    feature_names = preprocessor.get_feature_names_out()
    importances = classifier.feature_importances_
    pairs = sorted(
        zip(feature_names, importances),
        key=lambda item: item[1],
        reverse=True,
    )[:top_n]
    return [
        {"feature": name, "importance": float(score)} for name, score in pairs
    ]


def print_evaluation(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    tier_counts: pd.Series,
) -> Dict[str, Any]:
    print("\n========== CLASS DISTRIBUTION ==========")
    for tier_id, label in TIER_LABELS.items():
        count = int((tier_counts == tier_id).sum())
        print(f"{label}: {count}")

    print("\n========== METRICS ==========")
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")

    print("\n========== CONFUSION MATRIX ==========")
    matrix = confusion_matrix(y_true, y_pred, labels=[0, 1, 2])
    print(matrix)
    print("(rows=true, cols=predicted — order: Low, Medium, High)")

    print("\n========== CLASSIFICATION REPORT ==========")
    print(
        classification_report(
            y_true,
            y_pred,
            target_names=[TIER_LABELS[i] for i in sorted(TIER_LABELS)],
            zero_division=0,
        )
    )

    return {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1_score": float(f1),
        "confusion_matrix": matrix.tolist(),
        "class_distribution": {
            TIER_LABELS[tier_id]: int((tier_counts == tier_id).sum())
            for tier_id in TIER_LABELS
        },
    }


def train_growth_classifier(
    *,
    dataset_path: Path = DATASET_PATH,
    model_path: Path = MODEL_OUTPUT,
    test_size: float = 0.2,
) -> Dict[str, Any]:
    df = load_and_prepare_data(dataset_path)

    feature_cols = NUMERIC_FEATURES + CATEGORICAL_FEATURES
    X = df[feature_cols]
    y = df[TIER_COLUMN].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=42,
        stratify=y,
    )

    pipeline = build_pipeline()
    logger.info("Training XGBoost classifier on %s samples...", len(X_train))
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    metrics = print_evaluation(y_test.to_numpy(), y_pred, df[TIER_COLUMN])

    importance = extract_feature_importance(pipeline, top_n=20)
    print("\n========== TOP 20 FEATURE IMPORTANCE ==========")
    for rank, item in enumerate(importance, start=1):
        print(f"{rank:2d}. {item['feature']}: {item['importance']:.6f}")

    bundle: Dict[str, Any] = {
        "pipeline": pipeline,
        "numeric_features": NUMERIC_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "tier_labels": TIER_LABELS,
        "feature_importance": importance,
        "evaluation": metrics,
        "version": "1.0.0",
        "model_type": "XGBClassifier",
    }

    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(bundle, model_path)
    logger.info("Saved model to %s", model_path)

    REPORT_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with open(REPORT_OUTPUT, "w", encoding="utf-8") as handle:
        json.dump(
            {
                "metrics": metrics,
                "feature_importance": importance,
                "model_path": str(model_path),
            },
            handle,
            indent=2,
        )
    print(f"\nEvaluation report saved to {REPORT_OUTPUT}")

    return bundle


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )
    train_growth_classifier()


if __name__ == "__main__":
    main()
