import pandas as pd
import os

# 1. SETUP & LOAD
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "data", "merged_score_data_cleaned.csv")

print(f"📂 Membaca file: {csv_path}")
df = pd.read_csv(csv_path)

# 2. CARI DATA YANG NILAINYA ANEH (> 100)
print("\n🔍 MENCARI DATA DENGAN NILAI > 100...")
suspects = df[df['final_quiz_grade'] > 100].copy()

if suspects.empty:
    print("✅ Tidak ditemukan nilai > 100. Aman.")
else:
    print(f"⚠️ Ditemukan {len(suspects)} data dengan nilai > 100.")
    
    # 3. ANALISIS MAX SCORE
    # Kita lihat: Nilai Dapatnya berapa? Maksimalnya berapa?
    print("\n📊 TABEL ANALISIS (Perbandingan Nilai vs Max Score):")
    
    # Kolom yang mau dilihat
    cols = ['userid', 'quizname', 'final_quiz_grade', 'max_quiz_score', 'courseshortname']
    
    # Tampilkan sampel
    sample = suspects[cols].head(10)
    print(sample.to_string(index=False))

    # 4. SIMULASI PERBAIKAN
    print("\n🛠️ SIMULASI PERBAIKAN RUMUS:")
    print("Rumus: (final_quiz_grade / max_quiz_score) * 100")
    print("-" * 60)
    
    for index, row in sample.iterrows():
        grade = row['final_quiz_grade']
        max_score = row['max_quiz_score']
        
        if pd.isna(max_score) or max_score == 0:
            hasil_baru = "❌ ERROR (Max Score 0/NaN)"
        else:
            # Hitung persentase
            persen = (grade / max_score) * 100
            
            # Logic Cap di 100 (Jika bonus point tidak dihitung)
            hasil_cap = min(100, persen)
            
            hasil_baru = f"{persen:.2f}% (Dibulatkan: {hasil_cap:.1f}%)"
            
        print(f"User {row['userid']} | Dapat: {grade} | Max: {max_score} -> Hasil Baru: {hasil_baru}")

print("\n" + "="*50)