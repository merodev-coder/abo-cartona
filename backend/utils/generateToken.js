import jwt from 'jsonwebtoken';

export function generateToken(payload, secret = process.env.JWT_SECRET, expiresIn = '1d') {
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign(payload, secret, { expiresIn });
}
