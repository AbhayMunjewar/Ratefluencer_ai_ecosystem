"""Audit script for Ratefluencer datasets."""
import csv
import os
import re

DATASET_DIR = r"d:\ratefluencer_ai_ecosystem\backend\dataset"

def parse_count(val: str) -> int:
    val = str(val or "").strip().upper()
    if not val:
        return 0
    multiplier = 1.0
    if val.endswith("M"):
        multiplier = 1_000_000.0
        val = val[:-1]
    elif val.endswith("K"):
        multiplier = 1_000.0
        val = val[:-1]
    elif val.endswith("B"):
        multiplier = 1_000_000_000.0
        val = val[:-1]
    try:
        # strip spaces/commas
        cleaned = val.replace(",", "").replace(" ", "")
        return int(float(cleaned) * multiplier)
    except ValueError:
        return 0

def audit_file(filename: str):
    path = os.path.join(DATASET_DIR, filename)
    if not os.path.isfile(path):
        print(f"File not found: {filename}")
        return

    print(f"\n==========================================")
    print(f"Auditing file: {filename}")
    print(f"File size: {os.path.getsize(path):,} bytes")

    try:
        with open(path, newline="", encoding="utf-8-sig") as f:
            reader = csv.reader(f)
            headers = next(reader, [])
            print(f"Headers: {headers}")

            rows = list(reader)
            print(f"Total row count: {len(rows)}")

            # Check for duplicates or invalid values
            handles = []
            duplicate_rows = 0
            seen_rows = set()
            missing_values = 0
            invalid_followers = 0
            
            for idx, r in enumerate(rows, start=1):
                # Row length check
                if len(r) != len(headers):
                    missing_values += abs(len(r) - len(headers))
                
                # Deduplication check
                r_tuple = tuple(r)
                if r_tuple in seen_rows:
                    duplicate_rows += 1
                seen_rows.add(r_tuple)

                # Column specific checks
                # Find handle index (column containing name or username)
                # Usually column 1 or 2 is the handle
                if len(r) > 1:
                    handles.append(r[1].strip())
                
                # Check follower parseability
                # Find followers column index
                follower_cols = [i for i, h in enumerate(headers) if "follower" in h.lower() or "sub" in h.lower()]
                if follower_cols:
                    f_val = r[follower_cols[0]]
                    parsed_f = parse_count(f_val)
                    if parsed_f == 0 and f_val not in ("", "0"):
                        invalid_followers += 1

            unique_handles = len(set(handles))
            duplicate_handles = len(handles) - unique_handles

            print(f"Duplicate rows (entire row match): {duplicate_rows}")
            print(f"Duplicate influencer handles (column 1): {duplicate_handles}")
            print(f"Rows with potential missing values: {missing_values}")
            print(f"Rows with invalid follower counts: {invalid_followers}")
            print(f"Parsing check: Success")
    except Exception as exc:
        print(f"Failed to read file: {exc}")

if __name__ == "__main__":
    files = os.listdir(DATASET_DIR)
    for f in sorted(files):
        if f.endswith(".csv"):
            audit_file(f)
