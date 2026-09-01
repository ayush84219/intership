import os
from flask import Flask, jsonify, session, send_from_directory
from flask_cors import CORS
from config import Config
from models import db, User, Student, Company, Internship, Application
from routes import auth_bp, student_bp, company_bp, admin_bp, jobs_bp

def create_app():
    app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
    app.config.from_object(Config)

    # Enable CORS for React frontend
    CORS(app, supports_credentials=True, origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5000", "http://127.0.0.1:5000"])

    # Initialize extensions
    db.init_app(app)

    # Register API Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(company_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(jobs_bp)

    # Public API endpoint for landing page
    @app.route('/api/public/landing', methods=['GET'])
    def public_landing_data():
        active_internships = Internship.query.filter_by(status='Active').limit(6).all()
        featured_list = [{
            'id': i.id,
            'title': i.title,
            'company_name': i.company.company_name,
            'location': i.location,
            'stipend': i.stipend,
            'internship_type': i.internship_type,
            'description': i.description,
            'skills': i.get_skills_list()[:4]
        } for i in active_internships]

        return jsonify({
            'student_count': Student.query.count(),
            'company_count': Company.query.count(),
            'internship_count': Internship.query.count(),
            'featured_internships': featured_list
        }), 200

    # Catch-all route to serve compiled React SPA or status message
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        elif os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_from_directory(app.static_folder, 'index.html')
        else:
            return jsonify({
                'message': 'Smart Internship Portal REST API backend is active. React frontend is running.'
            }), 200

    with app.app_context():
        db.create_all()
        seed_database()

    return app

def seed_database():
    """Seed initial demo users, companies, internships, and student applications if DB is fresh."""
    if User.query.filter_by(email='admin@portal.com').first():
        return

    print("Seeding initial database records...")

    # Admin User
    admin_user = User(email='admin@portal.com', role='admin')
    admin_user.set_password('admin123')
    db.session.add(admin_user)

    # Company 1
    company1_user = User(email='techcorp@demo.com', role='company')
    company1_user.set_password('company123')
    db.session.add(company1_user)
    db.session.flush()

    company1 = Company(
        user_id=company1_user.id,
        company_name='TechCorp Solutions',
        industry='Software Development & AI',
        location='San Francisco, CA (Hybrid)',
        website='https://techcorp-demo.com',
        description='Leading enterprise software provider specializing in cloud computing and AI services.'
    )
    db.session.add(company1)

    # Company 2
    company2_user = User(email='datasphere@demo.com', role='company')
    company2_user.set_password('company123')
    db.session.add(company2_user)
    db.session.flush()

    company2 = Company(
        user_id=company2_user.id,
        company_name='DataSphere Analytics',
        industry='Data Science & FinTech',
        location='New York, NY (Remote)',
        website='https://datasphere-demo.com',
        description='Next-gen financial data processing and machine learning analytics platform.'
    )
    db.session.add(company2)
    db.session.flush()

    # Internships
    int1 = Internship(
        company_id=company1.id,
        title='AI & Python Software Engineering Intern',
        description='Work on real-world Flask, FastAPI, Machine Learning pipelines, and cloud database integrations.',
        required_skills='Python, Machine Learning, Flask, SQL, Git',
        stipend='$4,500 / month',
        location='San Francisco, CA / Remote',
        internship_type='Remote',
        duration='3 Months'
    )
    int2 = Internship(
        company_id=company1.id,
        title='Frontend React & UI/UX Design Intern',
        description='Collaborate with senior designers to build responsive glassmorphism web components using JavaScript, React, and modern CSS.',
        required_skills='JavaScript, React, HTML, CSS, Tailwind, Figma',
        stipend='$4,000 / month',
        location='San Francisco, CA',
        internship_type='Hybrid',
        duration='4 Months'
    )
    int3 = Internship(
        company_id=company2.id,
        title='Data Analyst & ML Research Intern',
        description='Process massive financial datasets, build predictive scikit-learn algorithms, and create interactive data visualization dashboards.',
        required_skills='Python, Pandas, NumPy, Scikit-Learn, SQL, Data Analysis',
        stipend='$4,800 / month',
        location='New York, NY / Remote',
        internship_type='Remote',
        duration='3 Months'
    )
    db.session.add_all([int1, int2, int3])

    # Student 1
    student1_user = User(email='alex@demo.com', role='student')
    student1_user.set_password('student123')
    db.session.add(student1_user)
    db.session.flush()

    student1 = Student(
        user_id=student1_user.id,
        full_name='Alex Johnson',
        university='Stanford University',
        major='Computer Science',
        graduation_year=2026,
        gpa=3.85,
        skills='Python, Machine Learning, Flask, SQL, Pandas, Git, JavaScript',
        bio='Passionate CS student specializing in artificial intelligence and web applications.',
        parsed_skills='Python, Machine Learning, SQL, Flask, Git'
    )
    db.session.add(student1)

    # Student 2
    student2_user = User(email='sarah@demo.com', role='student')
    student2_user.set_password('student123')
    db.session.add(student2_user)
    db.session.flush()

    student2 = Student(
        user_id=student2_user.id,
        full_name='Sarah Miller',
        university='MIT',
        major='Data Science',
        graduation_year=2027,
        gpa=3.92,
        skills='Python, Pandas, NumPy, Scikit-Learn, SQL, Data Analysis, Machine Learning',
        bio='Data Science sophomore enthusiastic about predictive modeling and quantitative finance.',
        parsed_skills='Python, Pandas, NumPy, Scikit-Learn, SQL'
    )
    db.session.add(student2)
    db.session.flush()

    # Applications
    app1 = Application(
        student_id=student1.id,
        internship_id=int1.id,
        match_score=92.5,
        status='Shortlisted'
    )
    app2 = Application(
        student_id=student2.id,
        internship_id=int3.id,
        match_score=95.0,
        status='Reviewed'
    )
    db.session.add_all([app1, app2])
    db.session.commit()
    print("Database seeding completed.")

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
