# AGENTS.md – Codex Instruction: News Blog Applikation

## Projektname

**NewsBlogCMS**

## Zweck

Diese Codex-Anwendung dient der Verwaltung und Darstellung eines modernen News-Blogs mit vollständig online-basierter Administration. Beiträge können erstellt, editiert, kategorisiert, verschlagwortet, kommentiert und gefiltert werden. Das Design ist responsiv und auf Dark Mode ausgelegt.

---

## Technologiestack

| Komponente        | Technologie          |
| ----------------- | -------------------- |
| Frontend          | Next.js              |
| Styling           | Tailwind CSS         |
| Editor            | TipTap               |
| Backend (API)     | Next.js API Routes   |
| Datenbank         | PostgreSQL           |
| ORM / DB-Layer    | Prisma               |
| Authentifizierung | Auth.js (NextAuth)   |
| Hosting           | Vercel               |
| Kommentare        | Custom API + DB      |
| URL Slugs         | Slugify              |
| SEO & Routing     | Next.js Routing      |
| Suche & Filter    | Prisma Fulltext      |
| Admin-UI          | Custom mit Tailwind  |
| Dark Mode         | Tailwind class-based |

---

## Funktionen (User Facing)

### 1. Beitragsanzeige

* Einzelansicht via Slug-URL: `/news/beitragstitel`
* Anzeige von Titel, Datum, Inhalt, Kategorie, Tags, Kommentaren

### 2. Kommentarfunktion

* Formular mit Name, Nachricht, Captcha (optional)
* Speicherung in DB, Anzeige unter Beitrag

### 3. Kategorien & Tags

* Kategorien: Einzelauswahl pro Beitrag
* Tags: Mehrfachauswahl
* Navigation über Tag- und Kategorie-Seiten

### 4. Suche & Filter

* Volltextsuche über Titel & Inhalt (API)
* Filter nach Kategorie, Tag (per Query-Parameter)

---

## Funktionen (Admin UI)

### 1. Login / Auth

* Zugangsschutz über NextAuth (Admin-Only)

### 2. Beiträge verwalten

* CRUD: Erstellen, Editieren, Löschen, Vorschau
* WYSIWYG Editor mit TipTap
* Slug automatisch generiert (editierbar)
* Kategorie & Tags Zuweisung

### 3. Kategorien / Tags verwalten

* Liste, hinzufügen, bearbeiten, löschen

### 4. Kommentare moderieren

* Liste, löschen, (optional: freischalten)

---

## Routing & URL-Rewrite

* Alle Beiträge unter `/news/[slug]`
* Tags unter `/tag/[slug]`, Kategorien unter `/category/[slug]`
* Rewrite intern über Next.js Dynamic Routing

---

## Sicherheit & Performance

* Admin-Routen mit Authentifizierung schützen
* Rate Limiting für Kommentare
* Responsive Design für Mobile/Desktop
* Lazy Loading für Bilder im Editor

---

## Entwicklungsstruktur

```
/newsblogcms
├── pages
│   ├── index.tsx
│   ├── news/[slug].tsx
│   ├── tag/[slug].tsx
│   ├── category/[slug].tsx
│   ├── admin/
│   │   ├── index.tsx
│   │   ├── posts.tsx
│   │   └── login.tsx
├── prisma
│   └── schema.prisma
├── lib
│   └── slugify.ts
├── components
│   ├── Editor.tsx
│   ├── PostList.tsx
│   ├── PostForm.tsx
│   └── CommentSection.tsx
├── styles
│   └── globals.css
```

---

## Deployment

* Automatisch via Vercel (Push auf `main` Branch)
* .env Konfiguration für DB, Auth

---

## Erweiterungsideen (Optional)

* Mehrsprachigkeit via i18n
* RSS Feed Generierung
* E-Mail-Benachrichtigung bei neuen Kommentaren
* Admin Dashboard mit Statistiken
