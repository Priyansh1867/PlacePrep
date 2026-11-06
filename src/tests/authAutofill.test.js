import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_AUTOFILL_ACCOUNTS, autofillLoginFields, demoAutofillForRole } from '../data/demoAutofillAccounts.js';

test('autofill keeps the eight main role choices and their demo passwords', () => {
  assert.equal(DEMO_AUTOFILL_ACCOUNTS.length, 8);
  assert.ok(DEMO_AUTOFILL_ACCOUNTS.every((account) => account.password === 'password123'));
  assert.equal(demoAutofillForRole('tpo')?.portal, 'placement');
  assert.equal(demoAutofillForRole('unknown'), null);
});

test('autofill fills the selected account and replaces the previous password', () => {
  const filled = autofillLoginFields(
    { email: 'previous@example.edu', password: 'old', confirmPassword: 'old', branch: 'CSE' },
    demoAutofillForRole('teacher')
  );
  assert.equal(filled.email, 'teacher@placeprep.com');
  assert.equal(filled.password, 'password123');
  assert.equal(filled.confirmPassword, 'password123');
  assert.equal(filled.branch, 'CSE');
});
