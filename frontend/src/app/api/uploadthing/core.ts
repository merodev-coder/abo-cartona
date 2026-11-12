import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { jwtVerify } from 'jose';

const f = createUploadthing();

export const ourFileRouter = {
  productImages: f({
    image: {
      maxFileSize: '8MB',
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      const token =
        req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
        req.cookies.get('abo_admin_token')?.value;
      if (!token || !process.env.JWT_SECRET) throw new UploadThingError('Unauthorized');
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(process.env.JWT_SECRET),
          { algorithms: ['HS256'] }
        );
        if (payload.role !== 'admin') throw new Error();
      } catch {
        throw new UploadThingError('Unauthorized');
      }
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
  orderAttachment: f({
    image: { maxFileSize: '8MB', maxFileCount: 1 },
  })
    .middleware(async () => {
      // Legacy public payment-proof uploads must never be used for new orders.
      throw new UploadThingError('Use the private checkout proof uploader');
    })
    .onUploadComplete(async ({ file }) => {
      // This will be used in the checkout flow for payment proof
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
