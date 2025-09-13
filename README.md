# NewsBlogCMS

NewsBlogCMS is a comprehensive news blog application built with Next.js, Tailwind CSS, Prisma, and PostgreSQL. Its responsive interface and protected admin panel make it simple to manage posts, categories, tags, and comments.

## Features

### User Interface
- Post view at `/news/[slug]` showing title, date, content, category, tags, and comments
- Comment form with optional moderation
- Navigation via categories (`/category/[slug]`) and tags (`/tag/[slug]`)
- Full-text search and filtering by category or tag
- Responsive layout with optional dark mode

### Administration Area
- Sign in via NextAuth (admin only)
- Create, edit, delete, and preview posts using the Editor.js editor
- Automatic or manual slug generation with category and tag assignment
- Manage categories and tags
- Moderate and delete comments

## Installation

Requirements: [Node.js](https://nodejs.org/) and [PostgreSQL](https://www.postgresql.org/).

```bash
git clone https://github.com/AsaTyr2018/newsbook/
cd newsbook
./scripts/setup.sh
```

The setup script installs all dependencies, creates the `.env`, sets up the database, and seeds initial data.

## Development

```bash
npm run dev
# or for external access
npx next dev -H 0.0.0.0 -p 3000
```

The app will then be available at `http://localhost:3000`.

## Maintenance Mode and Updates

The `/api/update` endpoint now triggers a background worker rather than performing the update directly. After authenticating the admin request the endpoint sets the `maintenance` flag and signals the worker, then returns immediately with a response that the update has begun.

The worker runs automatically alongside the backend (`npm run start`) and watches for the trigger file. Once activated it:

1. Sets the maintenance flag using Prisma.
2. Stops running processes via PM2 (if available).
3. Executes `git fetch`, `git reset`, `npm ci`, `prisma migrate deploy`, and `npm run build`.
4. Restarts the processes and clears the maintenance flag.

Monitor progress by watching the worker logs in the terminal or via `pm2 logs` when PM2 is used.

If an update fails and the flag is not reset, you can clear it using an emergency release endpoint:

```bash
curl -X POST "http://localhost:3000/api/maintenance/release?secret=YOUR_SECRET"
```

Set `MAINTENANCE_RELEASE_SECRET` in your environment to protect the endpoint.

## Admin Test Account

The seed creates an admin user with username `admin` and password `admin`. The admin area is available at `/admin`.

⚠️ Security warning: anyone who leaves admin/admin as the username/password on a live installation is just asking to get hacked. Seriously, change it immediately!

## Roles

- **Guest** – can read and submit comments (requires moderation)
- **User** – can read and post comments without approval
- **Author** – can create articles
- **Moderator** – can approve, reject, or delete comments
- **Admin** – unrestricted access

Registrations can be disabled or enabled in the backend.
