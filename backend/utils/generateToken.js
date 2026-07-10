import jwt from 'jsonwebtoken';

export function generateToken(payload, secret, expiresIn = '7d') {
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign(payload, secret, { expiresIn });
}
