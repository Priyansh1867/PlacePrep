import { getAuthToken } from './api.js';


export function parseEvents(buffer, onText, onError) {
  const events = buffer.split(/\r?\n\r?\n/);
  const remainder = events.pop() || '';

  events.forEach((event) => {
    const data = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).replace(/^ /, ''))
      .join('\n');

    if (!data || data === '[DONE]') return;

    try {
      const payload = JSON.parse(data);

      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        if (payload.error) onError(payload.error);
        else if (typeof payload.content === 'string') onText(payload.content);
        else if (typeof payload.message === 'string') onText(payload.message);
        else onText(data);
      } else {
        onText(typeof payload === 'string' ? payload : data);
      }
    } catch {
      onText(data);
    }
  });

  return remainder;
}


export async function streamAiChat(message, { signal, onText = () => {}, onError = () => {} } = {}) {
  const token = getAuthToken();
  if (!token) {
    const error = new Error('Please sign in to use PlacePrep AI.');
    error.status = 401;
    throw error;
  }

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ message }),
    signal
  });

  if (!response.ok) {
    let detail = `Unable to reach PlacePrep AI (${response.status}).`;
    try {
      const body = await response.json();
      detail = body?.message || body?.error || detail;
    } catch {
      // The backend may return a non-JSON error body.
    }
    const error = new Error(detail);
    error.status = response.status;
    throw error;
  }

  if (!response.body) throw new Error('PlacePrep AI returned an empty response.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseEvents(buffer, onText, onError);
    }
    buffer += decoder.decode();
    parseEvents(buffer, onText, onError);
  } finally {
    reader.releaseLock();
  }
}
