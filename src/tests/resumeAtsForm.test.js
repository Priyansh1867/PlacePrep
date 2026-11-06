import test from 'node:test';
import assert from 'node:assert/strict';
import { createResumeAtsFormData } from '../services/resumeAtsForm.js';

test('general ATS submission omits company and retains the resume and job requirements', () => {
  const file = new Blob(['resume content'], { type: 'application/pdf' });
  const form = createResumeAtsFormData(file, {
    role: ' Backend Engineer ',
    jobDescription: ' Java and Spring Boot experience '
  });

  assert.equal(form.has('company'), false);
  assert.equal(form.get('role'), 'Backend Engineer');
  assert.equal(form.get('jobDescription'), 'Java and Spring Boot experience');
  assert.equal(form.get('file').size, file.size);
});

test('company-specific ATS submission includes the chosen company', () => {
  const form = createResumeAtsFormData(new Blob(['resume']), {
    company: ' TCS ',
    role: 'Developer',
    jobDescription: 'Java developer role'
  });

  assert.equal(form.get('company'), 'TCS');
});
