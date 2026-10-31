// PlacePrep AI - Profile Completion Calculation Engine
// Provides consistent, shared profile validation and completion calculation
// for both frontend views and backend/test suites.

export const REQUIRED_PROFILE_FIELDS = [
  { key: 'fullName', label: 'Full Name', section: 'basic-details', fallbackKey: 'name' },
  { key: 'email', label: 'Email Address', section: 'basic-details' },
  { key: 'rollNumber', label: 'Roll Number', section: 'basic-details' },
  { key: 'graduationBatch', label: 'Graduation Batch', section: 'basic-details' },
  { key: 'phone', label: 'Primary Mobile Number', section: 'basic-details', fallbackKey: 'mobileNumber' },
  { key: 'dateOfBirth', label: 'Date of Birth', section: 'basic-details' },
  { key: 'gender', label: 'Gender', section: 'basic-details' },
  { key: 'college', label: 'College / University', section: 'basic-details', fallbackKey: 'collegeName' },
  { key: 'branch', label: 'Branch / Department', section: 'basic-details' },
  { key: 'currentAddress', label: 'Current Address', section: 'basic-details', fallbackKey: 'address' },
  { key: 'tenthPercentage', label: 'Class 10 Percentage', section: 'education-details', fallbackKey: 'class10Percentage' },
  { key: 'twelfthPercentage', label: 'Class 12 / Diploma Percentage', section: 'education-details', fallbackKey: 'class12Percentage' }
];

export const OPTIONAL_PROFILE_FIELDS = [
  { key: 'bloodGroup', label: 'Blood Group', section: 'basic-details' },
  { key: 'category', label: 'Category / Quota', section: 'basic-details', fallbackKey: 'quota' },
  { key: 'differentlyAbled', label: 'Differently Abled (PwD)', section: 'basic-details' },
  { key: 'nationality', label: 'Nationality', section: 'basic-details' },
  { key: 'altPhone', label: 'Alternate Contact Number', section: 'basic-details', fallbackKey: 'alternateContact' },
  { key: 'permanentAddress', label: 'Permanent Address', section: 'basic-details' },
  { key: 'hometown', label: 'Hometown & State', section: 'basic-details' },
  { key: 'pincode', label: 'Pincode', section: 'basic-details' },
  { key: 'cgpa', label: 'Cumulative CGPA', section: 'education-details' },
  { key: 'linkedin', label: 'LinkedIn Profile', section: 'basic-details' },
  { key: 'github', label: 'GitHub Profile', section: 'basic-details' },
  { key: 'portfolio', label: 'Portfolio Website', section: 'basic-details' }
];

/**
 * Checks if a field has a valid, genuine, non-empty value.
 * Missing, undefined, null, empty string, or "Not provided" are considered NOT filled.
 */
export function isFieldFilled(user, fieldDef) {
  if (!user) return false;

  // 1. Check direct / top-level property
  let val = user[fieldDef.key];
  if ((val === undefined || val === null || val === '') && fieldDef.fallbackKey) {
    val = user[fieldDef.fallbackKey];
  }

  // 2. Check nested basicDetails if present
  if ((val === undefined || val === null || val === '') && user.basicDetails) {
    val = user.basicDetails[fieldDef.key];
    if ((val === undefined || val === null || val === '') && fieldDef.fallbackKey) {
      val = user.basicDetails[fieldDef.fallbackKey];
    }
  }

  // 3. Check nested educationDetails if present
  if ((val === undefined || val === null || val === '') && user.educationDetails) {
    val = user.educationDetails[fieldDef.key];
    if ((val === undefined || val === null || val === '') && fieldDef.fallbackKey) {
      val = user.educationDetails[fieldDef.fallbackKey];
    }
  }

  if (val === undefined || val === null) return false;
  const str = String(val).trim();
  if (!str) return false;
  const lower = str.toLowerCase();
  if (lower === 'not provided' || lower === 'not specified' || lower === 'n/a') {
    return false;
  }
  return true;
}

/**
 * Calculate genuine profile completion based on persisted user data.
 * @param {Object} user 
 * @returns {Object} Completion analysis result
 */
export function calculateProfileCompletion(user) {
  if (!user) {
    return {
      percentage: 0,
      isComplete: false,
      completedRequiredCount: 0,
      totalRequiredCount: REQUIRED_PROFILE_FIELDS.length,
      missingRequiredFields: REQUIRED_PROFILE_FIELDS,
      firstMissingSection: 'basic-details',
      firstMissingField: REQUIRED_PROFILE_FIELDS[0]
    };
  }

  const missing = [];
  let completedCount = 0;

  for (const field of REQUIRED_PROFILE_FIELDS) {
    if (isFieldFilled(user, field)) {
      completedCount++;
    } else {
      missing.push(field);
    }
  }

  const total = REQUIRED_PROFILE_FIELDS.length;
  const percentage = Math.round((completedCount / total) * 100);
  const isComplete = missing.length === 0;

  return {
    percentage,
    isComplete,
    completedRequiredCount: completedCount,
    totalRequiredCount: total,
    missingRequiredFields: missing,
    firstMissingSection: missing.length > 0 ? missing[0].section : 'basic-details',
    firstMissingField: missing.length > 0 ? missing[0] : null
  };
}
