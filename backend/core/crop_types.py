"""
Dynamically extract the set of valid crop-type codes from the training CSV
used by the yield-prediction model.

If a human-readable label is known for a code it is used; otherwise the
raw code is returned as the label so the frontend always has something to
display.
"""

import csv
import os
from pathlib import Path

_BACKEND_DIR = Path(__file__).resolve().parents[1]

TRAINING_CSV = os.path.join(
    _BACKEND_DIR,
    "YieldPredictionModel",
    "Data",
    "CookHandHarvest_HY1999-HY2016_P3A3_20241029(in).csv",
)

# Optional human-readable labels for known crop codes.
_LABEL_MAP: dict[str, str] = {
    "AL": "Alfalfa",
    "GB": "Grain Buckwheat",
    "SB": "Spring Barley",
    "SC": "Spring Canola",
    "SP": "Spring Pea",
    "SW": "Spring Wheat",
    "WB": "Winter Barley",
    "WC": "Winter Canola",
    "WL": "Winter Lentil",
    "WP": "Winter Pea",
    "WT": "Winter Triticale",
    "WW": "Winter Wheat",
}


def _load_crop_codes_from_csv(path: str) -> list[str]:
    """Return sorted unique crop codes from the 'Crop' column of *path*."""
    codes: set[str] = set()
    with open(path, newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            crop = (row.get("Crop") or "").strip()
            if crop:
                codes.add(crop)
    return sorted(codes)


def get_crop_type_choices() -> list[tuple[str, str]]:
    """Return Django-style ``(code, label)`` choices derived from the training CSV."""
    codes = _load_crop_codes_from_csv(TRAINING_CSV)
    return [(code, _LABEL_MAP.get(code, code)) for code in codes]


# Materialised once at import time so the Django model field and serializers
# can reference a stable list.
CROP_TYPE_CHOICES: list[tuple[str, str]] = get_crop_type_choices()
VALID_CROP_CODES: set[str] = {code for code, _ in CROP_TYPE_CHOICES}
