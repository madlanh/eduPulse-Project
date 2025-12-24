import React, { useState, useEffect } from 'react';
import { StudentData } from '../types';
import { Save, Trash2, Plus } from 'lucide-react';

interface ProfileProps {
  user: StudentData;
  // Menambahkan fungsi update dari parent
  onUpdateUser: (updates: Partial<StudentData>) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    name: user.name || "Mahasiswa",
    major: user.major || "Informatika",
    semester: user.semester,
    learning_style: user.learning_style || "Visual",
  });

  // Efek ini memastikan jika user berpindah halaman dan kembali, data tetap sinkron
  useEffect(() => {
    setFormData({
      name: user.name || "Mahasiswa",
      major: user.major || "Informatika",
      semester: user.semester,
      learning_style: user.learning_style || "Visual",
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // 1. Panggil fungsi update ke App.tsx agar data tersimpan di "Memori Utama"
    onUpdateUser({
      name: formData.name,
      learning_style: formData.learning_style as any, 
      major: formData.major
    });

    // 2. Beri notifikasi ke user
    alert(`Profil berhasil disimpan! Gaya belajar diset ke: ${formData.learning_style}`);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Edit Profil & Nilai</h1>
        <button 
          onClick={handleSave}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          <span>Simpan Perubahan</span>
        </button>
      </div>

      {/* Personal Details Form */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6 border-b pb-4">Detail Pribadi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
            <input 
              type="text" name="name"
              value={formData.name} onChange={handleInputChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Gaya Belajar (Input Penting)</label>
            <select 
              name="learning_style"
              value={formData.learning_style}
              onChange={handleInputChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 outline-none bg-white"
            >
              <option value="Visual">Visual (Suka Gambar/Video)</option>
              <option value="Auditory">Auditory (Suka Mendengar)</option>
              <option value="Kinesthetic">Kinesthetic (Suka Praktik)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">Ubah ini untuk melihat hasil rekomendasi AI yang berbeda.</p>
          </div>
        </div>
      </div>

      {/* Courses Table (REAL DATA) */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-800 mb-6">Nilai Mata Kuliah (Dari LMS)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 pl-4">Nama Mata Kuliah</th>
                <th className="pb-3">Nilai Akhir</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {user.courses.map((course, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-4 pl-4 text-sm text-slate-900 font-medium">{course.subject}</td>
                  <td className="py-4 text-sm text-slate-700 font-bold">{course.score} / 100</td>
                  <td className="py-4">
                     {course.score < 50 ? (
                       <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">Perlu Perbaikan</span>
                     ) : (
                       <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-bold">Lulus</span>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;