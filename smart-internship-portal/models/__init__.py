from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .student import User, Student
from .company import Company
from .internship import Internship
from .application import Application
