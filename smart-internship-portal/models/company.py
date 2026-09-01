from . import db

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    company_name = db.Column(db.String(150), nullable=False)
    industry = db.Column(db.String(100))
    location = db.Column(db.String(100))
    website = db.Column(db.String(200))
    description = db.Column(db.Text)
    logo_filename = db.Column(db.String(255))
    is_verified = db.Column(db.Boolean, default=True)

    internships = db.relationship('Internship', backref='company', lazy=True, cascade="all, delete-orphan")
