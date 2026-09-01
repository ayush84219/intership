import os
from flask import Blueprint, request, jsonify, session, current_app
from werkzeug.utils import secure_filename
from models import db, Student, Internship, Application
from services.matching import calculate_match_score
from services.resume_parser import parse_resume_content

student_bp = Blueprint('student', __name__, url_prefix='/api/student')

def get_current_student():
    if session.get('user_role') != 'student':
        return None
    user_id = session.get('user_id')
    return Student.query.filter_by(user_id=user_id).first()

@student_bp.route('/dashboard', methods=['GET'])
def dashboard():
    student = get_current_student()
    if not student:
        return jsonify({'error': 'Unauthorized student access'}), 401

    # Fetch active internships and compute live AI match scores for student
    active_internships = Internship.query.filter_by(status='Active').all()
    internships_list = []

    for internship in active_internships:
        score = calculate_match_score(student, internship)
        existing_app = Application.query.filter_by(student_id=student.id, internship_id=internship.id).first()
        
        internships_list.append({
            'id': internship.id,
            'title': internship.title,
            'company_name': internship.company.company_name,
            'location': internship.location,
            'stipend': internship.stipend,
            'internship_type': internship.internship_type,
            'description': internship.description,
            'required_skills': internship.get_skills_list(),
            'match_score': score,
            'applied': existing_app is not None,
            'app_status': existing_app.status if existing_app else None
        })

    # Sort internships descending by match score
    internships_list.sort(key=lambda x: x['match_score'], reverse=True)

    # Fetch student's submitted applications
    my_applications = Application.query.filter_by(student_id=student.id).order_by(Application.applied_at.desc()).all()
    applications_list = [{
        'id': app.id,
        'internship_id': app.internship_id,
        'internship_title': app.internship.title,
        'company_name': app.internship.company.company_name,
        'applied_at': app.applied_at.strftime('%Y-%m-%d'),
        'match_score': app.match_score,
        'status': app.status
    } for app in my_applications]

    return jsonify({
        'student': {
            'id': student.id,
            'full_name': student.full_name,
            'university': student.university,
            'major': student.major,
            'gpa': student.gpa,
            'graduation_year': student.graduation_year,
            'skills': student.skills,
            'parsed_skills': student.parsed_skills,
            'skills_list': student.get_skills_list(),
            'bio': student.bio,
            'resume_filename': student.resume_filename
        },
        'recommended_internships': internships_list,
        'applications': applications_list
    }), 200

@student_bp.route('/live-jobs', methods=['GET'])
def student_live_jobs():
    student = get_current_student()
    if not student:
        return jsonify({'error': 'Unauthorized'}), 401
    
    query_keyword = request.args.get('q') or student.major or (student.get_skills_list()[0] if student.get_skills_list() else "Software Internship")
    from services.external_jobs import fetch_live_internships
    live_external_jobs = fetch_live_internships(query=query_keyword, student=student, limit=12)
    return jsonify({'live_jobs': live_external_jobs}), 200

@student_bp.route('/profile', methods=['POST'])
def update_profile():
    student = get_current_student()
    if not student:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    student.full_name = data.get('full_name', student.full_name)
    student.phone = data.get('phone', student.phone)
    student.university = data.get('university', student.university)
    student.major = data.get('major', student.major)
    if 'graduation_year' in data: student.graduation_year = data.get('graduation_year')
    if 'gpa' in data: student.gpa = data.get('gpa')
    student.skills = data.get('skills', student.skills)
    student.bio = data.get('bio', student.bio)

    db.session.commit()
    return jsonify({'success': True, 'message': 'Profile updated successfully'}), 200

@student_bp.route('/resume/upload', methods=['POST'])
def upload_resume():
    student = get_current_student()
    if not student:
        return jsonify({'error': 'Unauthorized'}), 401

    if 'resume_file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['resume_file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    if file:
        filename = secure_filename(file.filename)
        save_dir = current_app.config['UPLOAD_FOLDER']
        os.makedirs(save_dir, exist_ok=True)
        
        filepath = os.path.join(save_dir, f"student_{student.id}_{filename}")
        file.save(filepath)
        
        student.resume_filename = f"student_{student.id}_{filename}"
        
        # Parse resume and extract skills
        parsed_result = parse_resume_content(filepath)
        student.parsed_skills = parsed_result.get('skills_comma_separated', '')
        
        db.session.commit()
        return jsonify({
            'success': True,
            'message': f'Resume uploaded and parsed! AI extracted {len(parsed_result.get("extracted_skills", []))} skills.',
            'extracted_skills': parsed_result.get('extracted_skills', [])
        }), 200

@student_bp.route('/apply/<int:internship_id>', methods=['POST'])
def apply_internship(internship_id):
    student = get_current_student()
    if not student:
        return jsonify({'error': 'Unauthorized'}), 401

    internship = Internship.query.get_or_404(internship_id)

    existing_app = Application.query.filter_by(student_id=student.id, internship_id=internship.id).first()
    if existing_app:
        return jsonify({'error': 'Already applied to this position'}), 400

    match_score = calculate_match_score(student, internship)

    new_app = Application(
        student_id=student.id,
        internship_id=internship.id,
        match_score=match_score,
        status='Pending'
    )
    db.session.add(new_app)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Applied for {internship.title}',
        'match_score': match_score
    }), 201
