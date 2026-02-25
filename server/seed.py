from app import app
from database import db
from models.camera import Camera, ModeEnum, StatusEnum
from models.camera_log import CameraLog
from datetime import datetime, timedelta
import random

def seed():
    with app.app_context():
        for i in range(1, 5):
            camera = Camera.query.get(i)
            if not camera:
                camera = Camera(
                    id=i,
                    target_temperature=random.uniform(-25.0, -18.0),
                    defrost_threshold_temperature=random.uniform(-15.0, -10.0),
                    defrost_type=random.choice([ModeEnum.FORCED, ModeEnum.AUTO]),
                    compressor_on=random.choice([True, False]),
                    ventilation_on=random.choice([True, False]),
                    heater_on=False,
                    auto_mode=random.choice([True, False]),
                    status=StatusEnum.ON,
                    problem=False,
                )
                db.session.add(camera)
                db.session.commit()
                print(f"Camera {i} created")

            # Add 10 log entries per camera over the last hour
            for j in range(10):
                timestamp = datetime.utcnow() - timedelta(minutes=j * 6)
                log = CameraLog(
                    camera_id=i,
                    temperature=random.uniform(-22.0, -18.0),
                    evaporator_temperature=random.uniform(-30.0, -25.0),
                    supply_voltage=random.uniform(11.5, 12.5),
                    humidity=random.uniform(60.0, 90.0),
                    timestamp=timestamp
                )
                db.session.add(log)

        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed()