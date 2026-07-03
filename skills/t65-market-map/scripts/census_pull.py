#!/usr/bin/env python3
"""
T65 Market Map -- pulls age + income data from the U.S. Census ACS 5-year API
for a list of ZIP codes (ZCTAs) and ranks them as a Medicare prospecting map.

No third-party packages. Python standard library only.

Requires a free Census API key:  https://api.census.gov/data/key_signup.html
Set it in the environment as CENSUS_API_KEY, or in ~/.config/t65/.env

Usage:
    export CENSUS_API_KEY=xxxxx
    python3 census_pull.py --zips 32720,32724,32763,32725,32738,32713,32744 \
        --label "DeLand region" --out ../examples/deland-report

Outputs <out>.json (raw + computed) and <out>.md (the ranked report).
"""

import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ACS_YEAR = "2022"  # latest ACS 5-year vintage with stable ZCTA coverage
BASE = f"https://api.census.gov/data/{ACS_YEAR}/acs/acs5"

# Census table B01001 = "Sex by Age". These are the bracket variable codes.
# Age 60-64 ("the pipeline", aging into Medicare within 5 years):
PIPELINE_VARS = [
    "B01001_018E",  # Male  60-61
    "B01001_019E",  # Male  62-64
    "B01001_042E",  # Female 60-61
    "B01001_043E",  # Female 62-64
]
# Age 65+ (the current Medicare-eligible market):
MARKET_VARS = [
    "B01001_020E", "B01001_021E", "B01001_022E", "B01001_023E",
    "B01001_024E", "B01001_025E",                # Male  65-66 .. 85+
    "B01001_044E", "B01001_045E", "B01001_046E", "B01001_047E",
    "B01001_048E", "B01001_049E",                # Female 65-66 .. 85+
]
TOTAL_POP = "B01001_001E"          # total population
MEDIAN_INCOME = "B19013_001E"      # median household income (dollars)


def load_api_key():
    key = os.environ.get("CENSUS_API_KEY")
    if key:
        return key.strip()
    env_path = Path.home() / ".config" / "t65" / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            line = line.strip()
            if line.startswith("CENSUS_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit(
        "ERROR: No Census API key found.\n"
        "Get a free key (instant) at https://api.census.gov/data/key_signup.html\n"
        "Then:  export CENSUS_API_KEY=your_key\n"
        "   or put CENSUS_API_KEY=your_key in ~/.config/t65/.env"
    )


def fetch_zcta(zips, variables, key):
    """One ACS call for a comma-list of ZCTAs. Returns {zip: {var: int}}."""
    get = ",".join(["NAME"] + variables)
    params = {
        "get": get,
        "for": "zip code tabulation area:" + ",".join(zips),
        "key": key,
    }
    url = BASE + "?" + urllib.parse.urlencode(params, safe=",: ")
    req = urllib.request.Request(url, headers={"User-Agent": "t65-market-map/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        rows = json.loads(resp.read().decode())
    header, *data = rows
    idx = {name: i for i, name in enumerate(header)}
    out = {}
    for row in data:
        z = row[idx["zip code tabulation area"]]
        rec = {}
        for v in variables:
            raw = row[idx[v]]
            try:
                rec[v] = int(raw)
            except (TypeError, ValueError):
                rec[v] = None  # Census uses negatives/nulls for suppressed values
        out[z] = rec
    return out


def summarize(zips, key):
    age = fetch_zcta(zips, [TOTAL_POP] + PIPELINE_VARS + MARKET_VARS, key)
    inc = fetch_zcta(zips, [MEDIAN_INCOME], key)
    rows = []
    for z in zips:
        a = age.get(z, {})
        total = a.get(TOTAL_POP) or 0
        pipeline = sum(a.get(v) or 0 for v in PIPELINE_VARS)   # 60-64
        market = sum(a.get(v) or 0 for v in MARKET_VARS)       # 65+
        income = inc.get(z, {}).get(MEDIAN_INCOME)
        pct_65 = round(100 * market / total, 1) if total else 0
        rows.append({
            "zip": z,
            "total_pop": total,
            "market_65plus": market,        # current Medicare market
            "pipeline_60_64": pipeline,     # aging in within ~5 yrs
            "pct_65plus": pct_65,
            "median_income": income,
        })
    # Opportunity score: raw 65+ market size weighted up by the share that is
    # 65+ (density = easier targeting) and by income (Medigap affordability).
    for r in rows:
        density = r["pct_65plus"] / 100
        inc_factor = (r["median_income"] or 0) / 60000  # normalize ~national median
        r["opportunity_score"] = round(
            r["market_65plus"] * (0.5 + density) * (0.5 + 0.5 * inc_factor)
        )
    rows.sort(key=lambda r: r["opportunity_score"], reverse=True)
    return rows


def to_markdown(rows, label):
    today = date.today().isoformat()
    total_market = sum(r["market_65plus"] for r in rows)
    total_pipeline = sum(r["pipeline_60_64"] for r in rows)
    lines = [
        f"# T65 Market Map -- {label}",
        f"_Source: U.S. Census ACS {ACS_YEAR} 5-year estimates. Generated {today}._",
        "",
        f"**Current Medicare market (65+): {total_market:,} people across {len(rows)} ZIPs**  ",
        f"**5-year pipeline (age 60-64): {total_pipeline:,} aging in**",
        "",
        "| Rank | ZIP | 65+ market | 60-64 pipeline | % 65+ | Median income | Score |",
        "|----:|:----|----------:|--------------:|-----:|--------------:|------:|",
    ]
    for i, r in enumerate(rows, 1):
        inc = f"${r['median_income']:,}" if r["median_income"] else "n/a"
        lines.append(
            f"| {i} | {r['zip']} | {r['market_65plus']:,} | "
            f"{r['pipeline_60_64']:,} | {r['pct_65plus']}% | {inc} | "
            f"{r['opportunity_score']:,} |"
        )
    lines += [
        "",
        "**How to read this:** *65+ market* = today's Medicare-eligible population. ",
        "*60-64 pipeline* = your built-in future book; these people turn 65 within five ",
        "years and can be marketed to compliantly as they approach eligibility. *Score* ",
        "blends market size, 65+ density (cheaper to target), and income (Medigap ",
        "affordability). Work the top ZIPs first for mailers, seminars, and partner outreach.",
        "",
        "> Compliance: this is market intelligence only -- no contact lists, no PII. ",
        "> Do not cold-call about Medicare Advantage/Part D. See references/medicare-compliance.md.",
    ]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--zips", required=True, help="comma-separated ZIP codes")
    ap.add_argument("--label", default="Target region")
    ap.add_argument("--out", default="t65-report", help="output path prefix")
    args = ap.parse_args()

    zips = [z.strip() for z in args.zips.split(",") if z.strip()]
    key = load_api_key()
    rows = summarize(zips, key)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.with_suffix(".json").write_text(json.dumps(rows, indent=2))
    out.with_suffix(".md").write_text(to_markdown(rows, args.label))
    print(f"Wrote {out.with_suffix('.json')} and {out.with_suffix('.md')}")
    print(to_markdown(rows, args.label))


if __name__ == "__main__":
    main()
