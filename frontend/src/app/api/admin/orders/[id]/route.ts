import { backendProxy } from '@/lib/backendProxy';
type Context = { params: Promise<{ id: string }> };
async function proxy(req: Request, context: Context) {
  const { id } = await context.params;
  return backendProxy(req, `orders/${encodeURIComponent(id)}`);
}
export { proxy as GET, proxy as PATCH, proxy as DELETE };
