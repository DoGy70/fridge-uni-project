from flask import Blueprint, jsonify, request, make_response
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, set_access_cookies

from database import db

from models.user import User

from schemas.user_schema import RegisterSchema, LoginSchema
from marshmallow import ValidationError

from limiter import limiter

import os

bcrypt = Bcrypt()
user_bp = Blueprint('users', __name__)

IS_PRODUCTION = os.environ.get('FLASK_ENV') == 'production'

@user_bp.route('/register', methods=["POST"])
def register():
    try:   
        data = RegisterSchema().load(request.json)
    except ValidationError as e:
        return jsonify({'message': e.messages}), 400 

    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(username=data["username"], email=data['email'], password_hash=hashed_pw)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201

@user_bp.route('/login', methods=["POST"])
@limiter.limit("5 per minute", error_message="Too many login attempts. Please wait a minute.")
def login():
    try:
        data = LoginSchema().load(request.json)
    except ValidationError as e:
        return jsonify({'message': e.messages}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=str(user.id))
        response = make_response(jsonify({'message': 'Login successful'}))
        set_access_cookies(response, access_token)
        return response, 200
    
    return jsonify({"message": "Invalid credentials"}), 401

# Example of a protected route
@user_bp.route('/me', methods=["GET"])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({"id": user_id, "username": user.username, "email": user.email}), 200