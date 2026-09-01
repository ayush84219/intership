import os
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Ensure local directories exist
os.makedirs(os.path.join(BASE_DIR, 'database'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, 'static', 'uploads', 'resumes'), exist_ok=True)

def get_database_uri():
    db_url = os.environ.get('DATABASE_URL')
    if db_url:
        # Render PostgreSQL uses postgres:// which SQLAlchemy 1.4+ deprecated in favor of postgresql://
        if db_url.startswith('postgres://'):
            db_url = db_url.replace('postgres://', 'postgresql://', 1)
        # MySQL URL fallback
        elif db_url.startswith('mysql://') and not db_url.startswith('mysql+'):
            db_url = db_url.replace('mysql://', 'mysql+mysqlconnector://', 1)
        return db_url
    
    # Default local SQLite
    db_path = os.path.join(BASE_DIR, 'database', 'smart_internship.db')
    return f"sqlite:///{db_path}"

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'smart-internship-portal-secret-key-2026'
    SQLALCHEMY_DATABASE_URI = get_database_uri()
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
