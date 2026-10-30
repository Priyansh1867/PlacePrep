/**
 * Role-aware default navigation destinations
 * Maps user roles to their respective home portal/dashboard route.
 */
export const getRoleDefaultDashboard = (user) => {
  if (!user || !user.role) return 'dashboard';
  const role = String(user.role).toLowerCase();

  switch (role) {
    case 'student':
      return 'dashboard';
    case 'teacher':
    case 'faculty':
    case 'hod':
      return 'institute-portal';
    case 'management':
      return 'management-portal';
    case 'tpo':
    case 'placement':
    case 'recruiter':
      return 'placement-portal';
    case 'admin':
      return 'admin';
    default:
      return 'dashboard';
  }
};

/**
 * Returns human-readable label for the role's default dashboard.
 */
export const getRoleDefaultDashboardLabel = (user) => {
  if (!user || !user.role) return 'Dashboard';
  const role = String(user.role).toLowerCase();

  switch (role) {
    case 'student':
      return 'Dashboard';
    case 'teacher':
    case 'faculty':
      return 'Faculty Portal';
    case 'hod':
      return 'HOD Portal';
    case 'management':
      return 'Management Portal';
    case 'tpo':
    case 'placement':
    case 'recruiter':
      return 'Placement Portal';
    case 'admin':
      return 'Admin Portal';
    default:
      return 'Dashboard';
  }
};
