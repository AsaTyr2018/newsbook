# NewsBlogCMS

NewsBlogCMS ist ein moderner News-Blog mit Next.js, Tailwind CSS, Prisma und PostgreSQL. Über eine Adminoberfläche lassen sich Beiträge, Kategorien, Tags und Kommentare verwalten.

## Installation

1. `.env.example` nach `.env` kopieren und `DATABASE_URL`, `NEXTAUTH_URL` sowie `NEXTAUTH_SECRET` anpassen.
2. Abhängigkeiten installieren und Datenbank einrichten:

```bash
npm install
npx prisma migrate dev
npm run prisma:seed
```

## Entwicklung starten

```bash
npm run dev
-> Für extern
npx next dev -H 0.0.0.0 -p 3000
```

Die App läuft anschließend unter `http://localhost:3000`.

## Admin-Testkonto

Der Seed legt einen Admin-Benutzer mit Benutzername `admin` und Passwort `admin` an. Damit kannst du dich im Admin-Bereich unter `/admin` anmelden.
