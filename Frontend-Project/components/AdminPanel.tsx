import React, { useState, useEffect } from 'react';
import { Search, Eye, AlertTriangle, Users, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Dashboard from './Dashboard';
import { StudentData } from '../types';

// Tipe Data
interface AdminSummary {
  total_students: number;
  avg_gpa: number;
  at_risk_count: number;
}

interface ClassItem {
  class_id: string;
  class_name: string;
  student_count: number;
  avg_score: number;
}

interface StudentSummary {
  id: number;
  gpa: number;
  status: string;
  cluster: string;
  score: number;
  activities: number; // Tambahkan ini
}

const AdminPanel: React.FC = () => {
  // --- STATE ---
  const [viewMode, setViewMode] = useState<'classes' | 'students' | 'detail'>('classes');
  
  // Data Overview
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  
  // Data Detail Kelas (List Mahasiswa)
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Data Detail Mahasiswa (Dashboard View)
  const [fullStudentDetail, setFullStudentDetail] = useState<StudentData | null>(null);

  // Pagination State (DYNAMIC)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default 10

  const [loading, setLoading] = useState(true);

  // --- FETCH DATA AWAL ---
  useEffect(() => {
    // 1. Ambil Summary Global
    fetch('http://127.0.0.1:8000/api/admin/summary')
      .then(res => res.json())
      .then(data => setSummary(data));

    // 2. Ambil Daftar Kelas
    fetch('http://127.0.0.1:8000/api/admin/classes')
      .then(res => res.json())
      .then(data => {
        setClasses(data);
        setLoading(false);
      });
  }, []);

  // --- HANDLER: KLIK KELAS ---
  const handleClassClick = (cls: ClassItem) => {
    setLoading(true);
    setSelectedClass(cls);
    setViewMode('students');
    setSearchTerm("");
    setCurrentPage(1); // Reset ke halaman 1

    // Fetch mahasiswa di kelas ini
    fetch(`http://127.0.0.1:8000/api/admin/students_by_class?class_id=${cls.class_id}`)
      .then(res => res.json())
      .then(data => {
        setStudents(data);
        setLoading(false);
      });
  };

  // --- HANDLER: KLIK MAHASISWA (DETAIL) ---
  const handleViewStudentDetail = (id: number) => {
    setFullStudentDetail(null);
    setViewMode('detail');
    
    fetch(`http://127.0.0.1:8000/api/student/${id}`)
      .then(res => res.json())
      .then(data => {
        const fullData: StudentData = {
          ...data,
          name: `Mahasiswa ${id}`,
          major: "PJJ Informatika",
          learning_style: "Visual"
        };
        setFullStudentDetail(fullData);
      });
  };

  // --- HANDLER: GANTI JUMLAH PER HALAMAN ---
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset ke halaman 1 setiap ganti limit
  };

  // --- LOGIC PAGINATION & FILTER ---
  const filteredStudents = students.filter(s => 
    s.id.toString().includes(searchTerm) || 
    s.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.cluster.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  
  // Slice data sesuai halaman
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ==========================================
  // RENDER: VIEW DETAIL MAHASISWA
  // ==========================================
  if (viewMode === 'detail' && fullStudentDetail) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setViewMode('students')}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Mahasiswa
        </button>
        <div className="border-t border-slate-200 pt-6">
           <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg mb-6 text-sm flex items-center gap-2">
             <Eye className="w-4 h-4" />
             Mode Admin: Memantau performa <strong>{fullStudentDetail.name}</strong>
           </div>
           <Dashboard user={fullStudentDetail} 
                      defaultClassId={selectedClass?.class_id} // Kirim ID Kelas yang diklik admin

           />
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: VIEW DAFTAR KELAS (UTAMA)
  // ==========================================
  if (viewMode === 'classes') {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Akademik</h1>
        
        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <p className="text-slate-500 text-sm font-medium mb-1">Total Mahasiswa (Aktif)</p>
             <p className="text-3xl font-bold text-slate-800">{summary?.total_students || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
             <p className="text-slate-500 text-sm font-medium mb-1">Rata-rata IPK Global</p>
             <p className="text-3xl font-bold text-emerald-600">{summary?.avg_gpa || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
             <div>
               <p className="text-slate-500 text-sm font-medium mb-1">Mahasiswa Berisiko</p>
               <p className="text-3xl font-bold text-red-600">{summary?.at_risk_count || 0}</p>
             </div>
             <div className="bg-red-50 p-3 rounded-full">
               <AlertTriangle className="text-red-500 w-6 h-6" />
             </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800">Daftar Kelas / Mata Kuliah</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? <p>Memuat data kelas...</p> : classes.map((cls, idx) => (
            <div 
              key={idx} 
              onClick={() => handleClassClick(cls)}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                  {cls.class_id}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">{cls.class_name}</h3>
              <div className="flex justify-between items-center text-sm text-slate-500 border-t border-slate-50 pt-4 mt-2">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" /> {cls.student_count} Mahasiswa
                </span>
                <span className="font-medium text-emerald-600">
                  Avg Nilai: {cls.avg_score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: VIEW TABEL MAHASISWA
  // ==========================================
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setViewMode('classes')}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar Kelas
        </button>
        <div className="text-right">
           <h2 className="font-bold text-slate-900">{selectedClass?.class_name}</h2>
           <p className="text-xs text-slate-500">{selectedClass?.class_id}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header Tabel & Search */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-slate-800">Daftar Mahasiswa</h2>
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{filteredStudents.length} Total</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari ID, Cluster..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full md:w-64"
            />
          </div>
        </div>
        {/* Tabel Data Mahasiswa */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4 w-16">No</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Cluster ML</th>
                
                {/* HEADLINE DIPERJELAS */}
                <th className="px-6 py-4">
                  <div className="flex flex-col">
                    <span>Rerata Nilai Matkul Ini</span> {/* Ganti Jadi Ini */}
                    <span className="text-[10px] text-slate-400 normal-case">(Dari Aktivitas Kelas)</span>
                  </div>
                </th>
                
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={6} className="text-center py-8">Memuat Data...</td></tr>
              ) : paginatedStudents.length === 0 ? (
                 <tr><td colSpan={6} className="text-center py-8 text-slate-400">Data tidak ditemukan.</td></tr>
              ) : (
                paginatedStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    
                    <td className="px-6 py-4 font-medium text-slate-900">Mhs-{student.id}</td>
                    
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded text-xs font-bold ${
                         student.cluster.includes('At Risk') ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                       }`}>
                         {student.cluster}
                       </span>
                    </td>
                    
                    {/* KOLOM NILAI YANG LEBIH JELAS */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{student.score}</span>
                        {/* Menampilkan jumlah aktivitas (kuis) */}
                        <span className="text-xs text-slate-500">
                          {/* Note: Kita perlu update interface StudentSummary di AdminPanel.tsx dulu */}
                          {/* Jika error 'activities' not exist, tambahkan di interface StudentSummary */}
                          {(student as any).activities} Kuis/Tugas
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'Aman' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewStudentDetail(student.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium inline-flex items-center gap-1"
                      >
                        Detail <Eye className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer Paginasi & Dropdown */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
           {/* Dropdown Jumlah Data */}
           <div className="flex items-center gap-2">
             <span className="text-xs text-slate-500">Tampilkan:</span>
             <select 
               value={itemsPerPage}
               onChange={handleItemsPerPageChange}
               className="border border-slate-300 rounded text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
             >
               <option value={10}>10</option>
               <option value={25}>25</option>
               <option value={40}>40</option>
               <option value={50}>50</option>
             </select>
           </div>

           {/* Navigasi Halaman */}
           <div className="flex items-center gap-4">
             <span className="text-xs text-slate-500">
               Halaman {currentPage} dari {totalPages || 1}
             </span>
             <div className="flex gap-2">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                 disabled={currentPage === 1}
                 className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
               >
                 <ChevronLeft className="w-4 h-4" />
               </button>
               <button 
                 onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                 disabled={currentPage === totalPages || totalPages === 0}
                 className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50"
               >
                 <ChevronRight className="w-4 h-4" />
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;