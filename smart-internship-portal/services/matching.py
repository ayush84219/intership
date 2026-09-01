import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_match_score(student, internship):
    """
    Calculate a percentage match score (0.0 to 100.0) between a Student profile and an Internship requirement.
    Uses hybrid approach combining Skill Set Overlap (60% weight) + TF-IDF Vector Cosine Similarity (40% weight).
    """
    # 1. Skill Overlap Calculation
    student_skills = student.get_skills_list()
    required_skills = internship.get_skills_list()

    skill_score = 0.0
    if required_skills:
        matched_count = 0
        for req in required_skills:
            req_lower = req.lower()
            # Check direct match or substring match
            if any(req_lower == s or req_lower in s or s in req_lower for s in student_skills):
                matched_count += 1
        
        skill_score = (matched_count / len(required_skills)) * 100.0
    else:
        skill_score = 70.0  # Default baseline if no specific required skills specified

    # 2. Text Similarity (Bio/Skills/Major vs Internship Title/Description)
    student_text_parts = [
        " ".join(student_skills),
        student.major or "",
        student.bio or "",
        student.parsed_skills or ""
    ]
    student_doc = " ".join([p for p in student_text_parts if p]).strip()

    internship_text_parts = [
        internship.title or "",
        " ".join(required_skills),
        internship.description or ""
    ]
    internship_doc = " ".join([p for p in internship_text_parts if p]).strip()

    text_sim_score = 0.0
    if student_doc and internship_doc:
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            tfidf = vectorizer.fit_transform([student_doc, internship_doc])
            cosine_sim = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
            text_sim_score = float(cosine_sim) * 100.0
        except Exception:
            text_sim_score = skill_score

    # 3. Hybrid Weighted Score
    final_score = (skill_score * 0.65) + (text_sim_score * 0.35)

    # GPA boost if applicable
    if student.gpa and student.gpa >= 3.5:
        final_score = min(100.0, final_score + 5.0)

    return round(final_score, 1)

def rank_students_for_internship(students, internship):
    """Rank a list of student objects for a given internship by calculated match score."""
    ranked = []
    for student in students:
        score = calculate_match_score(student, internship)
        ranked.append({
            "student": student,
            "score": score
        })
    # Sort descending by match score
    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked
