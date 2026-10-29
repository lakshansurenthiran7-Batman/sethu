import assert from 'node:assert/strict';
import serverless from 'serverless-http';
import { createApp } from '../server/app.js';
import { createInitialState, DatabaseService, requestDatabase } from '../server/db.js';

// Exercise the real routing and domain logic using isolated fixtures.
delete process.env.GEMINI_API_KEY;
const handler = serverless(createApp());
const service = new DatabaseService(createInitialState());
async function call(path: string, method = 'GET', body?: object) {
  return requestDatabase.run(service, async () => {
    const response = await handler({
      httpMethod: method, path, headers: { 'content-type': 'application/json' },
      queryStringParameters: {}, body: body ? JSON.stringify(body) : null,
      isBase64Encoded: false, requestContext: { identity: { sourceIp: '127.0.0.1' } },
    }, {}) as { statusCode: number; body: string };
    return { status: response.statusCode, data: JSON.parse(response.body) };
  });
}

for (const path of ['/api/health', '/api/challenges', '/api/projects', '/api/departments',
  '/api/universities', '/api/notifications', '/api/audit-logs', '/api/analytics']) {
  assert.equal((await call(path)).status, 200, path);
}
const directory = await call('/api/departments');
assert.ok(directory.data.departments.length > 0);
assert.equal((await call('/api/challenges', 'POST', {})).status, 400);
const created = await call('/api/challenges', 'POST', {
  title: 'Village water supply interruption',
  description: 'Drinking water supply has stopped serving households in the village.',
  category: 'Water', district: 'Ranchi', citizenId: 'test-citizen',
});
assert.equal(created.status, 201);
assert.ok(created.data.challenge.id);
const id = created.data.challenge.id;
assert.equal((await call(`/api/challenges/${id}`)).status, 200);
assert.equal(created.data.challenge.status, 'PENDING_GOVT_VALIDATION');
assert.equal((await call('/api/does-not-exist')).status, 404);
const reloaded = new DatabaseService(structuredClone(service.snapshot()));
assert.ok(reloaded.getChallengeById(id));
await call('/api/demo/reset', 'POST', {});
assert.equal(service.getChallengeById(id), undefined);
assert.equal(new DatabaseService().getChallengeById(id), undefined);
console.log('API checks passed: initial data, directory, validation, challenge submission, reload, reset, and JSON 404.');
