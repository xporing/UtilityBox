# UtilityBox Architecture

UtilityBox is designed as a private SaaS-style utility dashboard. It keeps public access minimal: the root page redirects to login unless a valid session exists. Every dashboard, tool, settings, and admin route is protected twice: in middleware with JWT checks, and in server components/API handlers with session role checks.

## Layers

1. **Presentation layer**
   - `src/app/(protected)/*` route-group pages
   - `src/components/*` reusable layouts and widgets
   - Client components for interactive tools

2. **Application/API layer**
   - `src/app/api/*/route.ts`
   - Auth, registration, settings, admin user management, and processing APIs
   - Rate limiting and validation helpers

3. **Domain/data layer**
   - `src/lib/prisma.ts`
   - `src/lib/files.ts`
   - `src/lib/video-url.ts`
   - Prisma models for users, invites, and usage logs

4. **Security layer**
   - `src/middleware.ts` route protection
   - `src/lib/authz.ts` server-side role checks
   - `src/lib/api.ts` API role checks and error handling
   - MIME/size validation, SSRF blocking, iframe sandboxing

## Auth flow

- User logs in through `/login`.
- Auth.js credentials provider verifies email/password against Prisma User.
- JWT session includes `id`, `role`, and `status`.
- Middleware redirects unauthenticated users away from protected routes.
- Admin pages and admin APIs require `role === "admin"`.

## File flow

- Client uploads files through FormData.
- API route validates file count, MIME type, file size, and user session.
- Image APIs process with Sharp and return a file or ZIP.
- Video-to-audio writes to a temp directory, runs FFmpeg, returns output, and deletes temp files.
- ToolUsage is logged after successful server-side processing.

## Video downloader safety flow

- User submits URL.
- Server validates scheme, credentials, host, DNS resolution, private IP ranges, and blocked platform domains.
- Server sends HEAD request without following redirects.
- Only direct video/octet-stream responses are allowed.
- Download endpoint repeats validation before streaming the file.
