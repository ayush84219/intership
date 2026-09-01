from flask import Blueprint, request, jsonify, session
from models import db, User, Student, Company

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'authenticated': False}), 200

    user = User.query.get(user_id)
    if not user:
        session.clear()
        return jsonify({'authenticated': False}), 200

    profile_data = {}
    if user.role == 'student' and user.student_profile:
        profile_data = {
            'student_id': user.student_profile.id,
            'full_name': user.student_profile.full_name,
            'university': user.student_profile.university,
            'major': user.student_profile.major,
            'gpa': user.student_profile.gpa,
            'skills': user.student_profile.skills,
            'parsed_skills': user.student_profile.parsed_skills,
            'resume_filename': user.student_profile.resume_filename
        }
    elif user.role == 'company' and user.company_profile:
        profile_data = {
            'company_id': user.company_profile.id,
            'company_name': user.company_profile.company_name,
            'industry': user.company_profile.industry,
            'location': user.company_profile.location,
            'website': user.company_profile.website
        }

    return jsonify({
        'authenticated': True,
        'user': {
            'id': user.id,
            'email': user.email,
            'role': user.role,
            'profile': profile_data
        }
    }), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        session['user_id'] = user.id
        session['user_role'] = user.role
        session['user_email'] = user.email

        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
        }), 200

    return jsonify({'success': False, 'message': 'Invalid email or password'}), 401

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role = data.get('role', 'student')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'success': False, 'message': 'An account with this email address already exists.'}), 400

    new_user = User(email=email, role=role)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    if role == 'student':
        student = Student(
            user_id=new_user.id,
            full_name=data.get('full_name', 'Student User'),
            university=data.get('university', ''),
            major=data.get('major', ''),
            skills=data.get('skills', '')
        )
        db.session.add(student)

    elif role == 'company':
        company = Company(
            user_id=new_user.id,
            company_name=data.get('company_name', 'Company Name'),
            industry=data.get('industry', ''),
            location=data.get('location', ''),
            website=data.get('website', '')
        )
        db.session.add(company)

    db.session.commit()

    # Automatically log in user after registration
    session['user_id'] = new_user.id
    session['user_role'] = new_user.role
    session['user_email'] = new_user.email

    return jsonify({
        'success': True,
        'message': 'Registration successful',
        'user': {
            'id': new_user.id,
            'email': new_user.email,
            'role': new_user.role
        }
    }), 201

@auth_bp.route('/logout', methods=['POST', 'GET'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200
