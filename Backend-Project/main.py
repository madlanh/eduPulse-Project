from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import pickle
import os
import re # Import Regex untuk sorting angka

# 1. SETUP
app = FastAPI(title="EduPulse API", version="Final Fix 4.0 (Clean Chart)")

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=True, 
    allow_methods=["*"], allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"\n❌ GAGAL VALIDASI (422): {exc.errors()}") 
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# 2. LOAD DATA
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

try:
    user_df = pd.read_csv(os.path.join(DATA_DIR, "user_level_features_final_for_ML.csv"), encoding='utf-8-sig')
    score_df = pd.read_csv(os.path.join(DATA_DIR, "merged_score_data_cleaned.csv"), encoding='utf-8-sig')
    score_df['courseshortname'] = score_df['courseshortname'].astype(str).str.strip()

    with open(os.path.join(DATA_DIR, "recommendation_engine.pkl"), "rb") as f:
        ml_data = pickle.load(f)
        cluster_labels = ml_data["cluster_labels"]
    print("✅ Data & Model berhasil dimuat!")
except Exception as e:
    print(f"❌ Error loading data: {e}")
    user_df, score_df, cluster_labels = pd.DataFrame(), pd.DataFrame(), {}

# 3. HELPER FUNCTIONS
def clean_course_name(full_name):
    try:
        parts = str(full_name).split("IF-")
        subject = parts[0].strip().title()
        match = re.search(r"\[(.*?)\]", str(full_name))
        code = match.group(0) if match else ""
        return f"{subject} {code}"
    except:
        return str(full_name)

def fix_grade_value(grade):
    if pd.isna(grade): return 0
    val = float(grade)
    if val > 100: return 100.0
    return round(val, 1)

# --- FUNGSI BARU: MEMBERSIHKAN NAMA KUIS ---
def simplify_quiz_name(raw_name):
    raw_name = str(raw_name)
    if pd.isna(raw_name) or raw_name.lower() == 'nan': return "Unknown"
    
    # Deteksi pola umum
    if "Online Quiz" in raw_name:
        # Ambil angka kuisnya saja, misal "Online Quiz 1"
        parts = raw_name.split(":")
        if len(parts) > 0: return parts[0].strip()
    elif "Midterm" in raw_name:
        return "UTS"
    elif "Final Exam" in raw_name:
        return "UAS"
    
    return raw_name

# --- FUNGSI BARU: SORTING KUIS AGAR RAPI (Q1, Q2... UTS, UAS) ---
def sort_key_quiz(name):
    name = name.lower()
    if "uts" in name: return 1000  # UTS di tengah
    if "uas" in name: return 2000  # UAS di akhir
    
    # Jika ada angka (misal Quiz 2), ambil angkanya untuk sorting
    match = re.search(r'\d+', name)
    if match:
        return int(match.group())
    return 500 # Default jika tidak ada pola

# 4. API ENDPOINTS

# --- GET QUIZ DETAIL (REVISI LOGIKA AGREGASI) ---
@app.get("/api/student/quiz_detail")
def get_student_quiz_detail(
    user_id: int = Query(..., description="ID User"), 
    class_id: str = Query(..., description="ID Kelas")
):
    class_id_clean = class_id.strip()
    
    # 1. Filter Data Mentah
    details = score_df[
        (score_df["userid"] == user_id) & 
        (score_df["courseshortname"] == class_id_clean)
    ].copy()
    
    if details.empty:
        return []

    # 2. Buat Kolom Nama Bersih (Clean Name)
    details['clean_name'] = details['quizname'].apply(simplify_quiz_name)
    
    # 3. GROUPING & AGGREGATION (Solusi Duplikat)
    # Kita kelompokkan berdasarkan Nama Bersih, lalu ambil NILAI MAX
    # Jadi (Quiz 1: 80, Quiz 1 Remedial: 0) -> Diambil 80
    grouped = details.groupby('clean_name')['final_quiz_grade'].max().reset_index()
    
    # 4. Sorting Logis (Q1 -> Q2 -> UTS -> UAS)
    grouped['sort_key'] = grouped['clean_name'].apply(sort_key_quiz)
    grouped = grouped.sort_values('sort_key')
    
    # 5. Format Output JSON
    quiz_list = []
    for _, row in grouped.iterrows():
        final_score = fix_grade_value(row['final_quiz_grade'])
        
        # Opsional: Jangan tampilkan jika nilainya 0 (kecuali UTS/UAS biar tau kalau jeblok)
        # if final_score == 0 and "Quiz" in row['clean_name']: continue 

        quiz_list.append({
            "quiz_name": row['clean_name'],
            "full_name": row['clean_name'], # Bisa diisi detail asli jika perlu
            "score": final_score
        })
        
    return quiz_list

# --- DASHBOARD UTAMA ---
@app.get("/api/student/{user_id}")
def get_student_dashboard(user_id: int):
    student = user_df[user_df["userid"] == user_id]
    if student.empty:
        raise HTTPException(status_code=404, detail="Mahasiswa tidak ditemukan")
    
    student_data = student.iloc[0]
    grades_raw = score_df[score_df["userid"] == user_id]
    
    course_performance = []
    total_score_accumulated = 0
    course_count = 0

    if not grades_raw.empty:
        grouped = grades_raw.groupby(["courseshortname", "coursefullname"])['final_quiz_grade'].mean().reset_index()
        
        for _, row in grouped.iterrows():
            final_score = fix_grade_value(row['final_quiz_grade'])
            total_score_accumulated += final_score
            course_count += 1

            course_performance.append({
                "class_id": row["courseshortname"], 
                "subject": clean_course_name(row["coursefullname"]),
                "score": final_score
            })
    
    real_average_score = round(total_score_accumulated / course_count, 1) if course_count > 0 else 0

    return {
        "user_id": int(student_data["userid"]),
        "gpa": round(real_average_score / 25, 2),
        "average_score": real_average_score,
        "semester": 4, 
        "engagement_score": int(student_data["engagement_score"]),
        "performance_category": student_data["performance_category"],
        "courses": course_performance,
        "cluster_id": int(student_data["cluster"])
    }

# --- REKOMENDASI AI ---
class RecommendationRequest(BaseModel):
    user_id: int
    learning_style: str
    interest: str

@app.post("/api/recommendation")
def get_ai_recommendation(req: RecommendationRequest):
    student = user_df[user_df["userid"] == req.user_id]
    cluster_type = "At Risk / Passive"
    if not student.empty:
        cluster_id = student.iloc[0]["cluster"]
        cluster_type = cluster_labels.get(cluster_id, "Unknown")

    rec = {"status": cluster_type, "match_percentage": 0, "strategy": "", "materials": [], "tips": ""}

    if "High Performer" in cluster_type:
        rec.update({"match_percentage": 95, "strategy": "Pengayaan", "tips": "Fokus portofolio."})
        rec['materials'] = [f"Proyek: {req.interest}", "LeetCode Hard"]
    elif "Active" in cluster_type:
        rec.update({"match_percentage": 88, "strategy": "Konsistensi", "tips": "Pertahankan."})
        rec['materials'] = [f"Studi Kasus: {req.interest}", "Konsep Lanjut"]
    elif "Balanced" in cluster_type:
        rec.update({"match_percentage": 75, "strategy": "Intensitas", "tips": "Latihan soal."})
        rec['materials'] = [f"Kursus: {req.interest}", "Latihan Medium"]
    else:
        rec.update({"match_percentage": 60, "strategy": "Intervensi", "tips": "Kejar materi."})
        rec['materials'] = ["Video Ringkasan", "Manajemen Waktu"]

    style = req.learning_style.lower()
    suffix = "(Video)" if style == "visual" else "(Podcast)" if style == "auditory" else "(Praktik)"
    rec['materials'] = [f"{m} {suffix}" for m in rec['materials']]
    return rec

# --- ADMIN ---
@app.get("/api/admin/summary")
def get_admin_summary():
    return {
        "total_students": len(user_df),
        "avg_gpa": round(user_df["mean_score_pct"].mean() / 25, 2),
        "at_risk_count": len(user_df[user_df["performance_category"] == "Low"])
    }

@app.get("/api/admin/classes")
def get_class_list():
    student_avgs = score_df.groupby(['courseshortname', 'coursefullname', 'userid'])['final_quiz_grade'].mean().reset_index()
    class_stats = student_avgs.groupby(['courseshortname', 'coursefullname']).agg(
        student_count=('userid', 'count'),
        class_avg_score=('final_quiz_grade', 'mean')
    ).reset_index()
    
    classes_list = []
    for _, row in class_stats.iterrows():
        classes_list.append({
            "class_id": row['courseshortname'],
            "class_name": clean_course_name(row['coursefullname']),
            "student_count": int(row['student_count']),
            "avg_score": fix_grade_value(row['class_avg_score'])
        })
    return classes_list

@app.get("/api/admin/students_by_class")
def get_students_by_class(class_id: str):
    class_data = score_df[score_df['courseshortname'] == class_id]
    user_stats = class_data.groupby('userid').agg(
        avg_grade=('final_quiz_grade', 'mean'),
        activity_count=('quizid', 'count')
    ).reset_index()
    
    enrolled_ids = user_stats['userid'].unique()
    users_info = user_df[user_df['userid'].isin(enrolled_ids)][['userid', 'cluster', 'performance_category']]
    merged = pd.merge(users_info, user_stats, on='userid', how='inner')
    
    result = []
    for _, row in merged.iterrows():
        result.append({
            "id": int(row["userid"]),
            "cluster": cluster_labels.get(row["cluster"], "Unknown"),
            "status": "Berisiko" if row["performance_category"] == "Low" else "Aman",
            "score": fix_grade_value(row['avg_grade']),
            "activities": int(row['activity_count'])
        })
    return sorted(result, key=lambda x: x['score'], reverse=True)