from flask import Blueprint, jsonify, session, request
from models import db, User, Student, Company, Internship, Application

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def is_admin():
    return session.get('user_role') == 'admin'

@admin_bp.route('/dashboard', methods=['GET'])
def dashboard():
    if not is_admin():
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.order_by(User.created_at.desc()).all()
    users_list = []
    for u in users:
        details = "Primary System Admin"
        if u.role == 'student' and u.student_profile:
            details = f"{u.student_profile.full_name} ({u.student_profile.university or 'N/A'})"
        elif u.role == 'company' and u.company_profile:
            details = f"{u.company_profile.company_name} ({u.company_profile.industry or 'N/A'})"

        users_list.append({
            'id': u.id,
            'email': u.email,
            'role': u.role,
            'details': details,
            'created_at': u.created_at.strftime('%Y-%m-%d %H:%M')
        })

    internships = Internship.query.order_by(Internship.created_at.desc()).all()
    internships_list = [{
        'id': i.id,
        'title': i.title,
        'company_name': i.company.company_name,
        'location': i.location,
        'skills': i.get_skills_list(),
        'applicant_count': len(i.applications),
        'status': i.status
    } for i in internships]

    return jsonify({
        'total_students': Student.query.count(),
        'total_companies': Company.query.count(),
        'total_internships': Internship.query.count(),
        'total_applications': Application.query.count(),
        'users': users_list,
        'internships': internships_list
    }), 200

@admin_bp.route('/user/<int:user_id>/delete', methods=['DELETE', 'POST'])
def delete_user(user_id):
    if not is_admin():
        return jsonify({'error': 'Forbidden'}), 403

    user = User.query.get_or_404(user_id)
    if user.role == 'admin':
        return jsonify({'error': 'Cannot delete system admin account'}), 400

    db.session.delete(user)
    db.session.commit()

    return jsonify({'success': True, 'message': f'User {user.email} removed'}), 200
