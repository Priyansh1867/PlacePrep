import test from 'node:test';
import assert from 'node:assert/strict';
import { parseEvents } from '../services/aiChatService.js';

test('AI stream retains numeric and quoted string chunks', () => {
  const chunks = [];
  const remainder = parseEvents('data: 6\n\ndata: 75.0\n\ndata: "Seed Subject"\n\n',
    (chunk) => chunks.push(chunk), () => {});
  assert.equal(remainder, '');
  assert.deepEqual(chunks, ['6', '75.0', 'Seed Subject']);
});

test('AI stream still handles structured messages and split events', () => {
  const chunks = [];
  const errors = [];
  const remainder = parseEvents('data: {"content":"Hello"}\n\ndata: {"error":"Unavailable"}\n\ndata: 4',
    (chunk) => chunks.push(chunk), (error) => errors.push(error));
  assert.equal(remainder, 'data: 4');
  parseEvents(remainder + '\n\n', (chunk) => chunks.push(chunk), (error) => errors.push(error));
  assert.deepEqual(chunks, ['Hello', '4']);
  assert.deepEqual(errors, ['Unavailable']);
});
