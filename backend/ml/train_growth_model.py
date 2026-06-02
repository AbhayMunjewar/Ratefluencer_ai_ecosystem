```python
import pandas as pd
import numpy as np
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)
from sklearn.preprocessing import OneHotEncoder

from xgboost import XGBRegressor


# =========================
# CONFIG
# =========================

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent

DATASET_PATH = (
    BACKEND_DIR
    / "training_dataset"
    / "Instagram_Analytics.csv"
)

MODEL_OUTPUT = (
    BACKEND_DIR
    / "models"
    / "growth_model.pkl"
)

TARGET = "followers_gained"


# =========================
# LOAD DATA
# =========================

df = pd.read_csv(DATASET_PATH)

print(f"Rows: {len(df)}")
print(f"Columns: {len(df.columns)}")


# =========================
# CLEAN COLUMN NAMES
# =========================

df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
)

TARGET = TARGET.lower()


# =========================
# REMOVE INVALID TARGETS
# =========================

df = df[df[TARGET].notna()]
df = df[df[TARGET] >= 0]


# =========================
# TARGET ANALYSIS
# =========================

print("\n========== TARGET ANALYSIS ==========")

print(df[TARGET].describe())

print("\n========== TOP TARGET VALUES ==========")

print(
    df[TARGET]
    .value_counts()
    .head(20)
)


# =========================
# FEATURE SELECTION
# =========================

candidate_features = [
    "follower_count",
    "likes",
    "comments",
    "shares",
    "saves",
    "reach",
    "impressions",
    "engagement_rate",
    "caption_length",
    "hashtags_count",
    "post_hour",
    "account_type",
    "content_category",
    "media_type",
    "traffic_source",
    "day_of_week",
    "has_call_to_action",

    "likes_per_follower",
    "comments_per_follower",
    "shares_per_follower",
    "saves_per_follower",
    "reach_per_follower",
    "impressions_per_follower",
]

features = [
    col
    for col in candidate_features
    if col in df.columns
]

print("\nUsing Features:")

for col in features:
    print(" -", col)

X = df[features]
y = np.log1p(df[TARGET])


# =========================
# FEATURE TYPES
# =========================

numeric_features = (
    X.select_dtypes(
        include=["int64", "float64"]
    )
    .columns
    .tolist()
)

categorical_features = [
    c
    for c in X.columns
    if c not in numeric_features
]


# =========================
# PREPROCESSING
# =========================

numeric_transformer = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="median"
            )
        )
    ]
)

categorical_transformer = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(
                strategy="most_frequent"
            )
        ),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore"
            )
        )
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        (
            "num",
            numeric_transformer,
            numeric_features
        ),
        (
            "cat",
            categorical_transformer,
            categorical_features
        )
    ]
)


# =========================
# MODEL
# =========================

model = XGBRegressor(
    n_estimators=1000,
    max_depth=6,
    learning_rate=0.03,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=3,
    objective="reg:squarederror",
    random_state=42,
    n_jobs=-1
)

pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            model
        )
    ]
)


# =========================
# TRAIN TEST SPLIT
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# =========================
# TRAIN
# =========================

print("\nTraining model...")

pipeline.fit(
    X_train,
    y_train
)


# =========================
# FEATURE IMPORTANCE
# =========================

feature_names = (
    pipeline
    .named_steps["preprocessor"]
    .get_feature_names_out()
)

importances = (
    pipeline
    .named_steps["model"]
    .feature_importances_
)

importance_df = pd.DataFrame(
    {
        "feature": feature_names,
        "importance": importances
    }
)

print("\n========== TOP FEATURES ==========")

print(
    importance_df
    .sort_values(
        "importance",
        ascending=False
    )
    .head(20)
)


# =========================
# EVALUATION
# =========================

preds = pipeline.predict(X_test)

mae = mean_absolute_error(
    y_test,
    preds
)

rmse = np.sqrt(
    mean_squared_error(
        y_test,
        preds
    )
)

r2 = r2_score(
    y_test,
    preds
)

print("\n========== RESULTS ==========")

print(f"MAE  : {mae:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")


# =========================
# SAVE MODEL
# =========================

MODEL_OUTPUT.parent.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    pipeline,
    MODEL_OUTPUT
)

print(
    f"\nModel saved to: {MODEL_OUTPUT}"
)
```
