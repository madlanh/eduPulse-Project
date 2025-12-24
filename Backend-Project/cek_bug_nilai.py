import pandas as pd
import os

# 1. SETUP
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "data", "merged_score_data_cleaned.csv")

print(f"📂 Membaca file database: {csv_path}")
try:
    df = pd.read_csv(csv_path)
except FileNotFoundError:
    print("❌ File CSV tidak ditemukan! Pastikan nama file benar.")
    exit()

# 2. INPUT USER ID YANG MENCURIGAKAN
# Ganti ID ini dengan ID User yang nilainya > 100 di tabel admin kamu tadi
TARGET_USER_ID = 104405  # Contoh dari laporanmu yang nilainya 108

print(f"\n🔍 INVESTIGASI DATA USER ID: {TARGET_USER_ID}")
print("=" * 50)

# Filter data user tersebut
user_data = df[df['userid'] == TARGET_USER_ID]

if user_data.empty:
    print("❌ User ID tidak ditemukan di CSV!")
    exit()

# 3. CEK MATA KULIAH YANG DIAMBIL (Untuk Solusi Grafik Kosong)
print("\n[1] MATA KULIAH YANG DIAMBIL (CEK KODE KELASNYA):")
classes = user_data[['courseshortname', 'coursefullname']].drop_duplicates()
for idx, row in classes.iterrows():
    print(f"   👉 Nama: {row['coursefullname']}")
    print(f"      Kode ID (Class ID): {row['courseshortname']}")
    print("-" * 30)

print("\n   ⚠️ PENTING: Bandingkan 'Kode ID' di atas dengan yang ada di kodingan Frontend/Backend.")
print("   Jika beda (misal di sini 02PJJ tapi di kode 01PJJ), itulah sebab grafik detail kosong.")

# 4. CEK NILAI > 100 (Untuk Solusi Rata-rata Aneh)
print("\n[2] DETEKSI NILAI DI ATAS 100:")
over_100 = user_data[user_data['final_quiz_grade'] > 100]

if not over_100.empty:
    print(f"   ⚠️ DITEMUKAN {len(over_100)} DATA NILAI DI ATAS 100!")
    print(over_100[['quizname', 'final_quiz_grade', 'courseshortname']])
else:
    print("   ✅ Tidak ada nilai tunggal yang di atas 100.")

# 5. SIMULASI PERHITUNGAN RATA-RATA
print("\n[3] SIMULASI PERHITUNGAN RATA-RATA (LOGIKA BACKEND):")
# Grouping per matkul
grade_summary = user_data.groupby('courseshortname')['final_quiz_grade'].agg(['mean', 'max', 'sum'])
print(grade_summary)

print("\n" + "=" * 50)