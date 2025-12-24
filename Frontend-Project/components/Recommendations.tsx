import React, { useState } from 'react';
import { StudentData } from '../types';
import { BrainCircuit, RefreshCw, Book, Video, Users, CheckCircle, Zap } from 'lucide-react';

interface RecProps {
  user: StudentData;
}

// Tipe data untuk hasil balikan dari API Python
interface AIResponse {
  status: string;
  match_percentage: number;
  strategy: string;
  materials: string[];
  tips: string;
}

const Recommendations: React.FC<RecProps> = ({ user }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AIResponse | null>(null);

  const handleAnalysis = async () => {
    setAnalyzing(true);
    
    try {
      // PANGGIL API ML PYTHON (REAL TIME)
      const response = await fetch('http://127.0.0.1:8000/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          learning_style: user.learning_style || "Visual", // Default jika user belum set
          interest: user.interest || "Computer Science"
        })
      });

      const data = await response.json();
      setResult(data);

    } catch (error) {
      console.error("Gagal analisis AI:", error);
      alert("Gagal menghubungi AI Engine. Pastikan backend nyala!");
    } finally {
      setAnalyzing(false);
    }
  };

  // TAMPILAN AWAL (BELUM ANALISIS)
  if (!result && !analyzing) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BrainCircuit className="text-red-600" />
            Mesin Rekomendasi AI
          </h1>
          <button 
            onClick={handleAnalysis}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-red-200 transition-all transform hover:scale-105"
          >
            Analisis Profil Saya (AI)
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[60vh] flex flex-col items-center justify-center text-center p-8">
          <div className="bg-red-50 p-6 rounded-full mb-6">
            <BrainCircuit className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Siap Mengoptimalkan Pembelajaran?</h2>
          <p className="text-slate-500 max-w-md">
            AI akan menganalisis Engagement Score ({user.engagement_score}) dan Nilai Akademik Anda untuk memberikan strategi yang paling cocok.
          </p>
        </div>
      </div>
    );
  }

  // TAMPILAN LOADING
  if (analyzing) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600 mb-4"></div>
        <p className="text-slate-600 font-medium animate-pulse">Menghubungkan ke Neural Network...</p>
        <p className="text-slate-400 text-sm mt-2">Menganalisis profil Cluster {user.cluster_id}...</p>
      </div>
    );
  }

  // TAMPILAN HASIL (REAL DARI API)
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BrainCircuit className="text-red-600" />
          Hasil Analisis AI
        </h1>
        <button 
          onClick={handleAnalysis}
          className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Analisis Ulang
        </button>
      </div>

      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-red-900 to-red-700 rounded-xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <BrainCircuit className="w-64 h-64" />
        </div>
        <div className="relative z-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Diagnosa: {result?.status}
            </h2>
            <p className="leading-relaxed text-red-50 max-w-3xl text-lg">
                "{result?.tips}"
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Kartu Strategi */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-green-50 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">
                    {result?.match_percentage}% Match
                </span>
            </div>
            <h3 className="font-bold text-slate-800 mb-2">Strategi Utama</h3>
            <p className="text-slate-500 text-lg font-medium">{result?.strategy}</p>
        </div>

        {/* Kartu Materi Rekomendasi */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                    <Book className="w-6 h-6" />
                </div>
            </div>
            <h3 className="font-bold text-slate-800 mb-4">Materi Terkurasi</h3>
            <ul className="space-y-3">
              {result?.materials.map((item, idx) => (
                <li key={idx} className="flex items-start bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="mr-3 text-red-500 font-bold">▶</span>
                  <span className="text-slate-700 text-sm">{item}</span>
                </li>
              ))}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;