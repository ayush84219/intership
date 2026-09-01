from datetime import datetime
from . import db

class Application(db.Model):
    __tablename__ = 'applications'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='CASCADE'), nullable=False)
    internship_id = db.Column(db.Integer, db.ForeignKey('internships.id', ondelete='CASCADE'), nullable=False)
    match_score = db.Column(db.Float, default=0.0)  # Calculated AI match score (0-100)
    status = db.Column(db.String(20), default='Pending')  # 'Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected'
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text)

    __table_args__ = (
        db.UniqueConstraint('student_id', 'internship_id', name='unique_student_internship_app'),
    )
