import { backendProxy } from '@/lib/backendProxy';
export async function POST(req: Request) {
  return backendProxy(req, 'admin/orders/ship');
}
