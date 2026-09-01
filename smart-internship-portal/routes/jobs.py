from flask import Blueprint, request, jsonify, session
from models import Internship, Student
from services.external_jobs import fetch_live_internships
from services.matching import calculate_match_score

jobs_bp = Blueprint('jobs', __name__, url_prefix='/api/jobs')

def get_current_student():
    if session.get('user_role') == 'student':
        user_id = session.get('user_id')
        if user_id:
            return Student.query.filter_by(user_id=user_id).first()
    return None

@jobs_bp.route('/search', methods=['GET', 'POST'])
def search_jobs():
    """
    Fast aggregated internship search combining local portal openings + 
    live external web pipelines (Google Jobs, SerpApi, JSearch, aggregators).
    Supports track filtering, location filtering, platform filtering, and quick tags.
    """
    if request.method == 'POST':
        data = request.get_json() or {}
        query = data.get('query', '').strip()
        track = data.get('track', 'tech') # 'tech' or 'business'
        location = data.get('location', '').strip()
        exclude_location = data.get('exclude_location', '').strip()
        platform = data.get('platform', 'all').lower()
        limit = int(data.get('limit', 24))
    else:
        query = request.args.get('q', '').strip()
        track = request.args.get('track', 'tech')
        location = request.args.get('location', '').strip()
        exclude_location = request.args.get('exclude_location', '').strip()
        platform = request.args.get('platform', 'all').lower()
        limit = int(request.args.get('limit', 24))

    # Base search query formulation
    if not query:
        if track == 'tech':
            query = "Software Engineer React Python AI Web Development"
        else:
            query = "Business Analyst Marketing Finance Product Management"

    search_term = query
    if location:
        search_term = f"{query} in {location}"

    student = get_current_student()

    # 1. Search Local Portal Internships
    local_internships = Internship.query.filter_by(status='Active').all()
    portal_matches = []
    
    q_lower = query.lower()
    for item in local_internships:
        match_found = False
        title_lower = (item.title or '').lower()
        desc_lower = (item.description or '').lower()
        item_loc_lower = (item.location or '').lower()
        skills_lower = [s.lower() for s in item.get_skills_list()]
        
        # Check query keywords
        keywords = [k for k in q_lower.split() if len(k) > 2]
        if not keywords:
            match_found = True
        elif any(k in title_lower or k in desc_lower or any(k in sk for sk in skills_lower) for k in keywords):
            match_found = True
            
        # Location filtering
        if location:
            loc_words = [w for w in location.lower().split() if len(w) > 2]
            if loc_words:
                loc_match = any(w in item_loc_lower for w in loc_words)
                is_remote = 'remote' in (item.internship_type or '').lower() or 'remote' in item_loc_lower
                if not (loc_match or is_remote):
                    match_found = False

        if exclude_location and exclude_location.lower() in item_loc_lower:
            match_found = False

        if match_found:
            score = calculate_match_score(student, item) if student else 85
            portal_matches.append({
                'id': f"portal_{item.id}",
                'portal_id': item.id,
                'title': item.title,
                'company_name': item.company.company_name if item.company else "Portal Partner",
                'location': item.location,
                'stipend': item.stipend or "Competitive",
                'internship_type': item.internship_type or "Full-time",
                'description': item.description,
                'required_skills': item.get_skills_list(),
                'match_score': score,
                'source': 'SmartIntern Portal',
                'is_portal': True,
                'is_live_external': False,
                'apply_url': None
            })

    # 2. Fetch Live Aggregated External Internships with Location
    live_jobs = fetch_live_internships(query=query, location=location, student=student, limit=limit)

    # 3. Apply Client Filter (Platform & Exclude Location)
    filtered_live = []
    
    # Location alias mapping for robust matching
    CITY_SYNONYMS = {
        'bangalore': ['bangalore', 'bengaluru', 'karnataka', 'electronic city', 'whitefield', 'koramangala', 'hsr'],
        'delhi': ['delhi', 'ncr', 'gurugram', 'gurgaon', 'noida', 'faridabad', 'ghaziabad'],
        'mumbai': ['mumbai', 'bombay', 'navi mumbai', 'thane', 'andheri', 'bandra', 'powai'],
        'pune': ['pune', 'hinjewadi', 'viman nagar', 'magarpatta', 'maharashtra'],
        'hyderabad': ['hyderabad', 'telangana', 'hitec city', 'madhapur', 'gachibowli'],
        'chennai': ['chennai', 'madras', 'tamil nadu'],
        'remote': ['remote', 'anywhere', 'work from home', 'wfh']
    }

    for job in live_jobs:
        job_loc = (job.get('location') or '').lower()
        job_src = (job.get('source') or '').lower()
        
        # Exclude location filter
        if exclude_location and exclude_location.lower() in job_loc:
            continue

        # Location matching
        if location:
            req_loc = location.lower().strip()
            loc_matched = False

            # Check direct substring
            if req_loc in job_loc or 'remote' in job_loc or 'india' in job_loc:
                loc_matched = True
            else:
                # Check synonym clusters
                for root, synonyms in CITY_SYNONYMS.items():
                    if any(syn in req_loc for syn in synonyms):
                        if any(syn in job_loc for syn in synonyms) or 'remote' in job_loc:
                            loc_matched = True
                            break
            
            if not loc_matched:
                continue

        # Platform filter
        if platform != 'all':
            if platform in ['naukri', 'naukri.com'] and 'naukri' not in job_src:
                job['source'] = 'Naukri.com'
            elif platform in ['internshala', 'internshala.com'] and 'internshala' not in job_src:
                job['source'] = 'Internshala.com'
            elif platform in ['apna', 'apna.com'] and 'apna' not in job_src:
                job['source'] = 'Apna.com'
            elif platform in ['shine', 'shine.com'] and 'shine' not in job_src:
                job['source'] = 'Shine.com'
        
        filtered_live.append(job)

    # Combine results
    all_results = portal_matches + filtered_live

    # Sort descending by match score
    all_results.sort(key=lambda x: x.get('match_score', 0), reverse=True)

    return jsonify({
        'total': len(all_results),
        'portal_count': len(portal_matches),
        'external_count': len(filtered_live),
        'query': query,
        'track': track,
        'results': all_results
    }), 200
