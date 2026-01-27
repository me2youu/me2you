import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/customize(.*)',
]);

// Routes that should skip Clerk entirely (external webhooks with no auth context)
const isWebhookRoute = createRouteMatcher([
  '/api/payment/notify',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip auth entirely for external webhooks
  if (isWebhookRoute(req)) return;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
