import os
import re

COMMON_SKILLS_TAXONOMY = [
    # Programming Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "php", "ruby", "swift", "kotlin", "html", "css", "sql",
    # Data Science & AI / ML
    "machine learning", "deep learning", "artificial intelligence", "data analysis", "pandas", "numpy", "scikit-learn",
    "tensorflow", "pytorch", "nlp", "natural language processing", "computer vision", "opencv", "matplotlib", "seaborn",
    # Web & Frameworks
    "react", "vue", "angular", "node.js", "express", "django", "flask", "fastapi", "spring boot", "asp.net", "bootstrap", "tailwind",
    # Cloud & DevOps & Tools
    "aws", "azure", "gcp", "docker", "kubernetes", "git", "github", "gitlab", "ci/cd", "linux", "bash", "jira", "agile", "scrum",
    # Databases
    "postgresql", "mysql", "mongodb", "sqlite", "redis", "elasticsearch", "firebase",
    # Core & Soft Skills
    "problem solving", "communication", "teamwork", "leadership", "time management", "analytical skills"
]

def extract_text_from_filepath(file_path):
    """Extract raw text from PDF or TXT files."""
    if not os.path.exists(file_path):
        return ""

    ext = os.path.splitext(file_path)[1].lower()
    text = ""

    if ext == '.pdf':
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
    else:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")

    return text

def extract_skills(text):
    """Extract recognized technical and domain skills from raw resume text."""
    if not text:
        return []

    text_lower = text.lower()
    found_skills = set()

    for skill in COMMON_SKILLS_TAXONOMY:
        # Match as full word boundaries to avoid false positives (e.g. 'c' inside 'cat')
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Format nicely
            found_skills.add(skill.title() if len(skill) > 3 else skill.upper())

    return list(found_skills)

def parse_resume_content(file_path):
    """Main interface to parse resume and return dictionary with text and extracted skills."""
    raw_text = extract_text_from_filepath(file_path)
    skills = extract_skills(raw_text)

    return {
        "raw_text": raw_text,
        "extracted_skills": skills,
        "skills_comma_separated": ", ".join(skills)
    }
