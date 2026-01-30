import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Image uploader - used for template customization
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      // Allow all uploads — auth is optional
      let userId = "guest";
      try {
        const { auth } = await import("@clerk/nextjs/server");
        const session = await auth();
        if (session?.userId) userId = session.userId;
      } catch {
        // Auth not available in this context — continue as guest
      }
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for:", metadata.userId);
      console.log("File URL:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),

  // Meme/GIF uploader - allows GIFs and images
  memeUploader: f({ 
    image: { maxFileSize: "8MB", maxFileCount: 20 },
  })
    .middleware(async () => {
      let userId = "guest";
      try {
        const { auth } = await import("@clerk/nextjs/server");
        const session = await auth();
        if (session?.userId) userId = session.userId;
      } catch {
        // Auth not available
      }
      return { userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Meme upload complete for:", metadata.userId);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
