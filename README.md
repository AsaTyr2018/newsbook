# NewsBlogCMS

NewsBlogCMS ist ein moderner News-Blog mit Next.js, Tailwind CSS, Prisma und PostgreSQL. Über eine Adminoberfläche lassen sich Beiträge, Kategorien, Tags und Kommentare verwalten.

## Benutzerrollen

Das System unterstützt mehrere Rollen:

- **Gast** – kann lesen und Kommentare verfassen (Moderationsfreigabe erforderlich)
- **User** – kann lesen und Kommentare ohne Freigabe schreiben
- **Autor** – kann zusätzlich Artikel verfassen
- **Moderator** – kann Kommentare freigeben, ablehnen oder löschen
- **Admin** – volle Rechte

Anmeldungen können im Backend deaktiviert oder aktiviert werden.

## Installation

Führe das Setup-Skript aus, um Abhängigkeiten zu installieren, die `.env`-Datei anzulegen, PostgreSQL einzurichten und die Datenbank zu migrieren sowie mit Beispieldaten zu füllen:

```bash
./scripts/setup.sh
```

## Upgrade

Zum Aktualisieren auf die neueste Version und Anwenden ausstehender Datenbankmigrationen führe das Upgrade-Skript aus:

```bash
./scripts/upgrade.sh
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
