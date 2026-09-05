from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np
import os
import time
import uuid
import threading
import traceback
from PIL import Image, ImageOps
import io

app = Flask(__name__)

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 1. Konfigurasi Upload & Retention Cleanup
UPLOAD_ANNOTATED_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "uploads", "annotated"))
os.makedirs(UPLOAD_ANNOTATED_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
RETENTION_HOURS = 24  # Hapus file anotasi yang berumur lebih dari 24 jam

# Lock thread untuk keamanan inference serentak
inference_lock = threading.Lock()


    except Exception as e:
        print("=== EXCEPTION IN /predict ===")
        traceback.print_exc()
        # Menyembunyikan detail error internal dari client
        return jsonify({
            "success": False,
            "message": "Terjadi kesalahan internal pada layanan AI."
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False, threaded=True)