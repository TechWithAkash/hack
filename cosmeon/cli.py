import sys
import json
import logging
import traceback
from datetime import datetime
import os
import sys

# Ensure the project root is in sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
sys.path.insert(0, project_root)

import ee

from cosmeon.config import init_gee
from cosmeon.pipeline.runner import run as run_pipeline
from cosmeon.core.satellite import get_tile_url

# Silence ee logger
logging.getLogger('googleapiclient.discovery_cache').setLevel(logging.ERROR)

def process():
    try:
        # 1. Read input JSON from stdin
        input_data = sys.stdin.read()
        cfg = json.loads(input_data)

        # Ensure correct types for dates
        if "pre_start" in cfg and isinstance(cfg["pre_start"], str):
            cfg["pre_start"] = datetime.strptime(cfg["pre_start"], "%Y-%m-%d").date()
        if "pre_end" in cfg and isinstance(cfg["pre_end"], str):
            cfg["pre_end"] = datetime.strptime(cfg["pre_end"], "%Y-%m-%d").date()
        if "post_start" in cfg and isinstance(cfg["post_start"], str):
            cfg["post_start"] = datetime.strptime(cfg["post_start"], "%Y-%m-%d").date()
        if "post_end" in cfg and isinstance(cfg["post_end"], str):
            cfg["post_end"] = datetime.strptime(cfg["post_end"], "%Y-%m-%d").date()

        # 2. Run Pipeline (handles GEE init internally if not done)
        results = run_pipeline(cfg)

        # 3. Serialize GEE Image objects into Map IDs
        tiles = {}
        sar_vis = {"min": -25, "max": 0, "palette": ["#0a0e1a", "#2d4a6e", "#a8c7e8"]}
        flood_vis = {"palette": ["#00d4ff"], "opacity": 0.85}
        opt_water_vis = {"palette": ["#8b5cf6"], "opacity": 0.6}
        veg_loss_vis = {"palette": ["#ff6b35"], "opacity": 0.7}
        conf_vis = {"min": 0, "max": 1, "palette": ["#1a1a2e", "#4a4a8c", "#ffffff"]}
        ndvi_diff_vis = {"min": -0.5, "max": 0.5, "palette": ["#ef4444", "#f97316", "#fef3c7", "#86efac", "#16a34a"]}

        if "pre_s1" in results and results["pre_s1"]:
            tiles["pre_s1"] = get_tile_url(results["pre_s1"].select("VV"), sar_vis)
        if "post_s1" in results and results["post_s1"]:
            tiles["post_s1"] = get_tile_url(results["post_s1"].select("VV"), sar_vis)
        if "flood" in results and results["flood"]:
            tiles["flood"] = get_tile_url(results["flood"].selfMask(), flood_vis)
            
        if results.get("ndvi_available"):
            if "optical_flood" in results and results["optical_flood"]:
                tiles["optical_flood"] = get_tile_url(results["optical_flood"].selfMask(), opt_water_vis)
            if "ndvi_loss" in results and results["ndvi_loss"]:
                tiles["ndvi_loss"] = get_tile_url(results["ndvi_loss"].selfMask(), veg_loss_vis)
            if "ndvi_diff" in results and results["ndvi_diff"]:
                tiles["ndvi_diff"] = get_tile_url(results["ndvi_diff"], ndvi_diff_vis)
                
        if "confidence" in results and results["confidence"]:
            tiles["confidence"] = get_tile_url(results["confidence"], conf_vis)

        # 4. Strip out ee objects and prepare final JSON
        output = {
            "success": True,
            "metrics": {
                "flood_area": results.get("flood_area", 0),
                "ndvi_loss_area": results.get("ndvi_loss_area", 0),
                "exposed_pop": results.get("exposed_pop", 0),
                "peak_confidence": results.get("peak_confidence", 0),
                "severity_score": results.get("severity_score", 0),
                "severity_breakdown": results.get("severity_breakdown", {}),
                "new_flood_anomaly": results.get("new_flood_anomaly", 0),
                "sar_mean": results.get("sar_mean"),
                "sar_stddev": results.get("sar_stddev"),
                "ndvi_mean": results.get("ndvi_mean"),
                "aoi_km2": results.get("aoi_km2", 0),
                "run_logs": results.get("run_logs", []),
                "bounds": results.get("bounds", [])
            },
            "tiles": tiles
        }

        print(json.dumps(output))

    except Exception as e:
        error_msg = str(e)
        traceback_str = traceback.format_exc()
        print(json.dumps({
            "success": False,
            "error": error_msg,
            "traceback": traceback_str
        }))

if __name__ == "__main__":
    process()
