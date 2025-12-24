import pandas as pd
import os

# 1. SETUP
base_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(base_dir, "data", "merged_score_data_cleaned.csv")
df = pd.read_csv(csv_path)

# 2. INPUT
TARGET_USER_ID = 104554 # Ganti dengan ID User yang chartnya kosong
print(f"🔍 Menganalisis User: {TARGET_USER_ID}")

# 3. CEK KELAS DAN DATA KUIS
user_data = df[df['userid'] == TARGET_USER_ID]

if user_data.empty:
    print("❌ User tidak ditemukan di data nilai!")
else:
    print(f"✅ Ditemukan {len(user_data)} baris data nilai.")
    
    # List Matkul Unik
    matkuls = user_data[['courseshortname', 'coursefullname']].drop_duplicates()
    
    print("\n📋 DAFTAR MATA KULIAH USER INI:")
    for idx, row in matkuls.iterrows():
        cid = row['courseshortname']
        cname = row['coursefullname']
        
        # Cek jumlah kuis untuk matkul ini
        kuis_matkul = user_data[user_data['courseshortname'] == cid]
        jumlah_kuis = len(kuis_matkul)
        
        print(f"\n   [KELAS] {cname}")
        print(f"   ID: '{cid}'") # Perhatikan tanda petik, cek ada spasi ga
        print(f"   Jumlah Data Kuis: {jumlah_kuis}")
        
        if jumlah_kuis > 0:
            print("   Sampel Data Kuis:")
            print(kuis_matkul[['quizname', 'final_quiz_grade']].head(3).to_string(index=False))
        else:
            print("   ⚠️ TIDAK ADA DATA KUIS UNTUK KELAS INI.")

print("\n" + "="*50)