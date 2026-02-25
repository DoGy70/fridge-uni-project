from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from models.camera import Camera, ModeEnum, StatusEnum
from models.camera_log import CameraLog

from database import db

#"temperature": temperature,
#        "humidity": humidity,
#       "evaporator_temperature": evaporator_temperature,
#        "supply_voltage": supply_voltage,
#        "target_temperature": current_state.get("target_temperature"),
#        "defrost_threshold_temperature": current_state.get("defrost_threshold_temperature"),
#        "defrost_type": current_state.get("defrost_type"),
#        "compressor_on": current_state["relay_states"].get("compressor") == 1,
#        "ventilation_on": current_state["relay_states"].get("ventilation") == 1,
#        "heater_on": current_state["relay_states"].get("heater") == 1,
#        "auto_mode": current_state.get("auto_mode"),
#        "status": current_state.get("status"),
#        "problem": current_state.get("problem"),


#      relays = current_state["relay_states"]
#                relays["compressor"] = 1 if r.get("compressor_on") == True else 0
#                relays["ventilation"] = 1 if r.get("ventilation_on") == True else 0
#                relays["heater"] = 1 if r.get("heater_on") == True else 0


#current_state.update({
#                "auto_mode": r.get("auto_mode", current_state["auto_mode"]),
#                "target_temperature": r.get("target_temperature", current_state["target_temperature"]),
#                "defrost_type": r.get("defrost_type", current_state["defrost_type"]),
#                "defrost_threshold_temperature": r.get("defrost_threshold_temperature", current_state["defrost_threshold_temperature"])
#            })

camera_bp = Blueprint("cameras", __name__)

@camera_bp.route('/camera/<int:camera_id>', methods=["POST"])
def push_readings(camera_id):
    auth = request.authorization
    if not auth or auth.username != 'raspberries' or auth.password != 'rapanarapana':
        return jsonify({"message": "Unauthorized"}), 401
    
    camera = Camera.query.get(camera_id)

    if not camera:
        camera = Camera(id=camera_id)
        db.session.add(camera)

    data = request.json

    camera.defrost_threshold_temperature = data.get('defrost_threshold_temperature', -3.0)
    camera.defrost_type = ModeEnum(data.get('defrost_type', "AUTO"))
    camera.target_temperature = data.get("target_temperature", 0.0)
    camera.auto_mode = data.get("auto_mode", True)
    camera.problem = data.get("problem", False)
    camera.status = StatusEnum(data.get("status"), "OFF")
    
    if camera.auto_mode != False:
        camera.compressor_on = data.get('compressor_on', False)
        camera.heater_on = data.get('heater_on', False)
        camera.ventilation_on = data.get('ventilation_on', False)
    
    log = CameraLog(camera_id=camera_id, temperature=data.get("temperature"), evaporator_temperature=data.get('evaporator_temperature'),
                    supply_voltage=data.get("supply_voltage"), humidity=data.get("humidity"))
    db.session.add(log)
    db.session.commit()

    return jsonify({'compressor_on': camera.compressor_on,
                     'ventilation_on': camera.ventilation_on,
                     'heater_on': camera.heater_on,
                     'auto_mode': camera.auto_mode,
                     'target_temperature': camera.target_temperature,
                     'defrost_type': camera.defrost_type.name,
                     'defrost_threshold_temperature': camera.defrost_threshold_temperature}), 200

@camera_bp.route('/camera/<int:camera_id>/instructions', methods=["PUT"])
@jwt_required()
def push_instructions(camera_id):
    camera = Camera.query.get(camera_id)

    if not camera:
        return jsonify({'message': "No camera with such id"}), 404
    
    data = request.json
    camera.target_temperature = data.get('target_temperature', camera.target_temperature)
    camera.defrost_threshold_temperature = data.get('defrost_threshold_temperature', camera.defrost_threshold_temperature)
    camera.auto_mode = data.get('auto_mode', camera.auto_mode)

    if not camera.auto_mode:
        camera.compressor_on = data.get('compressor_on', camera.compressor_on)
        camera.ventilation_on = data.get('ventilation_on', camera.ventilation_on)
        camera.heater_on = data.get('heater_on', camera.heater_on)

    db.session.commit()
    return jsonify({'message': 'Instructions recieved'}), 200


