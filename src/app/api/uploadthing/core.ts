import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";
 
const f = createUploadthing();
 
export const ourFileRouter = {
  // Image uploader - used for template customization
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      // This runs before upload - you can optionally require auth
      const { userId } = await auth();
      // Allow both authenticated and guest uploads for ease of use
      return { userId: userId || "guest" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for:", metadata.userId);
      console.log("File URL:", file.url);
      // Return the URL to the client
      return { url: file.url };
    }),

  // Meme/GIF uploader - allows GIFs and images
  memeUploader: f({ 
    image: { maxFileSize: "8MB", maxFileCount: 20 },
  })
    .middleware(async () => {
      const { userId } = await auth();
      return { userId: userId || "guest" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Meme upload complete for:", metadata.userId);
      return { url: file.url };
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;
