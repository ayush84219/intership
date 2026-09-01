import os
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'smart-internship-portal-secret-key-2026'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or f"sqlite:///{os.path.join(BASE_DIR, 'database', 'smart_internship.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads', 'resumes')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload size
    ALLOWED_EXTENSIONS = {'pdf', 'txt', 'docx'}

    # External APIs
    SERPAPI_API_KEY = os.environ.get('SERPAPI_API_KEY', '')
    JSEARCH_API_KEY = os.environ.get('JSEARCH_API_KEY', '')
    JSEARCH_API_HOST = os.environ.get('JSEARCH_API_HOST', 'jsearch.p.rapidapi.com')
    NEXTAUTH_SECRET = os.environ.get('NEXTAUTH_SECRET', '')
    NEXTAUTH_URL = os.environ.get('NEXTAUTH_URL', 'http://localhost:3005')
