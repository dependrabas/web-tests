# Trongsa College CLCS Portal

Responsive college portal and lightweight content management system for the Trongsa College of Heritage and Contemporary Studies, historically known as the College of Language and Culture Studies (CLCS).

The project includes:

- A public React website for college information, programmes, admissions, notices, downloads, gallery, contact, and the Sampa helper chat.
- An admin dashboard available directly at `/admin/`.
- An Express API that serves content and writes CMS changes to a JSON file.
- A Vite development runtime and a production build that bundles both frontend and server output.

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Quick Start](#quick-start)
3. [Scripts](#scripts)
4. [Application URLs](#application-urls)
5. [Project Structure](#project-structure)
6. [Architecture](#architecture)
7. [Frontend Documentation](#frontend-documentation)
8. [Admin Dashboard](#admin-dashboard)
9. [Backend and Data Storage](#backend-and-data-storage)
10. [API Reference](#api-reference)
11. [Content Editing Guide](#content-editing-guide)
12. [Responsive Design Notes](#responsive-design-notes)
13. [Production Build](#production-build)
14. [Security and Current Limitations](#security-and-current-limitations)
15. [Troubleshooting](#troubleshooting)

## Technology Stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4 through the Vite plugin, custom CSS tokens in `src/index.css` |
| Icons | `lucide-react` |
| Motion | `motion` |
| Server | Express 4 |
| Dev TypeScript runtime | `tsx` |
| Production server bundling | `esbuild` |
| Persistence | `data/db.json` |

## Quick Start

### Prerequisites

- Node.js installed.
- npm installed.

The repository already uses npm through `package-lock.json`.

### Install and run

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin entry:

```text
http://localhost:3000/admin/
```

The Express server listens on port `3000` by default. In development it mounts Vite as middleware, so one command runs the frontend and API together. To use another port:

```bash
PORT=3001 npm run dev
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts `server.ts` with `tsx`; Express mounts Vite middleware for development. |
| `npm run lint` | Runs TypeScript checking with `tsc --noEmit`. |
| `npm run build` | Builds the Vite frontend and bundles `server.ts` into `dist/server.cjs`. |
| `npm start` | Starts the built production server from `dist/server.cjs`. |
| `npm run clean` | Removes `dist` and `server.js`. |

Recommended local verification before delivery:

```bash
npm run lint
npm run build
```

## Application URLs

| URL | Behavior |
| --- | --- |
| `/` | Public college website. |
| `/admin/` | Opens the admin tab directly. If no admin token exists in browser storage, the admin login form is shown. |
| `/api/...` | JSON API endpoints used by the public site and admin dashboard. |

### Navigation model

The public website is currently tab-driven inside React, not a full URL router.

- Navbar actions change `currentTab` in `src/App.tsx`.
- About pages and programme detail views use `currentSlug`.
- `/admin/` is the one direct browser path interpreted on frontend startup.
- Public tabs such as Academics or Gallery do not currently have separate URLs.

## Project Structure

```text
.
|-- data/
|   `-- db.json                     # JSON database used by the API
|-- server/
|   `-- db.ts                       # Data schema, seed data, load/save helpers
|-- src/
|   |-- App.tsx                     # Frontend orchestrator and shared state
|   |-- main.tsx                    # React bootstrap
|   |-- index.css                   # Tailwind import, theme tokens, base CSS
|   |-- types.ts                    # Frontend content types
|   `-- components/
|       |-- AdminDashboard.tsx      # Admin CMS UI
|       |-- HeroSlider.tsx          # Home hero slider
|       |-- InquiryForm.tsx         # Shared inquiry form UI
|       |-- MarkdownContent.tsx     # Basic markdown-like page renderer
|       |-- Navbar.tsx              # Public header and navigation
|       |-- SampaBot.tsx            # Floating chat panel
|       |-- SiteFooter.tsx          # Public footer
|       `-- pages/
|           |-- HomePage.tsx
|           |-- AboutPage.tsx
|           |-- AcademicsPage.tsx
|           |-- AdmissionsPage.tsx
|           |-- ResearchPage.tsx
|           |-- ServicesPage.tsx
|           |-- AnnouncementsPage.tsx
|           |-- GalleryPage.tsx
|           |-- DownloadsPage.tsx
|           `-- ContactPage.tsx
|-- server.ts                       # Express API and production/dev server setup
|-- vite.config.ts                  # Vite + React + Tailwind plugin config
|-- package.json
`-- index.html
```

## Architecture

### Runtime flow

1. `server.ts` starts Express on port `3000`.
2. `server/db.ts` loads `data/db.json`.
3. If `data/db.json` does not exist or cannot be parsed, seed data is written.
4. In development, Vite middleware serves React source modules.
5. In production, Express serves the built `dist` assets and falls back to `dist/index.html` for frontend paths.
6. `src/App.tsx` fetches public content from `/api/*` endpoints and passes content into page components.
7. Admin mutations call protected API endpoints and write changes back to `data/db.json`.

### Frontend state ownership

`src/App.tsx` owns cross-page state:

- Loaded content datasets.
- Current public tab and detail slug.
- Admin token stored in browser `localStorage` under `clcs_admin_token`.
- Search and category filters for announcements and downloads.
- Shared inquiry form values and success message.
- Gallery lightbox state.

Page components receive typed props and focus on rendering a single screen.

## Frontend Documentation

### Public pages

| Component | Main responsibility |
| --- | --- |
| `HomePage` | Hero slider, featured programmes, quick intake callout, stats, announcement preview, portal links. |
| `AboutPage` | About sidebar, markdown-rendered overview/history/vision/leadership content, staff profile grid. |
| `AcademicsPage` | Programme directory and programme detail screen. |
| `AdmissionsPage` | Admissions steps, admission downloads, quick inquiry form. |
| `ResearchPage` | Research introduction, featured publication cards, research forms and email submission callout. |
| `ServicesPage` | Public student service cards. |
| `AnnouncementsPage` | Notice filtering, search, and document links. |
| `GalleryPage` | Gallery grid and image lightbox. |
| `DownloadsPage` | Download filtering and responsive document directory. |
| `ContactPage` | Inquiry form, address/contact block, map embed. |

### Shared components

| Component | Notes |
| --- | --- |
| `Navbar` | Public header only. Admin entry links were removed from the visible public navigation. |
| `SiteFooter` | Public footer navigation and admin session badge when an admin token is active. |
| `InquiryForm` | Shared form UI for admissions and contact screens. |
| `MarkdownContent` | Small markdown-like renderer for CMS page text. |
| `HeroSlider` | Auto-rotating home slider with CTA callbacks. |
| `SampaBot` | Floating chat UI backed by `/api/chat`. |

### Markdown-like page content

About page records stored in `pages[].content` support a limited renderer:

| Input pattern | Rendered output |
| --- | --- |
| `### Heading` | Section heading |
| `#### Heading` | Small subheading |
| `- Item` | List item |
| `> Quote` | Blockquote |
| `**bold**` | Bold inline text |
| Empty line | Spacing |

This renderer is not a complete Markdown parser.

## Admin Dashboard

### Access

Open:

```text
http://localhost:3000/admin/
```

Seed credentials in the current codebase are:

```text
Username: admin
Password: clcs123
```

Change the password immediately for any real deployment.

### Admin features currently exposed in the dashboard

- Admin login.
- Change password.
- Edit global site settings and contact information.
- Create/edit/delete homepage sliders.
- Edit markdown-backed pages.
- Create/edit/delete programmes.
- Create/edit/delete announcements.
- Create/edit/delete staff profiles.
- Create/edit/delete downloads.
- Add/delete gallery images.

The admin dashboard UI currently lives in one file, `src/components/AdminDashboard.tsx`. Public pages are already split into smaller components; splitting admin sections is the next maintainability refactor if that dashboard grows further.

## Backend and Data Storage

### JSON database

Persistent content is stored in:

```text
data/db.json
```

The TypeScript schema and default seed content live in:

```text
server/db.ts
```

### Main stored collections

| Key | Purpose |
| --- | --- |
| `admins` | Admin users and SHA-256 password hashes. |
| `settings` | College name, subtitle, navbar alert, enrollment flag. |
| `contactInfo` | Address, phone, email, hours, map URL. |
| `pages` | About and general content pages. |
| `programmes` | Academic programme cards and detail content. |
| `announcements` | Notice board entries. |
| `newsEvents` | News/event records exposed by API. |
| `staffProfiles` | Faculty and leadership cards. |
| `researchPublications` | Research records exposed by API. |
| `studentServices` | Student service records exposed by API. |
| `homepageSlider` | Home hero slides. |
| `downloads` | Download registry entries. |
| `gallery` | Gallery image entries. |
| `socialLinks`, `footerLinks` | Navigation-style data exposed by API. |

### Important behavior

- `loadDatabase()` caches parsed data in process memory.
- `saveDatabase()` writes the JSON file and updates the cache.
- API POST endpoints are used for both create and update behavior for most collections.
- Some slugs are generated automatically from titles for programmes and services.
- Page updates refresh `lastUpdated`.

## API Reference

### Authentication

Admin write requests send:

```http
Authorization: Bearer <admin-token>
Content-Type: application/json
```

Login response tokens currently begin with:

```text
clcs-admin-token-
```

### Endpoint summary

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | No | Log in with username and password. |
| `POST` | `/api/auth/change-password` | Yes | Change the primary admin password. |
| `GET` | `/api/settings` | No | Get `settings` and `contactInfo`. |
| `POST` | `/api/settings` | Yes | Update settings/contact info. |
| `GET` | `/api/navigation` | No | Get social links and footer links. |
| `POST` | `/api/navigation` | Yes | Replace social links/footer links. |
| `GET` | `/api/pages` | No | List pages. |
| `GET` | `/api/pages/:slug` | No | Get one page by slug. |
| `POST` | `/api/pages` | Yes | Create or update a page. |
| `GET` | `/api/slider` | No | List homepage slides. |
| `POST` | `/api/slider` | Yes | Create or update a slide. |
| `DELETE` | `/api/slider/:id` | Yes | Delete a slide. |
| `GET` | `/api/programmes` | No | List programmes. |
| `GET` | `/api/programmes/:slug` | No | Get a programme by slug. |
| `POST` | `/api/programmes` | Yes | Create or update a programme. |
| `DELETE` | `/api/programmes/:id` | Yes | Delete a programme. |
| `GET` | `/api/announcements` | No | List announcements. |
| `POST` | `/api/announcements` | Yes | Create or update an announcement. |
| `DELETE` | `/api/announcements/:id` | Yes | Delete an announcement. |
| `GET` | `/api/news-events` | No | List news events. |
| `POST` | `/api/news-events` | Yes | Create or update a news event. |
| `DELETE` | `/api/news-events/:id` | Yes | Delete a news event. |
| `GET` | `/api/staff` | No | List staff profiles ordered by `order`. |
| `POST` | `/api/staff` | Yes | Create or update a staff profile. |
| `DELETE` | `/api/staff/:id` | Yes | Delete a staff profile. |
| `GET` | `/api/research` | No | List research publication records. |
| `POST` | `/api/research` | Yes | Create or update a research publication. |
| `DELETE` | `/api/research/:id` | Yes | Delete a research publication. |
| `GET` | `/api/services` | No | List student services. |
| `GET` | `/api/services/:slug` | No | Get one service by slug. |
| `POST` | `/api/services` | Yes | Create or update a service. |
| `DELETE` | `/api/services/:id` | Yes | Delete a service. |
| `GET` | `/api/downloads` | No | List download items. |
| `POST` | `/api/downloads` | Yes | Create or update a download item. |
| `DELETE` | `/api/downloads/:id` | Yes | Delete a download item. |
| `GET` | `/api/gallery` | No | List gallery images. |
| `POST` | `/api/gallery` | Yes | Create or update a gallery image. |
| `DELETE` | `/api/gallery/:id` | Yes | Delete a gallery image. |
| `POST` | `/api/contact-inquiry` | No | Submit a public contact/admissions inquiry. |
| `GET` | `/api/contact-inquiries` | Yes | List inquiries stored in current server memory. |
| `POST` | `/api/chat` | No | Get a rules-based Sampa chat response. |

### Example requests

#### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"clcs123"}'
```

#### Create or update an announcement

```bash
curl -X POST http://localhost:3000/api/announcements \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer clcs-admin-token-example' \
  -d '{
    "title": "Admission notice",
    "category": "Announcements",
    "description": "Updated admission instructions.",
    "pdfUrl": "#"
  }'
```

For the live admin UI, use the token returned by `/api/auth/login`.

## Content Editing Guide

### Preferred edit path

Use the admin dashboard for content stored in `data/db.json`:

1. Open `/admin/`.
2. Log in.
3. Open the relevant dashboard section.
4. Save the content.
5. Confirm the public page refreshes with the new data.

### Edit code when changing layout or behavior

| Change | File area |
| --- | --- |
| Main app state or tab selection | `src/App.tsx` |
| Header navigation | `src/components/Navbar.tsx` |
| Footer links/layout | `src/components/SiteFooter.tsx` |
| One public page layout | `src/components/pages/<PageName>.tsx` |
| Shared inquiry form fields/layout | `src/components/InquiryForm.tsx` |
| Typography/theme/base CSS | `src/index.css` |
| REST endpoint behavior | `server.ts` |
| Database schema or seed content | `server/db.ts` |
| Live stored content | `data/db.json` |

### Current English-only behavior

The visible public UI is currently English-only. The database still contains `collegeNameDzongkha` in settings because it remains part of the stored settings schema and admin settings form.

## Responsive Design Notes

The current frontend uses responsive Tailwind classes and mobile-first grids.

- Public page grids collapse to one column on small screens.
- Programme, services, gallery, and footer layouts increase columns at tablet or desktop breakpoints.
- Downloads use card rows on mobile and a table on desktop.
- Filter bars wrap and search fields stretch on narrow viewports.
- The Sampa chat panel uses viewport-aware side spacing on small screens.

When adding UI:

- Prefer `grid-cols-1` first, then add `sm:`, `md:`, or `lg:` columns.
- Use `min-w-0` and wrapping where long titles, emails, or filenames may appear.
- Avoid adding fixed-width tables without a mobile alternative.
- Test admin and public pages at narrow and wide viewport widths.

## Production Build

Build:

```bash
npm run build
```

Run the production server:

```bash
npm start
```

Production behavior:

- Vite writes frontend assets into `dist`.
- `esbuild` bundles `server.ts` to `dist/server.cjs`.
- Express serves `dist` static files.
- Express returns `dist/index.html` for frontend fallback paths such as `/admin/`.

## Security and Current Limitations

This project is suitable as a lightweight local CMS prototype. Review these points before production use.

1. Admin password hashes use plain SHA-256 in `server/db.ts`, not a password hashing algorithm such as bcrypt or Argon2.
2. `isAdmin` currently accepts any bearer token with the `clcs-admin-token-` prefix. It does not verify token issuance, expiry, user identity, or revocation.
3. Admin tokens are stored in browser `localStorage`.
4. Seed admin credentials are present in code and should not be used in production.
5. Contact inquiries are stored in an in-memory array in `server.ts`; they are lost when the server restarts.
6. The chatbot is rules-based. It does not call an external AI API and does not need an API key.
7. The public frontend fetches some API datasets that are not fully rendered by current page components, including news events and dynamic student service records.
8. File and image fields are URL-based. There is no upload storage service in this codebase.
9. `data/db.json` is file-based storage and is not designed for concurrent multi-instance writes.

Before a production deployment, replace prototype authentication, secure credentials, persist inquiries, validate input more strictly, and choose storage suitable for the deployment model.

## Troubleshooting

### Port `3000` is already in use

Another copy of the app is already running, or another process is using port `3000`.

- Open `http://localhost:3000` first; if the site loads, the server is already running.
- Stop the existing terminal process with `Ctrl+C`, or
- run a second copy on another port with `PORT=3001 npm run dev`.

### Public pages show seed or stale content

- Check `data/db.json`.
- Confirm the server process was restarted after manual JSON edits if needed.
- Prefer saving through the admin dashboard so `saveDatabase()` updates the running cache.

### Admin URL opens the public site home

Use the trailing admin path:

```text
http://localhost:3000/admin/
```

The frontend detects `/admin` or `/admin/` during startup.

### API write returns unauthorized

Admin mutation endpoints require an `Authorization` header whose value begins with `Bearer clcs-admin-token-`.

In normal use, log in through `/admin/` and let the dashboard send the returned token.

### Contact inquiries disappear after restart

That is current behavior. Inquiries are held in server memory and are not written to `data/db.json`.

## Maintenance Checklist

For typical changes:

1. Edit the relevant page component or shared component.
2. Keep content schema changes aligned between `src/types.ts` and `server/db.ts`.
3. Run `npm run lint`.
4. Run `npm run build`.
5. Check the public site and `/admin/` locally.
# tchc-website-developemnt
# testtest
# testtest
# web-test
# web-tests
