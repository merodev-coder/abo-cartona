import test from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { login } from '../controllers/authController.js';
test('server login produces a usable signed admin token without public credentials', async () => {
  process.env.JWT_SECRET = 'isolated-unit-test-secret';
  process.env.ADMIN_USERNAME = 'qa';
  process.env.ADMIN_PASSWORD = 'isolated-password';
  let result;
  await login(
    { body: { username: 'qa', password: 'isolated-password' } },
    {
      json(value) {
        result = value;
      },
    },
    (error) => {
      throw error;
    }
  );
  assert.equal(result.success, true);
  assert.equal(jwt.verify(result.token, process.env.JWT_SECRET).role, 'admin');
});
test('missing, bypass and non-admin tokens cannot access administrative routes', () => {
  process.env.JWT_SECRET = 'isolated-unit-test-secret';
  for (const token of [
    '',
    'bypass-token-for-admin',
    jwt.sign({ role: 'customer' }, process.env.JWT_SECRET),
  ]) {
    let status;
    let allowed = false;
    const response = {
      status(code) {
        status = code;
        return this;
      },
      json() {},
    };
    authMiddleware({ headers: { authorization: `Bearer ${token}` } }, response, () => {
      allowed = true;
    });
    assert.equal(allowed, false);
    assert.ok([401, 403].includes(status));
  }
});
test('a server-signed admin token is accepted', () => {
  process.env.JWT_SECRET = 'isolated-unit-test-secret';
  const req = {
    headers: {
      authorization: `Bearer ${jwt.sign({ role: 'admin', username: 'qa' }, process.env.JWT_SECRET)}`,
    },
  };
  let allowed = false;
  authMiddleware(req, {}, () => {
    allowed = true;
  });
  assert.equal(allowed, true);
  assert.equal(req.user.username, 'qa');
});
