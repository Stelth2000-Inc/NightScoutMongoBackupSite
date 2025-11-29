export { default } from "next-auth/middleware";

// Protect everything except the NextAuth routes themselves, the custom sign-in
// page, and static assets (including files under /images).
export const config = {
  matcher: [
    "/((?!api/auth|auth/signin|_next/static|_next/image|favicon.ico|robots.txt|images/).*)"
  ]
};


