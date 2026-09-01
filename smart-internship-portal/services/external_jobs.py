import requests
import time
from config import Config
from services.matching import calculate_match_score

# In-memory cache: { query_key: { "data": [...], "ts": timestamp } }
_cache = {}
CACHE_TTL = 300  # 5 minutes


class MockInternship:
    def __init__(self, title, description, required_skills):
        self.title = title
        self.description = description
        self.required_skills = required_skills
        self.location = "Remote"
        self.gpa = None

    def get_skills_list(self):
        if not self.required_skills:
            return []
        if isinstance(self.required_skills, list):
            return [s.strip().lower() for s in self.required_skills if s]
        return [s.strip().lower() for s in self.required_skills.split(',') if s.strip()]


SKILL_KEYWORDS = [
    "python", "javascript", "typescript", "react", "vue", "angular", "node",
    "flask", "django", "fastapi", "sql", "mysql", "postgresql", "mongodb",
    "machine learning", "deep learning", "data analysis", "data science",
    "java", "c++", "c#", "go", "rust", "swift", "kotlin",
    "aws", "azure", "gcp", "docker", "kubernetes", "linux", "git",
    "html", "css", "tailwind", "figma", "ui/ux", "photoshop",
    "excel", "power bi", "tableau", "tensorflow", "pytorch", "pandas",
    "nlp", "computer vision", "blockchain", "cybersecurity", "networking",
    "embedded", "iot", "arduino", "matlab", "r", "scala"
]


def _extract_skills(text):
    text_lower = text.lower()
    return [sk.title() for sk in SKILL_KEYWORDS if sk in text_lower]


def _compute_match(student, title, description, skills):
    if not student:
        return 75
    mock = MockInternship(title, description, skills)
    return calculate_match_score(student, mock)


def _fetch_serpapi(query, location=None, limit=15):
    """Fetch from SerpApi Google Jobs with accurate location parameters."""
    key = Config.SERPAPI_API_KEY
    if not key:
        return []

    q_term = query if "intern" in query.lower() else f"{query} internship"
    if location and "remote" not in location.lower() and location.lower() not in q_term.lower():
        q_term = f"{q_term} in {location}"

    params = {
        "engine": "google_jobs",
        "q": q_term,
        "api_key": key,
        "num": limit,
        "hl": "en"
    }

    if location:
        params["location"] = location
        loc_lower = location.lower()
        # If searching Indian cities/states or India, set country code to 'in'
        india_keywords = ["india", "bangalore", "bengaluru", "delhi", "mumbai", "hyderabad", "pune", "noida", "gurugram", "chennai", "kolkata", "ahmedabad"]
        if any(ik in loc_lower for ik in india_keywords):
            params["gl"] = "in"
        else:
            params["gl"] = "us"
    else:
        params["gl"] = "in"  # Default to user primary region

    try:
        r = requests.get("https://serpapi.com/search.json", params=params, timeout=12)
        if r.status_code != 200:
            print(f"[SerpApi] Error {r.status_code}: {r.text[:200]}")
            return []
        jobs = r.json().get("jobs_results", [])[:limit]
        results = []
        for i, job in enumerate(jobs):
            title = job.get("title", "Internship Position")
            company = job.get("company_name", "Tech Employer")
            job_loc = job.get("location", location or "Remote")
            description = job.get("description", "")
            ext = job.get("detected_extensions", {})
            salary = ext.get("salary") or "Competitive Stipend"
            apply_options = job.get("apply_options", [])
            apply_url = apply_options[0].get("link") if apply_options else f"https://www.google.com/search?q={_url_encode(title+' '+company+' internship')}"
            skills = _extract_skills(title + " " + description)
            results.append({
                "id": f"serp_{i}_{job.get('job_id', i)}",
                "title": title,
                "company_name": company,
                "location": job_loc,
                "stipend": salary,
                "description": description[:300] + "..." if len(description) > 300 else description,
                "full_description": description,
                "required_skills": skills if skills else ["General Tech"],
                "apply_url": apply_url,
                "source": "Google Jobs",
                "is_live_external": True,
                "match_score": 75
            })
        return results
    except Exception as e:
        print(f"[SerpApi] Exception: {e}")
        return []


def _fetch_jsearch(query, location=None, limit=10):
    """Fetch from JSearch RapidAPI with location filtering."""
    key = Config.JSEARCH_API_KEY
    host = Config.JSEARCH_API_HOST
    if not key or not host:
        return []

    q_term = query if "intern" in query.lower() else f"{query} internship"
    if location:
        q_term = f"{q_term} in {location}"

    headers = {
        "x-rapidapi-key": key,
        "x-rapidapi-host": host
    }
    params = {
        "query": q_term,
        "page": "1",
        "num_pages": "1",
        "date_posted": "all"
    }
    try:
        r = requests.get(f"https://{host}/search", headers=headers, params=params, timeout=10)
        if r.status_code != 200:
            print(f"[JSearch] Error {r.status_code}: {r.text[:200]}")
            return []
        jobs = r.json().get("data", [])[:limit]
        results = []
        for i, job in enumerate(jobs):
            title = job.get("job_title", "Internship")
            company = job.get("employer_name", "Company")
            city = job.get('job_city', '')
            country = job.get('job_country', '')
            job_loc = f"{city}, {country}".strip(", ") or (location or "Remote")
            description = job.get("job_description", "")
            salary_min = job.get("job_min_salary")
            salary = f"${salary_min}/mo" if salary_min else "Competitive Stipend"
            apply_url = job.get("job_apply_link") or f"https://www.google.com/search?q={_url_encode(title+' '+company)}"
            skills = _extract_skills(title + " " + description)
            results.append({
                "id": f"jsearch_{i}_{job.get('job_id', i)}",
                "title": title,
                "company_name": company,
                "location": job_loc,
                "stipend": salary,
                "description": description[:300] + "..." if len(description) > 300 else description,
                "full_description": description,
                "required_skills": skills if skills else ["General Tech"],
                "apply_url": apply_url,
                "source": "JSearch",
                "is_live_external": True,
                "match_score": 75
            })
        return results
    except Exception as e:
        print(f"[JSearch] Exception: {e}")
        return []


def fetch_live_internships(query="software internship", location=None, student=None, limit=24):
    """
    Fetch live internships using SerpApi + JSearch with location support and caching.
    Computes AI match scores if student object is provided.
    """
    cache_key = f"{query.strip().lower()}_loc_{str(location).strip().lower()}"
    now = time.time()

    # Return cached result if fresh
    if cache_key in _cache and (now - _cache[cache_key]["ts"]) < CACHE_TTL:
        jobs = _cache[cache_key]["data"]
        # Compute match scores per student
        if student:
            for job in jobs:
                job["match_score"] = _compute_match(student, job["title"], job.get("full_description", ""), job["required_skills"])
            jobs.sort(key=lambda x: x["match_score"], reverse=True)
        return jobs[:limit]

    # Fetch from both APIs
    serp_jobs = _fetch_serpapi(query, location=location, limit=14)
    jsearch_jobs = _fetch_jsearch(query, location=location, limit=10)

    # Merge and deduplicate by title+company
    seen = set()
    merged = []
    for job in serp_jobs + jsearch_jobs:
        key = f"{job['title'].lower()}_{job['company_name'].lower()}"
        if key not in seen:
            seen.add(key)
            merged.append(job)

    # Cache raw merged results
    _cache[cache_key] = {"data": merged, "ts": now}

    # Compute match scores
    if student:
        for job in merged:
            job["match_score"] = _compute_match(student, job["title"], job.get("full_description", ""), job["required_skills"])
        merged.sort(key=lambda x: x["match_score"], reverse=True)

    return merged[:limit]


def fetch_live_web_internships(query="internship", student=None, limit=10):
    return fetch_live_internships(query=query, location=None, student=student, limit=limit)


def _url_encode(text):
    import urllib.parse
    return urllib.parse.quote(text)
