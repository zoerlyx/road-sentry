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

# 2. Dynamic Class Mapping & Scoring Configurations
CONFIG = {
    "YOLO_DEVICE": "cpu",     # Gunakan 'cuda' atau '0' jika tersedia GPU
    "YOLO_IMGSZ": 640,
    "MAX_DET": 100,
    "CLASS_MAPPING": {
        "pothole": {"weight": 3.5, "is_actual_damage": True},
        "crack": {"weight": 1.8, "is_actual_damage": True},
        "manhole": {"weight": 0.1, "is_actual_damage": False}
    },
    "DEFAULT_WEIGHT": 1.0,
    "SCORING": {
        "DAMAGE_RATIO_FACTOR": 8.0,
        "OBJECT_SCORE_FACTOR": 2.0,
        "SEVERITY_SCORE_FACTOR": 15.0,
        "PRIORITY_DAMAGE_FACTOR": 5.0,
        "PRIORITY_OBJECT_FACTOR": 4.0,
        "CRITICAL_PRIORITY_THRESHOLD": 65.0,
        "CRITICAL_SEVERITY_THRESHOLD": 3.5,
        "MEDIUM_PRIORITY_THRESHOLD": 35.0
    }
}

# 3. Safe Model Loading & State Handling
MODEL_PATH = os.path.join(BASE_DIR, "best.pt")
print(f"[*] Loading YOLO model from: {MODEL_PATH}")

model = None
model_loaded = False
class_weights = {}
damage_class_ids = set()

try:
    if os.path.exists(MODEL_PATH):
        model = YOLO(MODEL_PATH)
        model_loaded = True
        print("[*] Model YOLO successfully loaded!")

        # Dynamic Mapping berdasarkan model.names
        for cls_id, cls_name in model.names.items():
            cls_name_lower = str(cls_name).lower()
            if cls_name_lower in CONFIG["CLASS_MAPPING"]:
                meta = CONFIG["CLASS_MAPPING"][cls_name_lower]
                class_weights[cls_id] = meta["weight"]
                if meta["is_actual_damage"]:
                    damage_class_ids.add(cls_id)
            else:
                class_weights[cls_id] = CONFIG["DEFAULT_WEIGHT"]
                damage_class_ids.add(cls_id)
    else:
        print(f"[!] Model file not found at: {MODEL_PATH}")
except Exception as e:
    print(f"[!] Critical Error loading YOLO model: {e}")


def cleanup_old_annotated_files(directory, max_age_hours=24):
    """Membersihkan file gambar anotasi lama agar storage tidak membengkak."""
    try:
        now = time.time()
        cutoff = now - (max_age_hours * 3600)
        for filename in os.listdir(directory):
            file_path = os.path.join(directory, filename)
            if os.path.isfile(file_path):
                if os.path.getmtime(file_path) < cutoff:
                    os.remove(file_path)
    except Exception as err:
        print(f"[!] File cleanup warning: {err}")


def resize_if_large(image, max_dim=1024):
    """Mengecilkan gambar jika terlalu besar dan mengembalikan scale factor-nya."""
    try:
        h, w = image.shape[:2]
        if max(h, w) > max_dim:
            scale = max_dim / float(max(h, w))
            new_w = int(w * scale)
            new_h = int(h * scale)
            resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
            return resized, scale
    except Exception as err:
        print(f"[!] Warning on resize: {err}")
    return image, 1.0


@app.route("/", methods=["GET"])
def health_check():
    status_str = "online" if model_loaded else "degraded"
    return jsonify({
        "status": status_str,
        "model_loaded": model_loaded,
        "message": "RoadSentry AI Service Operational" if model_loaded else "MODEL_UNAVAILABLE"
    }), (200 if model_loaded else 503)


@app.route("/predict", methods=["POST"])
def predict():
    print("\n[+] Received /predict request...")

    # Cek ketersediaan model
    if not model_loaded or model is None:
        return jsonify({
            "success": False,
            "error_type": "MODEL_UNAVAILABLE",
            "message": "Model AI belum siap atau gagal dimuat."
        }), 530

    # Jalankan cleanup periodik ringan
    cleanup_old_annotated_files(UPLOAD_ANNOTATED_DIR, RETENTION_HOURS)

    try:
        # Validasi Keberadaan File
        if "image" not in request.files:
            return jsonify({"success": False, "message": "File gambar tidak ditemukan"}), 400

        file = request.files["image"]

        # Validasi MIME Type
        if file.mimetype not in ALLOWED_MIME_TYPES:
            return jsonify({
                "success": False,
                "message": f"Format MIME '{file.mimetype}' tidak terdukung. Gunakan JPEG, PNG, atau WEBP."
            }), 400

        # Validasi Ukuran File
        file.seek(0, os.SEEK_END)
        file_length = file.tell()
        file.seek(0)

        if file_length > MAX_FILE_SIZE:
            return jsonify({"success": False, "message": "Ukuran file melebihi batas maksimum 10 MB"}), 400

        image_bytes = file.read()

        # Reading & Handling EXIF
        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            pil_img = ImageOps.exif_transpose(pil_img)
            img_rgb = np.array(pil_img.convert('RGB'))
            img_orig = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
        except Exception:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img_orig = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img_orig is None:
            return jsonify({"success": False, "message": "Format gambar tidak valid atau terkorupsi"}), 400

        orig_height, orig_width, _ = img_orig.shape
        img_process, scale = resize_if_large(img_orig, max_dim=1024)

        # Thread Safe Inference Execution
        with inference_lock:
            results = model.predict(
                source=img_process,
                conf=0.15,
                imgsz=CONFIG["YOLO_IMGSZ"],
                device=CONFIG["YOLO_DEVICE"],
                max_det=CONFIG["MAX_DET"],
                verbose=False
            )[0]

        boxes = results.boxes

        if len(boxes) == 0:
            return jsonify({
                "success": False,
                "error_type": "NO_DAMAGE_DETECTED",
                "message": "Gambar tidak terdeteksi memiliki objek kerusakan jalan yang valid."
            }), 422

        # Dynamic Filter: Pastikan ada minimal 1 kerusakan aktual
        has_actual_damage = any(int(b.cls[0].item()) in damage_class_ids for b in boxes)
        if not has_actual_damage:
            return jsonify({
                "success": False,
                "error_type": "NO_DAMAGE_DETECTED",
                "message": "Gambar hanya berisi objek utilitas tanpa kerusakan jalan."
            }), 422

        # Annotated Image Preparation
        annotated_img_process = results.plot()
        if scale != 1.0:
            annotated_img = cv2.resize(annotated_img_process, (orig_width, orig_height), interpolation=cv2.INTER_CUBIC)
        else:
            annotated_img = annotated_img_process

        total_objects = 0
        weighted_damage_area = 0.0
        detections_detail = []
        max_severity_found = 0.0

        for box in boxes:
            cls_id = int(box.cls[0].item())
            conf = float(box.conf[0].item())
            
            # Re-scale bounding box ke ukuran gambar original
            x1, y1, x2, y2 = map(float, box.xyxy[0].tolist())
            orig_x1 = int(round(x1 / scale))
            orig_y1 = int(round(y1 / scale))
            orig_x2 = int(round(x2 / scale))
            orig_y2 = int(round(y2 / scale))

            box_area = (orig_x2 - orig_x1) * (orig_y2 - orig_y1)
            weight = class_weights.get(cls_id, CONFIG["DEFAULT_WEIGHT"])

            total_objects += 1
            weighted_damage_area += (box_area * weight)
            if weight > max_severity_found:
                max_severity_found = weight

            class_name = results.names.get(cls_id, f"class_{cls_id}")

            detections_detail.append({
                "class_id": cls_id,
                "class_name": class_name,
                "confidence": round(conf, 4),
                "bbox": [orig_x1, orig_y1, orig_x2, orig_y2],
                "area_px": box_area
            })

        # Calculate Priority & Road Score
        total_img_area = orig_height * orig_width
        damage_ratio = (weighted_damage_area / total_img_area) * 100.0 if total_img_area > 0 else 0.0

        sc = CONFIG["SCORING"]
        road_score = max(0.0, min(100.0, 100.0 - (damage_ratio * sc["DAMAGE_RATIO_FACTOR"]) - (total_objects * sc["OBJECT_SCORE_FACTOR"])))
        priority_score = min(100.0, round(
            (max_severity_found * sc["SEVERITY_SCORE_FACTOR"]) + 
            (damage_ratio * sc["PRIORITY_DAMAGE_FACTOR"]) + 
            (total_objects * sc["PRIORITY_OBJECT_FACTOR"]), 2
        ))

        if priority_score >= sc["CRITICAL_PRIORITY_THRESHOLD"] or max_severity_found >= sc["CRITICAL_SEVERITY_THRESHOLD"]:
            priority_level, status, recommendation = "DARURAT / KRUSIAL", "Rusak Berat", "Perbaikan Segera (Maksimal 2x24 Jam)"
        elif priority_score >= sc["MEDIUM_PRIORITY_THRESHOLD"]:
            priority_level, status, recommendation = "SEDANG", "Rusak Sedang", "Masuk Jadwal Pemeliharaan Berkala"
        else:
            priority_level, status, recommendation = "RENDAH", "Rusak Ringan", "Monitoring dan Pemeliharaan Rutin"

        # Unique Filename Generation & Storage Safe Check
        unique_id = uuid.uuid4().hex[:8]
        filename = f"annotated_{int(time.time())}_{unique_id}.jpg"
        save_path = os.path.join(UPLOAD_ANNOTATED_DIR, filename)

        write_success = cv2.imwrite(save_path, annotated_img)
        if not write_success:
            print(f"[!] Error: cv2.imwrite failed to write image at {save_path}")
            return jsonify({
                "success": False,
                "message": "Gagal menyimpan gambar hasil anotasi ke penyimpanan server"
            }), 500

        annotated_url = f"/uploads/annotated/{filename}"

        # Response JSON Structure Fix
        return jsonify({
            "success": True,
            "annotatedImageUrl": annotated_url,
            "summary": {
                "total_objects": total_objects,
                "damage_area_percentage": round(damage_ratio, 4),
                "road_score": round(road_score, 2),
                "priority_score": priority_score,
                "priority_level": priority_level,
                "status_description": status,
                "recommendation": recommendation
            },
            "detectionResult": {
                "detections": detections_detail
            }
        }), 200

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