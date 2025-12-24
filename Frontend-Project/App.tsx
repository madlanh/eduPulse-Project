import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, User, BrainCircuit, LogOut, BookOpen, Users } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Recommendations from './components/Recommendations';
import AdminPanel from './components/AdminPanel';
import { StudentData } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<StudentData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // FUNGSI 1: Login sebagai Mahasiswa dengan ID Dinamis
  const handleLoginAsStudent = async (inputUserId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch ke Backend
      const response = await fetch(`http://127.0.0.1:8000/api/student/${inputUserId}`);
      
      if (!response.ok) {
        throw new Error("User ID tidak ditemukan di sistem (Backend 404).");
      }

      const data = await response.json();

      // Tambahkan data simulasi (Nama/Major/Style) karena tidak ada di CSV
      const fullUserData: StudentData = {
        ...data,
        name: `Mahasiswa ${inputUserId}`, 
        major: "PJJ Informatika",
        learning_style: "Visual", // Default, nanti bisa diubah di Profil
        interest: "Web Development"
      };

      setCurrentUser(fullUserData);
      setIsAdmin(false);
    } catch (err: any) {
      console.error(err);
      setError("Gagal Login: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI 2: Update Data User (Agar Profil & Rekomendasi sinkron)
  const handleUpdateUser = (updatedFields: Partial<StudentData>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updatedFields });
    }
  };

  const handleLoginAsAdmin = () => {
    setCurrentUser(null);
    setIsAdmin(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
  };

  if (!currentUser && !isAdmin) {
    return (
      <LoginScreen 
        onStudentLogin={handleLoginAsStudent} 
        onAdminLogin={handleLoginAsAdmin}
        loading={isLoading}
        error={error}
      />
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen bg-slate-50">
        <Sidebar isAdmin={isAdmin} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-8">
           <Routes>
             {isAdmin ? (
               <>
                 <Route path="/" element={<AdminPanel />} />
                 <Route path="*" element={<Navigate to="/" />} />
               </>
             ) : (
               <>
                 <Route path="/" element={<Dashboard user={currentUser!} />} />
                 
                 {/* PASSING FUNGSI UPDATE KE PROFILE */}
                 <Route 
                   path="/profile" 
                   element={
                     <Profile 
                       user={currentUser!} 
                       onUpdateUser={handleUpdateUser} 
                     />
                   } 
                 />
                 
                 <Route path="/recommendations" element={<Recommendations user={currentUser!} />} />
                 <Route path="*" element={<Navigate to="/" />} />
               </>
             )}
           </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

// --- LOGIN SCREEN BARU (DENGAN INPUT ID) ---
const LoginScreen = ({ onStudentLogin, onAdminLogin, loading, error }: any) => {
  const [userIdInput, setUserIdInput] = useState("8994295"); // Default ID Demo

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-600 p-3 rounded-lg">
            <BookOpen className="text-white w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">EduPulse</h1>
        <p className="text-slate-500 mb-6">Learning Recommendation System</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded mb-4 border border-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="text-left">
            <label className="text-xs font-bold text-slate-500 uppercase">User ID Mahasiswa</label>
            <input 
              type="text" 
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 mt-1 mb-3 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Contoh: 8994295"
            />
            
            <button 
              onClick={() => onStudentLogin(userIdInput)}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex justify-center items-center"
            >
              {loading ? "Menghubungkan..." : "Login"}
            </button>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-xs">ATAU</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button 
            onClick={onAdminLogin}
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Masuk sebagai Admin
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ isAdmin, onLogout }: { isAdmin: boolean, onLogout: () => void }) => {
  const location = useLocation();
  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${isActive ? 'bg-red-50 text-red-600 font-medium border-l-4 border-red-600' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
        <Icon className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
        <span>{label}</span>
      </Link>
    );
  };
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6 flex items-center space-x-3">
        <div className="bg-red-600 p-2 rounded-lg"><BookOpen className="text-white w-6 h-6" /></div>
        <span className="text-xl font-bold text-slate-800">EduPulse</span>
      </div>
      <nav className="flex-1 px-4 py-4">
        {isAdmin ? <NavItem to="/" icon={Users} label="Manajemen Mahasiswa" /> : 
        <><NavItem to="/" icon={LayoutDashboard} label="Dasbor" /><NavItem to="/profile" icon={User} label="Profil & Nilai" /><NavItem to="/recommendations" icon={BrainCircuit} label="Rekomendasi AI" /></>}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button onClick={onLogout} className="flex items-center space-x-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"><LogOut className="w-5 h-5" /><span>Keluar</span></button>
      </div>
    </div>
  );
};

export default App;