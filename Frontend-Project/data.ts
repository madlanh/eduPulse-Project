import { StudentData, CourseGrade } from './types';

// Simulating the CSV data you provided + some metadata
// Clusters: 0=High Engagement/Perf, 1=Mass/Average, 2=Low Perf, 3=Struggling
export const MOCK_STUDENTS: StudentData[] = [
  {
    userid: 10824,
    mean_score_pct: 12.5,
    num_attempts: 2,
    engagement_score: 9.0,
    consistency_score: 0.29,
    performance_category: 'Low',
    cluster: 2,
    name: "Budi Santoso",
    major: "Informatika (PJJ)",
    semester: 3,
    gpa: 1.5,
    learning_style: "Visual"
  },
  {
    userid: 14275,
    mean_score_pct: 78.4,
    num_attempts: 12,
    engagement_score: 164.0,
    consistency_score: 0.38,
    performance_category: 'Medium',
    cluster: 0,
    name: "Siti Aminah",
    major: "Informatika (PJJ)",
    semester: 5,
    gpa: 3.45,
    learning_style: "Auditory"
  },
  {
    userid: 13460,
    mean_score_pct: 88.2,
    num_attempts: 15,
    engagement_score: 83.0,
    consistency_score: 0.06,
    performance_category: 'High',
    cluster: 0,
    name: "Andi Pratama",
    major: "Informatika (PJJ)",
    semester: 7,
    gpa: 3.82,
    learning_style: "Reading/Writing"
  },
  {
    userid: 14828,
    mean_score_pct: 45.0,
    num_attempts: 5,
    engagement_score: 113.0,
    consistency_score: 0.11,
    performance_category: 'Low',
    cluster: 1,
    name: "Rina Kartika",
    major: "Informatika (PJJ)",
    semester: 2,
    gpa: 2.1,
    learning_style: "Kinesthetic"
  }
];

// Based on your score_df raw data
export const MOCK_COURSES: Record<number, CourseGrade[]> = {
  10824: [
    { code: "IF-48-03PJJ", name: "Logika Matematika", score: 10, sks: 3 },
    { code: "IF-48-01PJJ", name: "Matematika Diskrit", score: 15, sks: 3 },
  ],
  14275: [
    { code: "IF-48-03PJJ", name: "Logika Matematika", score: 85, sks: 3 },
    { code: "IF-48-01PJJ", name: "Matematika Diskrit", score: 72, sks: 3 },
  ],
  13460: [
    { code: "IF-48-03PJJ", name: "Logika Matematika", score: 92, sks: 3 },
    { code: "IF-48-01PJJ", name: "Matematika Diskrit", score: 84, sks: 3 },
  ],
  14828: [
    { code: "IF-48-03PJJ", name: "Logika Matematika", score: 40, sks: 3 },
    { code: "IF-48-01PJJ", name: "Matematika Diskrit", score: 50, sks: 3 },
  ]
};

// Machine Learning Logic Simulation based on Clusters
export const getRecommendations = (student: StudentData) => {
  const baseRecs = [];

  // Logic mapping clusters/performance to content
  if (student.performance_category === 'High') {
    baseRecs.push({
      type: 'Course',
      title: 'Advanced Algorithm Design',
      desc: 'Based on your strong performance in Logic, you are ready for advanced algorithms.',
      match: 95,
      link: '#'
    });
    baseRecs.push({
      type: 'Activity',
      title: 'Peer Tutor Program',
      desc: 'Your consistency score is high. Consider mentoring students in Cluster 2.',
      match: 88,
      link: '#'
    });
  } else if (student.performance_category === 'Medium') {
    baseRecs.push({
      type: 'Strategy',
      title: 'Spaced Repetition Techniques',
      desc: 'To push your score to the High category, try reviewing material at increasing intervals.',
      match: 90,
      link: '#'
    });
    baseRecs.push({
      type: 'Course',
      title: 'Interactive Graph Theory',
      desc: 'Supplementary material for Discrete Math to solidify concepts.',
      match: 85,
      link: '#'
    });
  } else {
    // Low
    baseRecs.push({
      type: 'Strategy',
      title: 'Time Management Workshop',
      desc: 'Your consistency score suggests irregular study patterns. Try the Pomodoro technique.',
      match: 98,
      link: '#'
    });
    baseRecs.push({
      type: 'Group',
      title: 'Study Group: Logic Fundamentals',
      desc: 'Join a group with students from Cluster 0 for guided learning.',
      match: 92,
      link: '#'
    });
  }

  // Add specific recommendation based on Engagement
  if (student.engagement_score < 50) {
     baseRecs.push({
      type: 'Alert',
      title: 'LMS Activity Reminder',
      desc: 'Your engagement is lower than the class average. Check the forum discussions.',
      match: 99,
      link: '#'
    });
  }

  return baseRecs;
};
