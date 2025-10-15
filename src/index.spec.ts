// src/index.spec.ts
import { describe, it, expect } from 'vitest';
import app from './index.js';

describe('GET /', () => {
  it('should return 200 OK with "Hello Hono!"', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Hello Hono!');
  });
});
