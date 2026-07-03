# UtilityBox

UtilityBox is a private, login-only utility toolbox web application. The public homepage is intentionally only a login screen/redirect. Dashboard, tools, settings, and admin pages are protected by authentication and role checks.

## Architecture

UtilityBox uses a modular full-stack Next.js App Router architecture:

- **Frontend:** Next.js App Router, TypeScript, Tailwind CSS, reusable shadcn-style UI primitives.
- **Backend:** Next.js route handlers under `src/app/api/*` for auth, admin, settings, image processing, video processing, and safe direct video download.
- **Auth:** Auth.js / NextAuth credentials provider with JWT sessions and route middleware. Passwords are hashed with bcrypt.
- **Database:** PostgreSQL via Prisma ORM.
- **File processing:** Server-side Sharp for image conversion/resizing/compression, FFmpeg for video-to-audio, JSZip for batch downloads.
- **Client-only security tools:** Password generator uses the browser Web Crypto API and never sends generated passwords to the server.
- **Security boundaries:** Protected routes, admin-only `/admin/*`, MIME validation, max file size limits, rate limits, SSRF protection for video downloader, sandboxed HTML preview iframe, and temporary file cleanup.

## Features

### Authentication and authorization

- Login page
- Register page with optional invite-code requirement
- Forgot password endpoint scaffold with safe generic response
- JWT session persistence
- Protected dashboard/tools/settings/admin routes
- Logout
- Roles: `admin`, `user`
- Admin-only user management
- Admin invite creation
- Disable/delete users
- Change user role
- Last login and creation date tracking

### Dashboard

- Welcome message
- Tool search
- Category filters: Marketing, Image, Video, Developer, Security, Generator
- Tool cards with icons and descriptions
- Recent activity
- Admin shortcut for admins
- Responsive sidebar and mobile header
- Dark/light mode

### Tools

1. **CPR Calculator**
   - Cost Per Result calculation
   - Currency selector
   - Campaign name
   - Target CPR status: Good, Warning, Bad
   - Copy result
   - Reverse budget/results calculator

2. **Image Converter**
   - Supports JPG, PNG, WebP, AVIF outputs
   - Accepts common image inputs including SVG/HEIC/HEIF where Sharp runtime supports them
   - Batch upload
   - Quality setting
   - ZIP download for batch conversion
   - Graceful unsupported-format errors

3. **Image Resizer**
   - Width/height resizing
   - Maintain aspect ratio toggle
   - Percentage scaling
   - Presets: Instagram post/story, YouTube thumbnail, Facebook post, X/Twitter post, website banner, custom
   - Preview before download

4. **Image Compressor**
   - Batch upload
   - Quality slider
   - Lossless option where supported
   - WebP output
   - ZIP download for batch compression
   - Summary file for batch results

5. **Video to Audio**
   - Extract MP3, WAV, or M4A
   - Quality selector
   - FFmpeg-backed server route
   - Auto-deletes temp files
   - Docker support recommended for large files

6. **HTML Viewer**
   - HTML textarea
   - CSS textarea
   - Optional JavaScript disabled by default
   - Security warning before enabling JS
   - Sandboxed iframe preview
   - Sanitization when JS is disabled
   - Copy and download `.html`

7. **QR Generator**
   - URL, text, email, phone, Wi-Fi, vCard
   - QR preview
   - PNG/SVG downloads
   - Custom size
   - Error correction level
   - Foreground/background colors
   - Copy encoded value

8. **Password Generator**
   - Length setting
   - Uppercase/lowercase/numbers/symbols
   - Excludes ambiguous characters by default
   - Passphrase mode
   - Copy to clipboard
   - Strength indicator
   - Web Crypto API client-side generation
   - No server storage or transmission

9. **Video Downloader for supported legal sources**
   - Direct media URL input
   - URL validation
   - Metadata check
   - Download direct media files only when technically and legally allowed
   - Blocks common platform URLs and private networks
   - Does not bypass DRM, paywalls, login restrictions, or terms

## Project structure

```txt
utilitybox/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  ├─ login/
│  │  ├─ register/
│  │  ├─ forgot-password/
│  │  └─ (protected)/
│  │     ├─ dashboard/
│  │     ├─ tools/
│  │     ├─ admin/users/
│  │     └─ settings/
│  ├─ components/
│  │  ├─ admin/
│  │  ├─ auth/
│  │  ├─ dashboard/
│  │  ├─ settings/
│  │  ├─ tools/
│  │  └─ ui/
│  ├─ lib/
│  ├─ types/
│  ├─ auth.ts
│  └─ middleware.ts
├─ .env.example
├─ docker-compose.yml
├─ Dockerfile
└─ README.md
```

## Database schema

Prisma models:

- `User`: id, email, name, passwordHash, role, status, createdAt, updatedAt, lastLoginAt
- `Invite`: id, email, token, role, expiresAt, usedAt, createdBy, createdAt
- `ToolUsage`: id, userId, toolName, action, fileSize, createdAt

## Requirements

- Node.js 22+
- PostgreSQL 15+
- FFmpeg available on the host for video extraction, or use the provided Docker setup
- npm or compatible package manager

## Setup

```bash
cp .env.example .env
npm install
```

Edit `.env`:

```env
DATABASE_URL=postgresql://utilitybox:utilitybox@localhost:5432/utilitybox?schema=public
AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
AUTH_SECRET=your-random-secret
```

Generate an auth secret:

```bash
openssl rand -base64 32
```

Start PostgreSQL with Docker:

```bash
docker compose up -d db
```

Run migrations and seed admin:

```bash
npx prisma migrate dev --name init
npm run seed
```

Start development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Default seed admin comes from `.env`:

```env
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=ChangeMe123!Strong
```

Change these before production.

## Registration controls

```env
ALLOW_PUBLIC_REGISTRATION=false
REQUIRE_INVITE_CODE=true
BOOTSTRAP_FIRST_USER_AS_ADMIN=false
```

Recommended private setup:

- Keep public registration disabled.
- Require invite codes.
- Create users through `/admin/users`.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_URL` | Auth.js app URL |
| `NEXT_PUBLIC_APP_URL` | Public application URL |
| `AUTH_SECRET` | Secret used to sign/encrypt auth tokens |
| `ALLOW_PUBLIC_REGISTRATION` | Allows registration without admin invite when true |
| `REQUIRE_INVITE_CODE` | Requires invite token on register when true |
| `BOOTSTRAP_FIRST_USER_AS_ADMIN` | Lets first registered user become admin |
| `SEED_ADMIN_EMAIL` | Seed admin email |
| `SEED_ADMIN_PASSWORD` | Seed admin password |
| `MAX_UPLOAD_MB` | Max upload size per file |
| `MAX_BATCH_FILES` | Max batch image files |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window |
| `RATE_LIMIT_MAX_REQUESTS` | Requests per rate limit window |
| `VIDEO_DOWNLOAD_MAX_MB` | Max direct video download size |
| `SMTP_*` | Reserved for future password reset email delivery |

## Production deployment

### Vercel

Vercel is good for the dashboard, auth, and small image jobs. Video processing with FFmpeg may exceed serverless duration or binary/runtime limits, so use Docker-compatible hosting for heavier video tasks.

1. Create a PostgreSQL database.
2. Set all environment variables in Vercel.
3. Run migrations from CI or local machine:

```bash
npx prisma migrate deploy
npm run seed
```

4. Deploy.

### Docker-compatible hosting

Use Docker when you want reliable FFmpeg availability:

```bash
docker compose up --build
```

For production, set strong secrets, a managed PostgreSQL database, persistent logs, reverse proxy TLS, and appropriate upload limits.

## Security notes

- All tools are behind authentication.
- Admin routes require `admin` role.
- Passwords are hashed with bcrypt.
- Uploaded files are validated by MIME type and size.
- Video/audio processing uses temp files and deletes them after processing.
- Expensive operations are rate-limited.
- HTML viewer previews inside a sandboxed iframe.
- JavaScript preview is disabled by default.
- Video downloader blocks private network targets to reduce SSRF risk.
- Video downloader only supports direct media URLs and blocks common platform domains.
- Generated passwords never leave the browser.
- Server secrets are read only from environment variables.

## Limitations

- HEIC/HEIF support depends on the deployed Sharp/libvips build.
- Complex SVGs may not render perfectly during raster conversion.
- AVIF encoding can be slower than WebP/JPEG.
- Serverless hosting may not be suitable for large video conversion jobs.
- Forgot password is scaffolded but needs a reset-token table and SMTP sender before production use.
- Video downloader intentionally does not support YouTube, TikTok, Instagram, Facebook, X/Twitter, Vimeo, DRM-protected, login-only, paywalled, or copyrighted content without permission.
- File processing is currently temporary and does not provide persistent storage/history of generated files.

## Adding new tools

1. Add metadata to `src/lib/tools.ts`.
2. Add a protected page under `src/app/(protected)/tools/<tool-name>/page.tsx`.
3. Add a client component under `src/components/tools/<tool-name>.tsx`.
4. Add a route handler under `src/app/api/tools/<tool-name>/route.ts` if server processing is needed.
5. Call `logToolUsage` from server routes to show recent activity.
