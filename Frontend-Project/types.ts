// types.ts

export interface CourseData {
  class_id: string; 
  subject: string;
  score: number;
}

// Struktur ini mencerminkan output JSON dari endpoint: /api/student/{id}
export interface StudentData {
  user_id: number;     // Backend mengirim 'user_id', bukan 'userid'
  gpa: number;
  average_score: number;
  semester: number;
  engagement_score: number;
  performance_category: string; // 'High' | 'Medium' | 'Low'
  courses: CourseData[];        // Backend menyertakan courses di dalam object student
  cluster_id: number;           // Backend mengirim 'cluster_id'
  
  // Field tambahan untuk UI (Kita akan isi default di Frontend karena Backend tidak kirim ini)
  name?: string;
  major?: string;
  learning_style?: string; 
  interest?: string;
}

// Tipe data untuk response Admin
export interface AdminStudentSummary {
  id: number;
  gpa: number;
  status: string;
  cluster: string;
}

// Tambahkan di paling bawah types.ts
export interface QuizDetail {
  quiz_name: string;
  full_name: string;
  score: number;
}