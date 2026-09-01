from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from . import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'company', 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student_profile = db.relationship('Student', backref='user', uselist=False, cascade="all, delete-orphan")
    company_profile = db.relationship('Company', backref='user', uselist=False, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    university = db.Column(db.String(150))
    major = db.Column(db.String(100))
    graduation_year = db.Column(db.Integer)
    gpa = db.Column(db.Float)
    skills = db.Column(db.Text)  # Comma separated skills e.g., "Python, Machine Learning, SQL"
    bio = db.Column(db.Text)
    resume_filename = db.Column(db.String(255))
    parsed_skills = db.Column(db.Text)  # Skills extracted automatically from resume

    applications = db.relationship('Application', backref='student', lazy=True, cascade="all, delete-orphan")

    def get_skills_list(self):
        all_skills = set()
        if self.skills:
            all_skills.update([s.strip().lower() for s in self.skills.split(',') if s.strip()])
        if self.parsed_skills:
            all_skills.update([s.strip().lower() for s in self.parsed_skills.split(',') if s.strip()])
        return list(all_skills)
