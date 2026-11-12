import jwt from 'jsonwebtoken';
export function isAdmin(req: Request): boolean {
  const cookie = req.headers.get('cookie')?.match(/(?:^|;\s*)abo_admin_token=([^;]+)/);
  const token =
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    (cookie ? decodeURIComponent(cookie[1]) : '');
  if (!token || !process.env.JWT_SECRET) return false;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    return typeof payload === 'object' && payload.role === 'admin';
  } catch {
    return false;
  }
}
