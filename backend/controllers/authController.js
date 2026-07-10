import { generateToken } from '../utils/generateToken.js';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});

export async function login(req, res, next) {
  try {
    const { username, password } = loginSchema.parse(req.body);
    
    const envUsername = process.env.ADMIN_USERNAME;
    const envPassword = process.env.ADMIN_PASSWORD;
    
    // Simple plain text comparison from .env
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = generateToken({ username: process.env.ADMIN_USERNAME, role: 'admin' });
    return res.json({ success: true, token });
}
    
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: err.errors });
    }
    next(err);
  }
}
