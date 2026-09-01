from flask import Blueprint, request, jsonify, session
from models import db, Company, Internship, Application
from services.matching import calculate_match_score

company_bp = Blueprint('company', __name__, url_prefix='/api/company')

def get_current_company():
    if session.get('user_role') != 'company':
        return None
    user_id = session.get('user_id')
    return Company.query.filter_by(user_id=user_id).first()

@company_bp.route('/dashboard', methods=['GET'])
def dashboard():
    company = get_current_company()
    if not company:
        return jsonify({'error': 'Unauthorized company access'}), 401

    my_internships = Internship.query.filter_by(company_id=company.id).order_by(Internship.created_at.desc()).all()
    internships_list = []

    for item in my_internships:
        internships_list.append({
            'id': item.id,
            'title': item.title,
            'description': item.description,
            'required_skills': item.get_skills_list(),
            'stipend': item.stipend,
            'location': item.location,
            'internship_type': item.internship_type,
            'status': item.status,
            'applicant_count': len(item.applications)
        })

    selected_id = request.args.get('internship_id', type=int)
    selected_internship = None
    applicants_list = []

    if selected_id:
        selected_internship = Internship.query.filter_by(id=selected_id, company_id=company.id).first()
    elif my_internships:
        selected_internship = my_internships[0]

    if selected_internship:
        applications = Application.query.filter_by(internship_id=selected_internship.id).all()
        for app in applications:
            score = calculate_match_score(app.student, selected_internship)
            applicants_list.append({
                'id': app.id,
                'student_id': app.student_id,
                'student_name': app.student.full_name,
                'university': app.student.university,
                'major': app.student.major,
                'gpa': app.student.gpa,
                'skills': app.student.get_skills_list(),
                'match_score': score,
                'status': app.status,
                'applied_at': app.applied_at.strftime('%Y-%m-%d')
            })
        
        # Sort applicants descending by match score
        applicants_list.sort(key=lambda x: x['match_score'], reverse=True)

    return jsonify({
        'company': {
            'id': company.id,
            'company_name': company.company_name,
            'industry': company.industry,
            'location': company.location,
            'website': company.website
        },
        'internships': internships_list,
        'selected_internship_id': selected_internship.id if selected_internship else None,
        'applicants': applicants_list
    }), 200

@company_bp.route('/internship/post', methods=['POST'])
def post_internship():
    company = get_current_company()
    if not company:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    required_skills = data.get('required_skills')

    if not title or not description or not required_skills:
        return jsonify({'error': 'Title, description, and required skills are required'}), 400

    new_internship = Internship(
        company_id=company.id,
        title=title,
        description=description,
        required_skills=required_skills,
        stipend=data.get('stipend', 'Negotiable'),
        location=data.get('location', 'Remote'),
        internship_type=data.get('internship_type', 'Full-time'),
        duration=data.get('duration', '3 Months'),
        deadline=data.get('deadline'),
        status='Active'
    )
    db.session.add(new_internship)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Internship "{title}" posted successfully!',
        'internship_id': new_internship.id
    }), 201

@company_bp.route('/internship/<int:internship_id>/toggle', methods=['POST'])
def toggle_internship_status(internship_id):
    company = get_current_company()
    if not company:
        return jsonify({'error': 'Unauthorized'}), 401

    internship = Internship.query.filter_by(id=internship_id, company_id=company.id).first_or_404()
    internship.status = 'Closed' if internship.status == 'Active' else 'Active'
    db.session.commit()

    return jsonify({
        'success': True,
        'status': internship.status,
        'message': f'Status for "{internship.title}" updated to {internship.status}.'
    }), 200

@company_bp.route('/application/<int:app_id>/status', methods=['POST'])
def update_application_status(app_id):
    company = get_current_company()
    if not company:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    new_status = data.get('status')

    application = Application.query.get_or_404(app_id)
    if application.internship.company_id != company.id:
        return jsonify({'error': 'Forbidden'}), 403

    application.status = new_status
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Updated status to {new_status}'
    }), 200
