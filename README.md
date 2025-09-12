# NewsBlogCMS

NewsBlogCMS ist eine umfassende News-Blog-Anwendung auf Basis von Next.js, Tailwind CSS, Prisma und PostgreSQL. Über eine responsive Benutzeroberfläche und ein geschütztes Admin-Panel lassen sich Beiträge, Kategorien, Tags und Kommentare komfortabel verwalten.

## Funktionen

### Benutzeroberfläche
- Beitragsansicht unter `/news/[slug]` mit Titel, Datum, Inhalt, Kategorie, Tags und Kommentaren
- Kommentarformular mit optionaler Moderation
- Navigation über Kategorien (`/category/[slug]`) und Tags (`/tag/[slug]`)
- Volltextsuche sowie Filterung nach Kategorie oder Tag
- Responsive Layout mit optionalem Dark Mode

### Administrationsbereich
- Anmeldung über NextAuth (Admin-only)
- Erstellen, Bearbeiten, Löschen und Vorschau von Beiträgen im Editor.js-Editor
- Automatische oder manuelle Slug-Generierung mit Kategorie- und Tag-Zuweisung
- Verwaltung von Kategorien und Tags
- Moderation und Löschung von Kommentaren

## Installation

Voraussetzungen: [Node.js](https://nodejs.org/) und [PostgreSQL](https://www.postgresql.org/).

```bash
git clone https://github.com/AsaTyr2018/newsbook/
cd newsbook
./scripts/setup.sh
```

Das Setup-Skript installiert alle Abhängigkeiten, erstellt die `.env`, richtet die Datenbank ein und spielt Seed-Daten ein.

## Entwicklung

```bash
npm run dev
# oder für externen Zugriff
npx next dev -H 0.0.0.0 -p 3000
```

Die Anwendung ist anschließend unter `http://localhost:3000` erreichbar.

## Admin-Testkonto

Der Seed erzeugt einen Admin-Benutzer mit Benutzername `admin` und Passwort `admin`. Der Admin-Bereich ist unter `/admin` verfügbar.

⚠️ Sicherheitshinweis: Wer admin/admin als Benutzername/Passwort auf einer Live-Installation lässt, hat den Hacker echt verdient. 
Wirklich, änder das sofort!

## Rollenmodell

- **Gast** – kann lesen und Kommentare verfassen (Moderation erforderlich)
- **User** – kann lesen und Kommentare ohne Freigabe schreiben
- **Autor** – kann Artikel erstellen
- **Moderator** – kann Kommentare freigeben, ablehnen oder löschen
- **Admin** – uneingeschränkte Rechte

Anmeldungen können im Backend deaktiviert oder aktiviert werden.
