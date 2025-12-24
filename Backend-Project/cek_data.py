import pandas as pd
import os

# 1. Load Data CSV
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "data", "merged_score_data_cleaned.csv")

print(f"Membaca file dari: {csv_path}")
df = pd.read_csv(csv_path)

# 2. Filter Khusus Kelas yang Mencurigakan
# ID Kelas: CAK1EAB3-IF-48-01PJJ (Matematika Diskrit [DTO])
target_class = "CAK1EAB3-IF-48-01PJJ"

print(f"\n--- Menganalisis Kelas: {target_class} ---")

# Ambil semua baris data milik kelas tersebut
class_data = df[df['courseshortname'] == target_class]

if class_data.empty:
    print("❌ ERROR: Tidak ada data sama sekali untuk kelas ini di CSV!")
else:
    # 3. Cek Statistik Nilai
    jumlah_data = len(class_data)
    jumlah_user_unik = class_data['userid'].nunique()
    
    # Cek kolom nilai (final_quiz_grade)
    nilai_rata2 = class_data['final_quiz_grade'].mean()
    nilai_max = class_data['final_quiz_grade'].max()
    nilai_min = class_data['final_quiz_grade'].min()
    jumlah_kosong = class_data['final_quiz_grade'].isnull().sum()
    jumlah_nol = (class_data['final_quiz_grade'] == 0).sum()

    print(f"Total Baris Data      : {jumlah_data}")
    print(f"Jumlah Mahasiswa Unik : {jumlah_user_unik}")
    print("-" * 30)
    print(f"Rata-rata Nilai (Mean): {nilai_rata2}")
    print(f"Nilai Tertinggi (Max) : {nilai_max}")
    print(f"Nilai Terendah (Min)  : {nilai_min}")
    print("-" * 30)
    print(f"Jumlah Data Nilai Kosong (NaN) : {jumlah_kosong}")
    print(f"Jumlah Data Bernilai 0         : {jumlah_nol}")
    
    print("\n--- 5 Sampel Data Pertama ---")
    print(class_data[['userid', 'quizname', 'final_quiz_grade']].head(5))

    # 4. Kesimpulan Otomatis
    if nilai_rata2 == 0 or pd.isna(nilai_rata2):
        print("\nKESIMPULAN: ✅ Data valid. Memang nilainya 0 atau Kosong semua di CSV.")
        print("Sistem tidak error. Kemungkinan dosen belum menilai atau kuis belum dikerjakan.")
    else:
        print(f"\nKESIMPULAN: ❌ ADA BUG DI BACKEND. Di CSV ada nilai ({nilai_rata2}), tapi di web muncul 0.")