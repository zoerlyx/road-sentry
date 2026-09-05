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

