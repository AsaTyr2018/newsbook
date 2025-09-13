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
