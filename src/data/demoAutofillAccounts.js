// Public sample identities for the login form. Passwords are never bundled in the frontend.
export const DEMO_AUTOFILL_ACCOUNTS = [
  { role: 'student', portal: 'institute', label: 'Student', email: 'priyansh.jain@example.edu', name: 'Priyansh Jain', badge: 'Student' },
  { role: 'tpo', portal: 'placement', label: 'TPO Officer', email: 'tpo@placeprep.edu', name: 'Prof. Rajesh Raman', badge: 'TPO Cell' },
  { role: 'management', portal: 'management', label: 'Management', email: 'management@placeprep.com', name: 'Dr. Ramesh Gupta', badge: 'Operations' },
  { role: 'hr', portal: 'placement', label: 'Recruiter', email: 'recruiter@placeprep.com', name: 'Sarah Jenkins', badge: 'Google' },
  { role: 'teacher', portal: 'institute', label: 'Faculty', email: 'teacher@placeprep.com', name: 'Dr. Neha Sharma', badge: 'CSE Faculty' },
  { role: 'hod', portal: 'institute', label: 'HOD', email: 'hod@placeprep.com', name: 'Prof. Alok Verma', badge: 'HOD CSE' },
  { role: 'coordinator', portal: 'placement', label: 'Coordinator', email: 'coordinator@placeprep.com', name: 'Prof. Ananya Gupta', badge: 'Logistics' },
  { role: 'director', portal: 'placement', label: 'Director', email: 'director@placeprep.com', name: 'Dr. Vikramaditya Sen', badge: 'Executive' },
];

export const demoAutofillForRole = (role) => DEMO_AUTOFILL_ACCOUNTS.find((account) => account.role === role) || null;

export const autofillLoginFields = (current, account) => ({
  ...current,
  name: account.name,
  fullName: account.name,
  email: account.email,
  designation: account.badge,
  password: '',
  confirmPassword: '',
});
