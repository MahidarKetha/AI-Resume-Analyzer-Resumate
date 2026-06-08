from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import pdfplumber
import pytesseract
from PIL import Image
import io, re, json
import os

load_dotenv()
app = FastAPI(title="Resulyze Resume Analyzer – Groq")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

# ─────────────────────────────────────────────
#  TEXT EXTRACTION
# ─────────────────────────────────────────────

def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().rsplit(".", 1)[-1]
    if ext == "pdf":
        parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    parts.append(t)
        return "\n".join(parts)
    elif ext in ("png", "jpg", "jpeg"):
        img = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(img)
    return file_bytes.decode("utf-8", errors="ignore")


# ─────────────────────────────────────────────
#  PROMPT
# ─────────────────────────────────────────────

SYSTEM_PROMPT = """You are an expert ATS resume analyzer and career coach.
Analyze the resume for the given job and return ONLY valid JSON — no markdown fences, no extra text outside the JSON."""

USER_PROMPT = """
JOB CONTEXT:
Company: {company}
Job Title: {job_title}
Job Description: {job_description}

RESUME TEXT:
{resume_text}

Return EXACTLY this JSON structure with real analysis values (no placeholders):

{{
  "overall_score": <int 0-100>,
  "issues_count": <int>,

  "ats_scan": {{
    "score": <int 0-100>,
    "checks": [
      {{"label": "Clear formatting, readable by ATS",  "status": "pass|warn", "detail": "..."}},
      {{"label": "Keywords relevant to the job",        "status": "pass|warn", "detail": "..."}},
      {{"label": "Skills section detected",             "status": "pass|warn", "detail": "..."}},
      {{"label": "Contact information present",         "status": "pass|warn", "detail": "..."}},
      {{"label": "Parseable date formats",              "status": "pass|warn", "detail": "..."}}
    ]
  }},

  "tone_and_style": {{
    "score": <int 0-100>,
    "badge": "Excellent|Strong|Good Start|Needs Work",
    "summary_checks": [
      {{"label": "Professional Tone",     "status": "pass|warn"}},
      {{"label": "Inconsistent Tenses",   "status": "pass|warn"}},
      {{"label": "Aligned Layout",        "status": "pass|warn"}},
      {{"label": "First-Person Pronouns", "status": "pass|warn"}}
    ],
    "details": [
      {{
        "title": "Professional Tone: Clear and confident language",
        "status": "pass|warn",
        "description": "...",
        "bullets": []
      }},
      {{
        "title": "Inconsistent Tenses: Use past tense for past roles",
        "status": "pass|warn",
        "description": "",
        "bullets": ["Instead of: '...'", "Try: '...'"]
      }},
      {{
        "title": "Aligned Layout: Proper margins and spacing",
        "status": "pass|warn",
        "description": "...",
        "bullets": []
      }},
      {{
        "title": "First-Person Pronouns: Avoid 'I,' 'my,' etc.",
        "status": "pass|warn",
        "description": "",
        "bullets": ["Instead of: '...'", "Try: '...'"]
      }}
    ]
  }},

  "content": {{
    "score": <int 0-100>,
    "badge": "Excellent|Strong|Good Start|Needs Work",
    "summary_checks": [
      {{"label": "Tailor to Role",   "status": "pass|warn"}},
      {{"label": "Quantify Impact",  "status": "pass|warn"}},
      {{"label": "Use Action Verbs", "status": "pass|warn"}},
      {{"label": "Avoid Fluff",      "status": "pass|warn"}}
    ],
    "details": [
      {{
        "title": "Tailor to Role – Make content more job-specific",
        "status": "pass|warn",
        "description": "...",
        "bullets": []
      }},
      {{
        "title": "Quantify Impact – Add data to show results",
        "status": "pass|warn",
        "description": "",
        "bullets": ["Instead of: '...'", "Try: '...'"]
      }},
      {{
        "title": "Use Action Verbs – Start bullets with strong verbs",
        "status": "pass|warn",
        "description": "",
        "bullets": ["Tip: Begin with strong verbs that show initiative and impact.", "Replace 'Responsible for...' with: Led, Built, Created, Delivered, Optimised"]
      }},
      {{
        "title": "Avoid Fluff – Remove vague or filler phrases",
        "status": "pass|warn",
        "description": "...",
        "bullets": []
      }}
    ]
  }},

  "structure": {{
    "score": <int 0-100>,
    "badge": "Excellent|Strong|Good Start|Needs Work",
    "summary_checks": [
      {{"label": "Clear Section Headers", "status": "pass|warn"}},
      {{"label": "Logical Flow",          "status": "pass|warn"}},
      {{"label": "Appropriate Length",    "status": "pass|warn"}},
      {{"label": "Contact Info Present",  "status": "pass|warn"}}
    ],
    "details": [
      {{"title": "Clear Section Headers", "status": "pass|warn", "description": "...", "bullets": []}},
      {{"title": "Logical Flow",          "status": "pass|warn", "description": "...", "bullets": []}},
      {{"title": "Appropriate Length",    "status": "pass|warn", "description": "...", "bullets": []}},
      {{"title": "Contact Info Present",  "status": "pass|warn", "description": "...", "bullets": []}}
    ]
  }},

  "skills": {{
    "score": <int 0-100>,
    "badge": "Excellent|Strong|Good Start|Needs Work",
    "summary_checks": [
      {{"label": "Job-Matching Keywords",      "status": "pass|warn"}},
      {{"label": "Overstuffed Skills Section", "status": "pass|warn"}},
      {{"label": "Too Generic",                "status": "pass|warn"}},
      {{"label": "Outdated Technologies",      "status": "pass|warn"}}
    ],
    "details": [
      {{
        "title": "Relevant Skills Listed: Tools, tech, soft skills",
        "status": "pass|warn",
        "description": "...",
        "skill_tags": ["skill1", "skill2", "skill3"]
      }},
      {{
        "title": "Too Generic: Replace vague skills with specific ones",
        "status": "pass|warn",
        "description": "",
        "bullets": ["Instead of: '...'", "Try: '...'"]
      }},
      {{
        "title": "Outdated Technologies: Update your tech stack",
        "status": "pass|warn",
        "description": "...",
        "bullets": []
      }},
      {{
        "title": "Overstuffed Skills Section: Prioritise top skills",
        "status": "pass|warn",
        "description": "...",
        "bullets": []
      }}
    ]
  }},

  "checklist": [
    {{"label": "Add quantifiable achievements (e.g., Increased sales by 20%)", "checked": true}},
    {{"label": "Replace generic phrases with specific outcomes",                "checked": false}},
    {{"label": "Use a professional tone, avoid casual or conversational language", "checked": false}},
    {{"label": "Remove all first-person pronouns I, me, my",                   "checked": true}},
    {{"label": "Reorder sections for better impact e.g. Skills at top for tech roles", "checked": true}},
    {{"label": "Eliminate unnecessary white space or overly dense text",        "checked": false}},
    {{"label": "Add missing soft skills like communication or leadership",      "checked": false}},
    {{"label": "Tailor summary or objective to the specific job description",   "checked": false}}
  ]
}}
"""

# ─────────────────────────────────────────────
#  ROUTE
# ─────────────────────────────────────────────

@app.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    company_name: str  = Form(...),
    job_title: str     = Form(...),
    job_description: str = Form(""),
):
    file_bytes = await resume.read()
    text = extract_text(file_bytes, resume.filename)

    if not text.strip():
        return {"error": "Could not extract text from the uploaded file."}

    user_msg = USER_PROMPT.format(
        company=company_name,
        job_title=job_title,
        job_description=job_description or "Not provided",
        resume_text=text[:6000],
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_msg},
        ],
    )

    raw = response.choices[0].message.content.strip()

    # strip markdown fences if model adds them
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    # extract JSON object if there is extra text around it
    match = re.search(r'\{.*\}', raw, re.DOTALL)
    if match:
        raw = match.group()

    result = json.loads(raw)
    return result


@app.get("/health")
def health():
    return {"status": "ok"}