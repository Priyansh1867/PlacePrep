import test from 'node:test';
import assert from 'node:assert/strict';
import { OpportunityApi } from '../services/api.js';

test('hackathons are loaded from the backend opportunity endpoint', async () => {
  const originalFetch = globalThis.fetch;
  const originalStorage = globalThis.localStorage;
  const calls = [];
  globalThis.localStorage = { getItem: () => 'test-token' };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify([{ id: 1, title: 'Seed Hackathon 01' }]), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };
  try {
    const hackathons = await OpportunityApi.getHackathons();
    assert.equal(hackathons[0].title, 'Seed Hackathon 01');
    assert.match(calls[0].url, /\/api\/opportunities\/hackathons$/);
    assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token');
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.localStorage = originalStorage;
  }
});
