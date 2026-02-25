from app import app
from database import db
from models.user import User
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt(app)

name = input("Name: ")
username = input("Username: ")
email = input("Email: ")
password = input("Password: ")

with app.app_context():
    hashed_psw = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(name=name, username=username, password_hash=hashed_psw, email=email)
    db.session.add(user)
    db.session.commit()
    print(f"User '{username}' created successfully!")