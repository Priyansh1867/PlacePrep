export function createResumeAtsFormData(file, { company = '', role, jobDescription }) {
  const formData = new FormData();
  formData.append('file', file);
  if (company.trim()) formData.append('company', company.trim());
  formData.append('role', role.trim());
  formData.append('jobDescription', jobDescription.trim());
  return formData;
}
