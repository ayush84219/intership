-- Smart Internship Portal Database Schema (MySQL compatible)
-- Database: intership_portel

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('student', 'company', 'admin'))
);

CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    university VARCHAR(150),
    major VARCHAR(100),
    graduation_year INT,
    gpa FLOAT,
    skills TEXT,
    bio TEXT,
    resume_filename VARCHAR(255),
    parsed_skills TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS companies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    location VARCHAR(100),
    website VARCHAR(200),
    description TEXT,
    logo_filename VARCHAR(255),
    is_verified TINYINT(1) DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS internships (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT NOT NULL,
    stipend VARCHAR(50),
    location VARCHAR(100) NOT NULL,
    internship_type VARCHAR(50) DEFAULT 'Full-time',
    duration VARCHAR(50) DEFAULT '3 Months',
    deadline VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_internship_type CHECK (internship_type IN ('Full-time', 'Part-time', 'Remote', 'Hybrid')),
    CONSTRAINT chk_internship_status CHECK (status IN ('Active', 'Closed', 'Pending')),
    FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    internship_id INT NOT NULL,
    match_score FLOAT DEFAULT 0.0,
    status VARCHAR(20) DEFAULT 'Pending',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT chk_app_status CHECK (status IN ('Pending', 'Reviewed', 'Shortlisted', 'Accepted', 'Rejected')),
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    FOREIGN KEY (internship_id) REFERENCES internships (id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_internship (student_id, internship_id)
);
