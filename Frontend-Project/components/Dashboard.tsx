import React, { useState, useEffect } from 'react';
import { StudentData, QuizDetail } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { TrendingUp, Award, Clock, AlertCircle, ChevronDown } from 'lucide-react';

interface DashboardProps {
  user: StudentData;
  defaultClassId?: string; 
}

const Dashboard: React.FC<DashboardProps> = ({ user, defaultClassId }) => {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [quizData, setQuizData] = useState<QuizDetail[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // 1. Set Default Selection
  useEffect(() => {
    if (user.courses.length > 0) {
      // Prioritaskan kelas yang diklik dari Admin Panel
      if (defaultClassId) {
        setSelectedClassId(defaultClassId);
      } else {
        // Default ke matkul pertama
        setSelectedClassId(user.courses[0].class_id);
      }
    }
  }, [user, defaultClassId]);

  // 2. Fetch Data Kuis (Pake ID Kelas, Bukan Nama)
  // 2. Fetch Data Kuis saat Dropdown Berubah
  useEffect(() => {
    if (!selectedClassId) return;

    setLoadingQuiz(true);
    
    // PERBAIKAN: Gunakan encodeURIComponent untuk keamanan URL
    const url = `http://127.0.0.1:8000/api/student/quiz_detail?user_id=${user.user_id}&class_id=${encodeURIComponent(selectedClassId)}`;
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Gagal mengambil data kuis");
        return res.json();
      })
      .then(data => {
        setQuizData(data);
        setLoadingQuiz(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingQuiz(false);
      });
  }, [selectedClassId, user.user_id]);
  
  const comparisonData = user.courses.map(c => ({
    name: c.subject.length > 15 ? c.subject.substring(0, 15) + '...' : c.subject,
    nilai: c.score, // Nilai ini sekarang sudah di-fix backend (max 100)
    full: c.subject
  }));

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <span className="text-slate-500 text-sm font-medium">{label}</span>
      </div>
      <span className="text-2xl font-bold text-slate-800">{value}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Selamat datang kembali, {user.name} 👋</h1>
        <p className="text-slate-500 mt-1">
          Berikut adalah ringkasan performa akademik Anda (User ID: {user.user_id})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={TrendingUp} label="IPK (Estimasi)" value={user.gpa} color="bg-emerald-500" />
        <StatCard icon={Award} label="Rata-rata Global" value={`${user.average_score}%`} color="bg-blue-500" />
        <StatCard icon={Clock} label="Skor Engagement" value={user.engagement_score} color="bg-purple-500" />
        <StatCard icon={AlertCircle} label="Kategori Performa" value={user.performance_category} color={user.performance_category === 'Low' ? 'bg-red-500' : 'bg-amber-500'} />
      </div>

      {/* CHART KUIS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Riwayat Nilai Kuis & Tugas</h2>
            
            <div className="relative">
                <select 
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-300 text-slate-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-slate-500 min-w-[200px]"
                >
                    {user.courses.map((c, idx) => (
                        <option key={idx} value={c.class_id}>
                          {c.subject} {/* Teks Nama, Value ID */}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
        </div>

        <div className="h-80 w-full">
            {loadingQuiz ? (
                <div className="h-full flex items-center justify-center text-slate-400">Memuat data kuis...</div>
            ) : quizData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={quizData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="quiz_name" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => [`${value}`, 'Nilai']}
                            labelFormatter={(label) => `Item: ${label}`}
                        />
                        <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Nilai" barSize={30} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    Belum ada data kuis untuk mata kuliah ini.
                </div>
            )}
        </div>
      </div>

      {/* CHART PERBANDINGAN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Perbandingan Rata-rata Matkul</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="nilai" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} label={{ position: 'right', fill: '#64748b', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">Profil Belajar</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-500 mb-2">Gaya Belajar (Input User)</p>
              <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                {user.learning_style || "Belum diset"}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">Klaster ML (Segmentasi)</p>
              <span className={`px-3 py-1 rounded-md text-xs font-bold ${user.cluster_id === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                  Cluster ID: {user.cluster_id}
              </span>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-800 font-medium mb-1">Tips Pro</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  {user.performance_category === 'Low' 
                    ? "Segera tingkatkan frekuensi akses materi di LMS." 
                    : "Pertahankan performa ini untuk hasil maksimal."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;