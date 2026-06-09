"""
profiles.py — The Date Crew
=============================
Programmatic generation of 100+ diverse Indian profiles for the matchmaking platform.

Generates profiles with all required fields including:
- Personal: name, DOB, phone, gender, height, city
- Professional: company, designation, college, degree, income
- Cultural: religion, caste, diet, mother tongue, languages
- Lifestyle: hobbies, smoking, drinking, pets, relocate, children
- Marital: marital status
"""

from __future__ import annotations

import random
import hashlib
from datetime import date, timedelta

# ---------------------------------------------------------------------------
# Base Data Pools
# ---------------------------------------------------------------------------

_FEMALE_FIRST_NAMES = [
    "Aadhira", "Aanya", "Aditi", "Aisha", "Amara", "Ananya", "Anjali", "Anushka",
    "Aparna", "Arunima", "Avni", "Bhavya", "Charvi", "Diya", "Divya", "Esha",
    "Gauri", "Harini", "Isha", "Ishita", "Jhanvi", "Juhi", "Kavya", "Keerthi",
    "Kiara", "Kriti", "Lavanya", "Mahima", "Manasi", "Meera", "Mira", "Mitali",
    "Myra", "Naina", "Navya", "Neha", "Nidhi", "Nikita", "Nisha", "Pallavi",
    "Pooja", "Prachi", "Pragya", "Priya", "Radhika", "Rashi", "Reema", "Rhea",
    "Ridhi", "Riya", "Ruhi", "Saanvi", "Samaira", "Sana", "Sanvi", "Sara",
    "Saumya", "Shanaya", "Shreya", "Sia", "Simran", "Sneha", "Sonali", "Srishti",
    "Suhana", "Swara", "Tanvi", "Tanya", "Trisha", "Urvi", "Vaani", "Vaishnavi",
    "Vanshika", "Vedika", "Vidya", "Vrinda", "Yamini", "Zara", "Zoya", "Anamika",
    "Deepika", "Fatima", "Gayatri", "Hema", "Indira", "Jasleen", "Kajal", "Lata",
    "Madhuri", "Nandini", "Oviya", "Padma", "Ritika", "Sakshi", "Tamanna", "Uma",
    "Vani", "Wafa", "Yasmin", "Zarina",
]

_MALE_FIRST_NAMES = [
    "Arjun", "Vikram", "Rohan", "Aditya", "Karan", "Rahul", "Varun", "Nikhil",
    "Siddharth", "Aarav", "Dev", "Ishaan", "Kabir", "Manish", "Pranav",
]

_LAST_NAMES = [
    "Sharma", "Patel", "Mehta", "Gupta", "Singh", "Reddy", "Nair", "Iyer",
    "Khan", "Joshi", "Verma", "Das", "Bose", "Chopra", "Kapoor", "Malhotra",
    "Agarwal", "Banerjee", "Chatterjee", "Deshpande", "Kulkarni", "Menon",
    "Mukherjee", "Pandey", "Rao", "Saxena", "Thakur", "Trivedi", "Yadav",
    "Ahuja", "Bhat", "Chauhan", "Dubey", "Fernandes", "Gill", "Hegde",
    "Jacob", "Kaur", "Lal", "Mishra", "Naidu", "Pillai", "Rajan", "Sinha",
    "Thomas", "Upadhyay", "Varma", "Wagh", "Xavier", "D'Souza",
]

_CITIES = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune",
    "Chennai", "Kolkata", "Jaipur", "Ahmedabad", "Lucknow",
    "Chandigarh", "Kochi", "Indore", "Nagpur", "Vadodara",
]

_RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist"]
_RELIGION_WEIGHTS = [0.50, 0.18, 0.10, 0.08, 0.07, 0.07]

_CASTES_BY_RELIGION = {
    "Hindu": ["Brahmin", "Kshatriya", "Vaishya", "Open", "Open", "Open"],
    "Muslim": ["Sunni", "Shia", "Open", "Open"],
    "Christian": ["Catholic", "Protestant", "Syrian Christian", "Open"],
    "Sikh": ["Jat", "Khatri", "Open", "Open"],
    "Jain": ["Digambar", "Shwetambar", "Open"],
    "Buddhist": ["Open", "Open", "Navayana"],
}

_MOTHER_TONGUES = [
    "Hindi", "Tamil", "Telugu", "Kannada", "Bengali",
    "Marathi", "Gujarati", "Punjabi", "Malayalam", "Odia",
    "Urdu", "Assamese", "Konkani",
]

_DIETS = ["Vegetarian", "Non-Vegetarian", "Eggetarian", "Vegan"]
_DIET_WEIGHTS = [0.35, 0.40, 0.18, 0.07]

_PROFESSIONS = [
    "Software Engineer", "Doctor", "Architect", "Teacher",
    "Marketing Manager", "Chartered Accountant", "Lawyer",
    "Fashion Designer", "Data Scientist", "Content Creator",
    "HR Manager", "Journalist", "Startup Founder", "Graphic Designer",
    "Pharmacist", "Civil Engineer", "Product Manager", "UX Designer",
    "Investment Banker", "Research Scientist", "Dentist", "Psychologist",
    "Physiotherapist", "Veterinarian", "Pilot", "Chef",
    "Interior Designer", "Event Manager", "Digital Marketer", "Animator",
]

_COMPANIES = [
    "Infosys", "TCS", "Wipro", "Google India", "Microsoft India",
    "Amazon India", "Flipkart", "Zomato", "Swiggy", "Paytm",
    "HDFC Bank", "ICICI Bank", "Reliance Industries", "Tata Group",
    "Mahindra Group", "Deloitte India", "EY India", "PwC India",
    "Apollo Hospitals", "Fortis Healthcare", "Max Healthcare",
    "Byju's", "Razorpay", "PhonePe", "CRED", "Zerodha",
    "Freshworks", "Zoho", "Ola", "MakeMyTrip",
    "HCL Technologies", "Tech Mahindra", "Accenture India",
    "Samsung India", "LG Electronics India", "Bharti Airtel",
    "Jio", "Vedanta", "Adani Group", "JSW Steel",
    "Self-Employed", "Freelancer", "Own Practice",
]

_DESIGNATIONS = [
    "Associate", "Senior Associate", "Analyst", "Senior Analyst",
    "Consultant", "Manager", "Senior Manager", "Lead",
    "Associate Director", "Director", "VP", "AVP",
    "Founder", "Co-Founder", "Specialist", "Executive",
    "Officer", "Coordinator", "Head", "Partner",
]

_COLLEGES = [
    "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
    "IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "IIM Lucknow",
    "BITS Pilani", "NIT Trichy", "NIT Warangal", "NIT Surathkal",
    "Delhi University", "Mumbai University", "Anna University",
    "Jadavpur University", "Pune University", "Bangalore University",
    "AIIMS Delhi", "AIIMS Jodhpur", "CMC Vellore", "MAMC Delhi",
    "NLSIU Bangalore", "NLU Delhi", "NALSAR Hyderabad",
    "NIFT Delhi", "NIFT Mumbai", "Pearl Academy",
    "St. Xavier's Mumbai", "Loyola Chennai", "Christ University",
    "Manipal University", "Amity University", "VIT Vellore",
    "SRM University", "Symbiosis Pune", "NMIMS Mumbai",
    "ISB Hyderabad", "XLRI Jamshedpur", "SP Jain Mumbai",
    "Lady Shri Ram College", "Miranda House", "Hansraj College",
    "Presidency University", "Fergusson College", "St. Stephen's College",
]

_DEGREES = [
    "B.Tech", "B.E.", "MBBS", "MBA", "B.Com", "BA", "B.Sc",
    "MA", "M.Tech", "M.Sc", "LLB", "BArch", "BBA", "BCA",
    "B.Pharm", "BDS", "BAMS", "PhD", "B.Des", "M.Des",
    "CA", "CS", "CFA", "B.Ed", "MCA", "PGDM",
]

_HOBBIES_POOL = [
    "Reading", "Yoga", "Travel", "Photography", "Cooking",
    "Dancing", "Painting", "Music", "Hiking", "Swimming",
    "Gardening", "Meditation", "Writing", "Cycling", "Running",
    "Movies", "Theater", "Singing", "Guitar", "Piano",
    "Badminton", "Tennis", "Cricket", "Gym", "Boxing",
    "Pottery", "Calligraphy", "Baking", "Volunteering", "Chess",
    "Blogging", "Vlogging", "Anime", "Gaming", "Podcasting",
    "Bird Watching", "Astronomy", "Sketching", "Origami", "Knitting",
]

_ABOUT_TEMPLATES = [
    "A {profession} based in {city} who loves {hobby1} and {hobby2}. I believe in living life to the fullest and am looking for someone who shares my zest for life.",
    "Passionate {profession} with a love for {hobby1}. When I'm not working, you'll find me {hobby2_verb}. Looking for a genuine connection built on mutual respect and shared values.",
    "Creative soul working as a {profession} in {city}. My weekends are spent {hobby1_verb} and exploring new cafés. I value honesty, humor, and meaningful conversations.",
    "Driven {profession} who believes in balancing work and play. Love {hobby1}, {hobby2}, and trying new cuisines. Looking for someone who appreciates both ambition and adventure.",
    "{city}-based {profession} with a passion for {hobby1} and {hobby2}. I'm an old soul in a modern world — love deep conversations over chai. Family is everything to me.",
    "Enthusiastic {profession} who finds joy in {hobby1_verb} and {hobby2_verb}. I'm looking for a partner who values growth, kindness, and a good sense of humor.",
    "A curious {profession} living in {city}. I love exploring {hobby1} and spending quiet evenings with a good book. Seeking someone who's both grounded and adventurous.",
    "Warm-hearted {profession} passionate about {hobby1} and making a difference. I enjoy {hobby2_verb} on weekends and believe the best relationships are built on friendship first.",
    "Fun-loving {profession} from {city}. Whether it's {hobby1_verb} or catching the latest movie, I'm always up for something exciting. Looking for my partner in adventure!",
    "Thoughtful {profession} who enjoys {hobby1} and {hobby2}. I appreciate the little things in life — sunsets, good music, and heartfelt conversations. Let's create beautiful memories together.",
]

_LANGUAGES_BY_TONGUE = {
    "Hindi": ["Hindi", "English"],
    "Tamil": ["Tamil", "English", "Hindi"],
    "Telugu": ["Telugu", "English", "Hindi"],
    "Kannada": ["Kannada", "English", "Hindi"],
    "Bengali": ["Bengali", "English", "Hindi"],
    "Marathi": ["Marathi", "English", "Hindi"],
    "Gujarati": ["Gujarati", "English", "Hindi"],
    "Punjabi": ["Punjabi", "English", "Hindi"],
    "Malayalam": ["Malayalam", "English", "Hindi"],
    "Odia": ["Odia", "English", "Hindi"],
    "Urdu": ["Urdu", "English", "Hindi"],
    "Assamese": ["Assamese", "English", "Hindi"],
    "Konkani": ["Konkani", "English", "Hindi", "Marathi"],
}

_MARITAL_STATUSES = ["Never Married", "Divorced", "Widowed"]
_MARITAL_WEIGHTS = [0.80, 0.15, 0.05]

_SMOKE_OPTIONS = ["No", "Occasionally", "Yes"]
_SMOKE_WEIGHTS = [0.70, 0.20, 0.10]

_DRINK_OPTIONS = ["No", "Occasionally", "Yes"]
_DRINK_WEIGHTS = [0.50, 0.35, 0.15]

_RELOCATE_OPTIONS = ["Yes", "No", "Maybe"]
_PETS_OPTIONS = ["Yes", "No", "Maybe"]
_CHILDREN_OPTIONS = ["Yes", "No", "Maybe"]

_FAMILY_TYPES = ["Joint Family", "Nuclear Family"]
_FAMILY_TYPE_WEIGHTS = [0.35, 0.65]

_FAMILY_STATUSES = ["Middle Class", "Upper Middle Class", "Affluent", "Rich"]
_FAMILY_STATUS_WEIGHTS = [0.30, 0.40, 0.20, 0.10]

_FAMILY_VALUES = ["Traditional", "Moderate", "Liberal"]
_FAMILY_VALUES_WEIGHTS = [0.30, 0.45, 0.25]

_FATHER_OCCUPATIONS = [
    "Business", "Government Service", "Private Service", "Doctor",
    "Engineer", "Retired", "Lawyer", "Farmer", "Teacher", "Self-Employed",
]

_MOTHER_OCCUPATIONS = [
    "Homemaker", "Teacher", "Doctor", "Government Service",
    "Business", "Private Service", "Retired", "Self-Employed",
]
_MOTHER_OCCUPATION_WEIGHTS = [0.35, 0.12, 0.08, 0.10, 0.10, 0.10, 0.07, 0.08]

_LOCATION_FLEXIBILITY = ["Same City Only", "Same State", "Anywhere in India", "Open to Abroad"]
_LOCATION_FLEXIBILITY_WEIGHTS = [0.20, 0.25, 0.40, 0.15]

_STATUS_TAGS = ["New", "Active", "Premium", "Verified"]
_STATUS_TAG_WEIGHTS = [0.15, 0.45, 0.20, 0.20]

_STAGES = ["New Lead", "In Conversation", "Meeting Scheduled", "Decision Pending", "Matched"]
_STAGE_WEIGHTS = [0.20, 0.30, 0.25, 0.15, 0.10]


# ---------------------------------------------------------------------------
# Helper verb forms for bios
# ---------------------------------------------------------------------------

_HOBBY_VERBS = {
    "Reading": "reading", "Yoga": "practicing yoga", "Travel": "traveling",
    "Photography": "photography", "Cooking": "cooking", "Dancing": "dancing",
    "Painting": "painting", "Music": "listening to music", "Hiking": "hiking",
    "Swimming": "swimming", "Gardening": "gardening", "Meditation": "meditating",
    "Writing": "writing", "Cycling": "cycling", "Running": "running",
    "Movies": "watching movies", "Theater": "going to the theater",
    "Singing": "singing", "Guitar": "playing guitar", "Piano": "playing piano",
    "Badminton": "playing badminton", "Tennis": "playing tennis",
    "Cricket": "watching cricket", "Gym": "working out", "Boxing": "boxing",
    "Pottery": "making pottery", "Calligraphy": "practicing calligraphy",
    "Baking": "baking", "Volunteering": "volunteering", "Chess": "playing chess",
    "Blogging": "blogging", "Vlogging": "vlogging", "Anime": "watching anime",
    "Gaming": "gaming", "Podcasting": "listening to podcasts",
    "Bird Watching": "bird watching", "Astronomy": "stargazing",
    "Sketching": "sketching", "Origami": "doing origami", "Knitting": "knitting",
}


# ---------------------------------------------------------------------------
# Profile Generator
# ---------------------------------------------------------------------------

def _generate_siblings() -> str:
    """Generate a realistic siblings description string."""
    brothers = random.randint(0, 2)
    sisters = random.randint(0, 2)
    parts = []
    if brothers:
        parts.append(f"{brothers} Brother{'s' if brothers > 1 else ''}")
    if sisters:
        parts.append(f"{sisters} Sister{'s' if sisters > 1 else ''}")
    return ', '.join(parts) if parts else 'None'


def _generate_phone() -> str:
    """Generate a realistic Indian phone number."""
    prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "88", "87", "86", "85", "70", "73", "74", "75", "76", "77", "78", "79"]
    return f"+91 {random.choice(prefixes)}{random.randint(10000000, 99999999)}"


def _generate_dob(age: int) -> str:
    """Generate a date of birth string from age."""
    today = date.today()
    birth_year = today.year - age
    birth_month = random.randint(1, 12)
    birth_day = random.randint(1, 28)
    return f"{birth_year}-{birth_month:02d}-{birth_day:02d}"


def _generate_bio(profession: str, city: str, hobbies: list[str]) -> str:
    """Generate a warm, personal bio from a template."""
    template = random.choice(_ABOUT_TEMPLATES)
    h1 = hobbies[0] if hobbies else "reading"
    h2 = hobbies[1] if len(hobbies) > 1 else "travel"
    h1_verb = _HOBBY_VERBS.get(h1, h1.lower())
    h2_verb = _HOBBY_VERBS.get(h2, h2.lower())

    return template.format(
        profession=profession,
        city=city,
        hobby1=h1.lower(),
        hobby2=h2.lower(),
        hobby1_verb=h1_verb,
        hobby2_verb=h2_verb,
    )


def _weighted_choice(options: list, weights: list):
    """Pick a weighted random choice."""
    return random.choices(options, weights=weights, k=1)[0]


def _make_profile(
    pid: str,
    gender: str,
    first_names: list[str],
    age_range: tuple[int, int],
    height_range: tuple[int, int],
    used_names: set,
) -> dict:
    """Generate a single diverse profile."""
    # Pick unique name
    while True:
        first = random.choice(first_names)
        last = random.choice(_LAST_NAMES)
        full_name = f"{first} {last}"
        if full_name not in used_names:
            used_names.add(full_name)
            break

    age = random.randint(*age_range)
    city = random.choice(_CITIES)
    religion = _weighted_choice(_RELIGIONS, _RELIGION_WEIGHTS)
    caste = random.choice(_CASTES_BY_RELIGION.get(religion, ["Open"]))
    mother_tongue = random.choice(_MOTHER_TONGUES)
    diet = _weighted_choice(_DIETS, _DIET_WEIGHTS)
    profession = random.choice(_PROFESSIONS)
    hobbies = random.sample(_HOBBIES_POOL, k=random.randint(3, 5))
    income = round(random.uniform(4, 35), 1)
    height = random.randint(*height_range)
    education = random.choice(_DEGREES)
    college = random.choice(_COLLEGES)
    company = random.choice(_COMPANIES)
    designation = random.choice(_DESIGNATIONS)
    marital = _weighted_choice(_MARITAL_STATUSES, _MARITAL_WEIGHTS)
    languages = list(_LANGUAGES_BY_TONGUE.get(mother_tongue, ["English", "Hindi"]))
    # Sometimes add an extra language
    if random.random() > 0.6:
        extra = random.choice(["French", "German", "Spanish", "Japanese", "Korean", "Sanskrit"])
        if extra not in languages:
            languages.append(extra)

    return {
        "id": pid,
        "name": full_name,
        "first_name": first,
        "last_name": last,
        "age": age,
        "date_of_birth": _generate_dob(age),
        "gender": gender,
        "height_cm": height,
        "city": city,
        "phone": _generate_phone(),
        "profession": profession,
        "company": company,
        "designation": designation,
        "income_lpa": income,
        "religion": religion,
        "caste": caste,
        "mother_tongue": mother_tongue,
        "languages": languages,
        "education": education,
        "college": college,
        "diet": diet,
        "hobbies": hobbies,
        "about": _generate_bio(profession, city, hobbies),
        "open_to_relocate": random.choice(_RELOCATE_OPTIONS),
        "open_to_pets": random.choice(_PETS_OPTIONS),
        "wants_children": random.choice(_CHILDREN_OPTIONS),
        "marital_status": marital,
        "photo_url": f"https://api.dicebear.com/9.x/avataaars/svg?seed={full_name.replace(' ', '')}",
        "smoking": _weighted_choice(_SMOKE_OPTIONS, _SMOKE_WEIGHTS),
        "drinking": _weighted_choice(_DRINK_OPTIONS, _DRINK_WEIGHTS),
        # --- New fields ---
        "family_type": _weighted_choice(_FAMILY_TYPES, _FAMILY_TYPE_WEIGHTS),
        "family_status": _weighted_choice(_FAMILY_STATUSES, _FAMILY_STATUS_WEIGHTS),
        "family_values": _weighted_choice(_FAMILY_VALUES, _FAMILY_VALUES_WEIGHTS),
        "father_occupation": random.choice(_FATHER_OCCUPATIONS),
        "mother_occupation": _weighted_choice(_MOTHER_OCCUPATIONS, _MOTHER_OCCUPATION_WEIGHTS),
        "siblings": _generate_siblings(),
        "photo_verified": random.random() < 0.70,
        "income_verified": random.random() < 0.50,
        "country": "India",
        "location_flexibility": _weighted_choice(_LOCATION_FLEXIBILITY, _LOCATION_FLEXIBILITY_WEIGHTS),
        "status_tag": _weighted_choice(_STATUS_TAGS, _STATUS_TAG_WEIGHTS),
        "stage": _weighted_choice(_STAGES, _STAGE_WEIGHTS),
    }


# ---------------------------------------------------------------------------
# Generate All Profiles
# ---------------------------------------------------------------------------

# Seed for reproducibility across restarts
random.seed(42)

used_names: set[str] = set()

# Generate 100 female profiles
FEMALE_PROFILES: list[dict] = []
for i in range(1, 101):
    profile = _make_profile(
        pid=f"f{i}",
        gender="female",
        first_names=_FEMALE_FIRST_NAMES,
        age_range=(22, 35),
        height_range=(150, 175),
        used_names=used_names,
    )
    FEMALE_PROFILES.append(profile)

# Generate 5 male demo user profiles
MALE_PROFILES: list[dict] = []
_male_overrides = [
    {"first": "Arjun", "last": "Mehta", "age": 28, "city": "Mumbai", "profession": "Software Engineer",
     "company": "Google India", "designation": "Senior Engineer", "income": 25.0, "religion": "Hindu",
     "diet": "Non-Vegetarian", "education": "B.Tech", "college": "IIT Bombay"},
    {"first": "Vikram", "last": "Singh", "age": 31, "city": "Delhi", "profession": "Investment Banker",
     "company": "HDFC Bank", "designation": "AVP", "income": 30.0, "religion": "Sikh",
     "diet": "Non-Vegetarian", "education": "MBA", "college": "IIM Ahmedabad"},
    {"first": "Rohan", "last": "Patel", "age": 26, "city": "Ahmedabad", "profession": "Startup Founder",
     "company": "Self-Employed", "designation": "Founder", "income": 18.0, "religion": "Jain",
     "diet": "Vegetarian", "education": "B.Tech", "college": "BITS Pilani"},
    {"first": "Aditya", "last": "Nair", "age": 29, "city": "Bengaluru", "profession": "Product Manager",
     "company": "Flipkart", "designation": "Senior Manager", "income": 22.0, "religion": "Hindu",
     "diet": "Eggetarian", "education": "MBA", "college": "ISB Hyderabad"},
    {"first": "Karan", "last": "Kapoor", "age": 33, "city": "Pune", "profession": "Doctor",
     "company": "Apollo Hospitals", "designation": "Consultant", "income": 28.0, "religion": "Hindu",
     "diet": "Vegetarian", "education": "MBBS", "college": "AIIMS Delhi"},
]

for i, ovr in enumerate(_male_overrides, 1):
    p = _make_profile(
        pid=f"m{i}",
        gender="male",
        first_names=_MALE_FIRST_NAMES,
        age_range=(25, 38),
        height_range=(165, 185),
        used_names=used_names,
    )
    # Apply manual overrides for demo consistency
    p.update({
        "first_name": ovr["first"],
        "last_name": ovr["last"],
        "name": f"{ovr['first']} {ovr['last']}",
        "age": ovr["age"],
        "date_of_birth": _generate_dob(ovr["age"]),
        "city": ovr["city"],
        "profession": ovr["profession"],
        "company": ovr["company"],
        "designation": ovr["designation"],
        "income_lpa": ovr["income"],
        "religion": ovr["religion"],
        "diet": ovr["diet"],
        "education": ovr["education"],
        "college": ovr["college"],
        "photo_url": f"https://api.dicebear.com/9.x/avataaars/svg?seed={ovr['first']}{ovr['last']}",
    })
    MALE_PROFILES.append(p)

# Combined lookup
ALL_PROFILES: dict[str, dict] = {p["id"]: p for p in FEMALE_PROFILES + MALE_PROFILES}

# Reset random seed so runtime behavior varies
random.seed()

# Quick stats log
print(f"[profiles] Loaded {len(FEMALE_PROFILES)} female + {len(MALE_PROFILES)} male = {len(ALL_PROFILES)} total profiles")
