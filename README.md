# BMpopoyPortfolio

Board Member portfolio with admin-managed cloud content using TursoDB and Vercel serverless APIs.

## Features Implemented

- Supervisor-only admin login (email/password via environment variables)
- CRUD-ready static section content stored in Turso sections table
- Board activity event creation with:
	- Event date
	- Event title
	- Location
	- Multi-image upload (stored in Turso BLOB)
- Public bootstrap endpoint to load frontend content and recent events
- Admin event deletion endpoint

## Project Structure

- Frontend: index.html, style.css, script.js
- Backend API (Vercel serverless): api/
	- admin-auth.js
	- sections.js
	- events.js
	- event-image.js
	- bootstrap.js
	- _lib/ helpers (auth, Turso client, schema init, multipart parsing)

## Environment Variables

Create a .env file (or set in Vercel dashboard) based on .env.example:

- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN
- SUPERVISOR_EMAIL
- SUPERVISOR_PASSWORD
- ADMIN_JWT_SECRET
- ALLOWED_ORIGINS

Optional secure password mode:

- SUPERVISOR_PASSWORD_HASH (sha256 hash)

If SUPERVISOR_PASSWORD_HASH is provided, login compares the incoming password hash to that value.

## Local Development

1. Install dependencies:
	 npm install
2. Start local Vercel dev server:
	 npx vercel dev
3. Open the frontend URL from Vercel dev (not just Live Server) so API routes are available.

## Deploy to Vercel

1. Push repository to GitHub.
2. Import project in Vercel.
3. Set all environment variables in Vercel Project Settings.
4. Deploy.

## API Endpoints

- GET /api/bootstrap
	- Public bootstrap payload for sections + latest events
- GET /api/sections
	- Public sections payload
- PUT /api/sections
	- Admin only; upsert section with key/value
- DELETE /api/sections?key=...
	- Admin only; delete section by key
- POST /api/admin-auth
	- Admin login
- GET /api/admin-auth
	- Check current admin session
- DELETE /api/admin-auth
	- Admin logout
- GET /api/events
	- Public event listing
- POST /api/events
	- Admin only; create event with multipart image upload
- DELETE /api/events?eventId=...
	- Admin only; delete event and associated images
- GET /api/event-image?imageId=...
	- Public image stream endpoint
- DELETE /api/event-image?imageId=...
	- Admin only; delete single image

## Turso Tables Created Automatically

- sections
- events
- event_images

Schema initialization and default section seeding run automatically on first API request.

## Free Tier Management Tips

- Keep events pagination small (default limit is already applied)
- Store optimized images (compress before upload where possible)
- Reuse /api/bootstrap for public page load to reduce repeated reads
- Archive or remove old images periodically
