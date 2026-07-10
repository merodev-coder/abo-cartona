import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  productImages: f({
    image: {
      maxFileSize: '8MB',
      maxFileCount: 10,
    },
  }).onUploadComplete(async ({ file }) => {
    return { url: file.ufsUrl };
  }),
  orderAttachment: f({
    image: { maxFileSize: '8MB', maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    // This will be used in the checkout flow for payment proof
    return { url: file.ufsUrl };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
