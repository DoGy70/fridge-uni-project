from database import db
from datetime import datetime

class CameraLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    camera_id = db.Column(db.Integer, db.ForeignKey('camera.id'), nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    evaporator_temperature = db.Column(db.Float, nullable=False)
    supply_voltage = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
