from datetime import datetime
from . import db

class Internship(db.Model):
    __tablename__ = 'internships'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.Text, nullable=False)  # Comma separated required skills
    stipend = db.Column(db.String(50))
    location = db.Column(db.String(100), nullable=False)
    internship_type = db.Column(db.String(50), default='Full-time')
    duration = db.Column(db.String(50), default='3 Months')
    deadline = db.Column(db.String(50))
    status = db.Column(db.String(20), default='Active')  # 'Active', 'Closed', 'Pending'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    applications = db.relationship('Application', backref='internship', lazy=True, cascade="all, delete-orphan")

    def get_skills_list(self):
        if not self.required_skills:
            return []
        return [s.strip().lower() for s in self.required_skills.split(',') if s.strip()]
