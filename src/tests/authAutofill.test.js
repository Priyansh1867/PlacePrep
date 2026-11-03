import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_AUTOFILL_ACCOUNTS, autofillLoginFields, demoAutofillForRole } from '../data/demoAutofillAccounts.js';

test('autofill keeps main role choices without bundling passwords', () => {
  assert.equal(DEMO_AUTOFILL_ACCOUNTS.length, 8);
  assert.ok(DEMO_AUTOFILL_ACCOUNTS.every((account) => !Object.hasOwn(account, 'password')));
  assert.equal(demoAutofillForRole('tpo')?.portal, 'placement');
  assert.equal(demoAutofillForRole('unknown'), null);
});

test('autofill fills the account and clears any previous password', () => {
  const filled = autofillLoginFields(
    { email: 'previous@example.edu', password: 'old', confirmPassword: 'old', branch: 'CSE' },
    demoAutofillForRole('teacher')
  );
  assert.equal(filled.email, 'teacher@placeprep.com');
  assert.equal(filled.password, '');
  assert.equal(filled.confirmPassword, '');
  assert.equal(filled.branch, 'CSE');
});
