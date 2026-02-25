from database import db
import enum

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


class ModeEnum(enum.Enum):
    FORCED = 'FORCED',
    AUTO = "AUTO"

class StatusEnum(enum.Enum):
    ON = "ON",
    OFF = "OFF"

class Camera(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    target_temperature = db.Column(db.Float, nullable=False)
    defrost_threshold_temperature = db.Column(db.Float, nullable=False)
    defrost_type = db.Column(db.Enum(ModeEnum), default=ModeEnum.AUTO, nullable=False)
    compressor_on = db.Column(db.Boolean, default=False, nullable=False)
    ventilation_on = db.Column(db.Boolean, default=False, nullable=False)
    heater_on = db.Column(db.Boolean, default=False, nullable=False)
    auto_mode = db.Column(db.Boolean, default=True, nullable=False)
    status = db.Column(db.Enum(StatusEnum), default=StatusEnum.OFF)
    problem = db.Column(db.Boolean, default=False)
    logs = db.relationship('CameraLog', backref='camera', cascade='all, delete-orphan')