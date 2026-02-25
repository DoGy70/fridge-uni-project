import sqlite3
import datetime
from pathlib import Path

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app = Flask(__name__, instance_relative_config=True)
Path(app.instance_path).mkdir(parents=True, exist_ok=True)

db_path = Path(app.instance_path) / "db.sqlite3"

# === CONFIG ROUTE ===
DATABASE = "./db.sqlite3"

# === In-memory state (replace with DB or file persistence later) ===
system_state = {
    "auto_mode": True,
    "is_admin": False,
    "target_temperature": 4.0,
    "defrost_threshold_temperature": 6,
    "defrost_type": "AUTO",
    "status": "OFF",
    "temperature": 0,
    "humidity": 0,
    "evaporator_temperature": 0,
    "relay_states": {
        "compressor_on": False,
        "ventilation_on": False,
        "heater_on": False
    }
}

# === Root ===
@app.route("/")
def home():
    return jsonify({"status": "ok"}), 200

# === RELAY ROUTES ===
@app.route("/api/relay", methods=["POST"])
def set_relay_state():
    global system_state
    data = request.get_json()
    relay_states = data

    for relay, state in relay_states.items():
        system_state["relay_states"][relay] = True if state == 1 else False
    print("Updated relay states:", relay_states)
    return jsonify({"status": "ok", "received": relay_states})

@app.route("/api/relay-state", methods=["GET", "POST"])
def relay_state():
    global system_state
    if request.method == "POST":
        data = request.get_json()
        if system_state["is_admin"] == (data['mode'] == "auto"):
            system_state["relay_states"] = data

        print("Updated relay states via POST:", system_state["relay_states"])
        return jsonify({"status": "ok"})
    
    print("Forwarding relay states: ", system_state["relay_states"])
    return jsonify(system_state["relay_states"])

# === MODE ROUTES ===
@app.route("/api/mode", methods=["GET", "POST"])
def mode():
    global system_state
    if request.method == "POST":
        data = request.get_json()
        mode_value = data.get("mode")
        if mode_value in ["auto", "manual"]:
            system_state["auto_mode"] = True if mode_value == "auto" else False
            print(f"Control mode set to: {mode_value}")
            return jsonify({"status": "ok", "mode": mode_value})
        else:
            return jsonify({"status": "error", "message": "Invalid mode"}), 400
    return jsonify(system_state["auto_mode"])

# === CONFIG ROUTES (setpoints) ===
@app.route("/api/config", methods=["GET", "POST"])
def config():
    global system_state
    if request.method == "POST":
        data = request.get_json()
        system_state["target_temperature"] = data.get("target_temperature")
        system_state["defrost_threshold_temperature"] = data.get('defrost_threshold_temperature')
        system_state["defrost_type"] = data.get("defrost_type")
        return jsonify({"status": "ok", "config": system_state["target_temperature"]})
    return jsonify({"target_temperature": system_state["target_temperature"], "defrost_threshold_temperature": system_state["defrost_threshold_temperature"],
                    "defrost_type": system_state["defrost_type"]})


@app.route('/api/admin', methods=["GET"])
def get_admin():
    global system_state
    return jsonify({"admin": system_state["is_admin"]})

@app.route("/api/sensors", methods=["POST", "GET"])
def api_sensors():
    global system_state
    if (request.method == "POST"):
        data = request.get_json()
        print("Received measurements:", data)

        # Записване на последните стойности
        system_state.update({
            "id": data.get("id"),
            "temperature": data.get("temperature"),
            "humidity": data.get("humidity"),
            "evaporator_temperature": data.get("evaporator_temperature"),
            "timestamp": datetime.datetime.now().isoformat(),
            "status": data.get("status"),
            "is_admin": data.get("is_admin")
        })

        # Raspberry трябва да получи конфигурацията, зададена от React
        response_payload = {
            "auto_mode": system_state["auto_mode"],
            "target_temperature": system_state["target_temperature"],
            "defrost_threshold_temperature": system_state["defrost_threshold_temperature"],
            "defrost_type": system_state["defrost_type"],
            "compressor_on": system_state["relay_states"]["compressor_on"],
            "ventilation_on": system_state["relay_states"]["ventilation_on"],
            "heater_on": system_state["relay_states"]["heater_on"],
            "temperature": system_state["temperature"]
        }
        
        print("response payload:", response_payload)
        return jsonify(response_payload), 200
    return jsonify({"temperature": system_state["temperature"], "evaporator_temperature": system_state["evaporator_temperature"], "humidity": system_state["humidity"]})


# === MAIN ===
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
