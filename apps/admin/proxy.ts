import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/users(.*)",
  "/listings(.*)",
  "/orders(.*)",
  "/reports(.*)",
  "/settings(.*)",
  "/",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const signInUrl = new URL("/login", req.url).toString();
    await auth.protect({ unauthenticatedUrl: signInUrl });
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};