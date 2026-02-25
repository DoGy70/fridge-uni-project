from flask import Blueprint, jsonify, request
from models.camera_log import CameraLog
from models.camera import Camera
from database import db

from flask_jwt_extended import jwt_required

camera_log_bp = Blueprint('camera_logs', __name__)

@camera_log_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_all_logs():
    cameras = Camera.query.all()
    result = []

    for camera in cameras:
        latest_log = CameraLog.query.filter_by(camera_id=camera.id).order_by(CameraLog.timestamp.desc()).first()
        result.append({
            'id': camera.id,
            'compressor_on': camera.compressor_on,
            'ventilation_on': camera.ventilation_on,
            'heater_on': camera.heater_on,
            'auto_mode': camera.auto_mode,
            'target_temperature': camera.target_temperature,
            'defrost_threshold_temperature': camera.defrost_threshold_temperature,
            'temperature': latest_log.temperature if latest_log else None,
            'evaporator_temperature': latest_log.evaporator_temperature if latest_log else None,
            'humidity': latest_log.humidity if latest_log else None,
            'supply_voltage': latest_log.supply_voltage if latest_log else None,
        })

    

    return jsonify(result), 200

@camera_log_bp.route('/dashboard/camera/<int:camera_id>', methods=['GET'])
@jwt_required()
def get_logs(camera_id):
    camera = Camera.query.get(camera_id)
    if not camera:
        return jsonify({"message": "Camera not found"}), 404
    
    logs = CameraLog.query.filter_by(camera_id=camera_id).order_by(CameraLog.timestamp.asc()).all()

    return jsonify({
        'camera': {
            'id': camera_id,
            'defrost_threshold_temperature': camera.defrost_threshold_temperature,
            'target_temperature': camera.target_temperature,
            'compressor_on': camera.compressor_on,
            'heater_on': camera.heater_on,
            'ventilation_on': camera.ventilation_on,
            'auto_mode': camera.auto_mode
        },
        'timestamps': [l.timestamp for l in logs],
        'temperatures': [l.temperature for l in logs],
        'temperatures_evaporator': [l.evaporator_temperature for l in logs],
        'supply_voltages': [l.supply_voltage for l in logs],
        'humidities': [l.humidity for l in logs]
    }), 200