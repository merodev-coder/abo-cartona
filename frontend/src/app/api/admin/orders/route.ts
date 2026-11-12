import { backendProxy } from '@/lib/backendProxy';
export async function GET(req: Request) {
  return backendProxy(req, `orders${new URL(req.url).search}`);
}
