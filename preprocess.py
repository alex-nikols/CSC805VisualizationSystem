#!/usr/bin/env python3
"""
Preprocess US Accidents CSV data into aggregated JSON files for the visualization dashboard.
Reads all 4 CSV parts from US_Accidents_Full2022_parts/ and outputs JSON to public/data/.
"""

import csv
import json
import os
from collections import defaultdict
from pathlib import Path

# Column indices based on the US Accidents dataset schema.
# Header: ID,Source,Severity,Start_Time,End_Time,Start_Lat,Start_Lng,End_Lat,End_Lng,
#   Distance(mi),Description,Street,City,County,State,Zipcode,Country,Timezone,
#   Airport_Code,Weather_Timestamp,Temperature(F),Wind_Chill(F),Humidity(%),Pressure(in),
#   Visibility(mi),Wind_Direction,Wind_Speed(mph),Precipitation(in),Weather_Condition,...
COL_ID = 0
COL_SEVERITY = 2
COL_START_TIME = 3
COL_START_LAT = 5
COL_START_LNG = 6
COL_DISTANCE = 9
COL_DESCRIPTION = 10
COL_STREET = 11
COL_CITY = 12
COL_COUNTY = 13
COL_STATE = 14
COL_TEMPERATURE = 20
COL_HUMIDITY = 22
COL_VISIBILITY = 24
COL_WIND_SPEED = 26
COL_PRECIPITATION = 27
COL_WEATHER_CONDITION = 28

DATA_DIR = Path("US_Accidents_Full2022_parts")
OUTPUT_DIR = Path("public/data")
CSV_FILES = sorted(DATA_DIR.glob("US_Accidents_Full2022_*.csv"))

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def parse_datetime(dt_str):
    """Parse datetime string like '1/1/2022 0:06' and return (year, month, day_of_week, hour)."""
    try:
        date_part, time_part = dt_str.strip().split(" ")
        parts = date_part.split("/")
        month = int(parts[0])
        day = int(parts[1])
        year = int(parts[2])
        hour = int(time_part.split(":")[0])
        # Calculate day of week (0=Mon, 6=Sun) using Zeller-like approach
        import datetime
        dow = datetime.date(year, month, day).weekday()
        return year, month, dow, hour
    except (ValueError, IndexError):
        return None


def safe_int(val, default=0):
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def safe_float(val, default=0.0):
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Accumulators
    total_accidents = 0
    severity_counts = defaultdict(int)  # severity -> count
    year_counts = defaultdict(int)      # year -> count
    month_counts = defaultdict(int)     # month(1-12) -> count
    county_severity = defaultdict(lambda: defaultdict(int))  # (county, state) -> severity -> count
    county_total = defaultdict(int)     # (county, state) -> total count
    hour_counts = defaultdict(int)      # hour -> count
    day_hour_counts = defaultdict(int)   # (dow, hour) -> count
    state_severity = defaultdict(lambda: defaultdict(int))  # state -> severity -> count
    state_total = defaultdict(int)       # state -> total count
    # Weather buckets
    visibility_buckets = defaultdict(int)
    wind_speed_buckets = defaultdict(int)
    precipitation_buckets = defaultdict(int)

    print("Reading CSV files...")
    for csv_file in CSV_FILES:
        print(f"  Processing {csv_file.name}...")
        with open(csv_file, "r", encoding="utf-8", errors="replace") as f:
            reader = csv.reader(f)
            for row in reader:
                if len(row) < 29:
                    continue
                # Skip header rows (files 2-4 have headers)
                if row[COL_ID] == "ID":
                    continue

                total_accidents += 1
                severity = safe_int(row[COL_SEVERITY])
                severity_counts[severity] += 1

                dt = parse_datetime(row[COL_START_TIME])
                if dt:
                    year, month, dow, hour = dt
                    year_counts[year] += 1
                    month_counts[month] += 1
                    hour_counts[hour] += 1
                    day_hour_counts[(dow, hour)] += 1

                county = row[COL_COUNTY].strip()
                state = row[COL_STATE].strip()
                if county and state:
                    key = (county, state)
                    county_severity[key][severity] += 1
                    county_total[key] += 1

                if state:
                    state_severity[state][severity] += 1
                    state_total[state] += 1

                # Weather: visibility buckets
                vis = safe_float(row[COL_VISIBILITY], default=-1)
                if vis >= 0:
                    if vis < 1:
                        visibility_buckets["< 1 mi"] += 1
                    elif vis < 5:
                        visibility_buckets["1-5 mi"] += 1
                    elif vis < 10:
                        visibility_buckets["5-10 mi"] += 1
                    else:
                        visibility_buckets["10+ mi"] += 1

                # Weather: wind speed buckets
                ws = safe_float(row[COL_WIND_SPEED], default=-1)
                if ws >= 0:
                    if ws < 5:
                        wind_speed_buckets["Calm (< 5 mph)"] += 1
                    elif ws < 15:
                        wind_speed_buckets["Light (5-15 mph)"] += 1
                    elif ws < 25:
                        wind_speed_buckets["Moderate (15-25 mph)"] += 1
                    else:
                        wind_speed_buckets["Strong (25+ mph)"] += 1

                # Weather: precipitation buckets
                precip = safe_float(row[COL_PRECIPITATION], default=-1)
                if precip >= 0:
                    if precip == 0:
                        precipitation_buckets["None (0 in)"] += 1
                    elif precip < 0.1:
                        precipitation_buckets["Light (< 0.1 in)"] += 1
                    elif precip < 0.5:
                        precipitation_buckets["Moderate (0.1-0.5 in)"] += 1
                    else:
                        precipitation_buckets["Heavy (0.5+ in)"] += 1

    print(f"Total accidents processed: {total_accidents}")

    # --- summary.json ---
    # Danger score per county: (1*N1 + 2*N2 + 3*N3 + 4*N4) / T
    avg_danger_scores = []
    county_danger_map = {}
    for key, sev_counts in county_severity.items():
        t = county_total[key]
        if t == 0:
            continue
        score = sum(s * sev_counts.get(s, 0) for s in range(1, 5)) / t
        county_danger_map[key] = score
        avg_danger_scores.append(score)

    # Overall average danger score
    overall_danger = sum(s * severity_counts.get(s, 0) for s in range(1, 5)) / total_accidents if total_accidents else 0

    # Most dangerous county (highest danger score, with minimum threshold of accidents)
    # Use top county by danger score among counties with at least 100 accidents
    qualified_counties = {k: v for k, v in county_danger_map.items() if county_total[k] >= 100}
    if qualified_counties:
        most_dangerous_key = max(qualified_counties, key=qualified_counties.get)
        most_dangerous = {
            "name": f"{most_dangerous_key[0]}, {most_dangerous_key[1]}",
            "score": round(qualified_counties[most_dangerous_key], 2)
        }
    else:
        most_dangerous = {"name": "N/A", "score": 0}

    # Peak hour
    peak_hour = max(hour_counts, key=hour_counts.get) if hour_counts else 0

    summary = {
        "totalAccidents": total_accidents,
        "avgDangerScore": round(overall_danger, 2),
        "mostDangerousCounty": most_dangerous,
        "peakHour": peak_hour
    }

    # --- by_year.json ---
    by_year = [{"year": y, "count": year_counts[y]} for y in sorted(year_counts.keys())]

    # --- by_severity.json ---
    by_severity = [{"severity": s, "count": severity_counts[s]} for s in sorted(severity_counts.keys()) if s >= 1]

    # --- by_month.json ---
    by_month = [{"month": MONTH_NAMES[m - 1], "count": month_counts[m]} for m in range(1, 13)]

    # --- by_county_danger.json ---
    # Top 50 counties by danger score (min 100 accidents)
    county_danger_list = []
    for key, score in county_danger_map.items():
        if county_total[key] >= 100:
            county_danger_list.append({
                "county": key[0],
                "state": key[1],
                "score": round(score, 2),
                "count": county_total[key]
            })
    county_danger_list.sort(key=lambda x: x["score"], reverse=True)
    by_county_danger = county_danger_list[:50]

    # --- by_weather.json ---
    def bucket_list(buckets, order):
        total = sum(buckets.values())
        return [
            {"label": label, "count": buckets.get(label, 0),
             "percentage": round(buckets.get(label, 0) / total * 100, 1) if total else 0}
            for label in order
        ]

    by_weather = {
        "visibility": bucket_list(visibility_buckets,
                                  ["< 1 mi", "1-5 mi", "5-10 mi", "10+ mi"]),
        "windSpeed": bucket_list(wind_speed_buckets,
                                 ["Calm (< 5 mph)", "Light (5-15 mph)",
                                  "Moderate (15-25 mph)", "Strong (25+ mph)"]),
        "precipitation": bucket_list(precipitation_buckets,
                                     ["None (0 in)", "Light (< 0.1 in)",
                                      "Moderate (0.1-0.5 in)", "Heavy (0.5+ in)"])
    }

    # --- by_day_hour.json ---
    DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    by_day_hour = []
    for dow in range(7):
        row_data = {"day": DAY_NAMES[dow]}
        row_data["hours"] = [day_hour_counts.get((dow, h), 0) for h in range(24)]
        by_day_hour.append(row_data)

    # --- by_state.json ---
    by_state = []
    for st in sorted(state_total.keys()):
        t = state_total[st]
        score = sum(s * state_severity[st].get(s, 0) for s in range(1, 5)) / t if t else 0
        by_state.append({
            "state": st,
            "count": t,
            "dangerScore": round(score, 2)
        })

    # Write outputs
    for filename, data in [
        ("summary.json", summary),
        ("by_year.json", by_year),
        ("by_severity.json", by_severity),
        ("by_month.json", by_month),
        ("by_county_danger.json", by_county_danger),
        ("by_weather.json", by_weather),
        ("by_day_hour.json", by_day_hour),
        ("by_state.json", by_state),
    ]:
        path = OUTPUT_DIR / filename
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        size_mb = os.path.getsize(path) / (1024 * 1024)
        print(f"  Written {filename} ({size_mb:.2f} MB)")

    print("Done! Preprocessing complete.")


if __name__ == "__main__":
    main()
