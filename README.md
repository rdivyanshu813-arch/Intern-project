# Waypoint — Travel Itinerary Planner

**An application development internship project**  
Domain: Application Development · Project year: 2026

Waypoint is a responsive, installable travel planning web app for organizing trips and day-by-day activities in one place. It was developed as an independent application development internship project inspired by a travel itinerary planner idea. It does not imply sponsorship or endorsement by any organization.

## Features

- Create and edit trips with destination, dates, cover photo, and a personal note.
- See upcoming journeys and filter to all trips.
- Open a trip to view its day-by-day itinerary.
- Add activities with times and place notes; remove plans as details change.
- Save trips automatically in the browser with `localStorage`.
- Export all trips as a JSON backup and download an individual itinerary as Markdown.
- Install the app as a PWA; the app shell is cached for offline use after the first visit.
- Responsive layout, accessible dialog labels, keyboard-operable trip cards, and live status messages.

## Run locally

No build step or package installation is required. From this folder run a local static server, for example:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`. A local HTTP server is needed for service worker and install support. Opening `index.html` directly still lets you try the planner, but browser offline/PWA features require HTTP or HTTPS.

## Publish with GitHub Pages

1. Create a GitHub repository named `waypoint-travel-planner`.
2. Add and push the contents of this folder to the repository's `main` branch.
3. In **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait for the Pages build; the published URL will appear in the Pages settings.

The included `.nojekyll` file supports a straightforward root deployment. No API keys or backend are required. Google Fonts are used when online; the system falls back to local sans-serif fonts offline.

## Data and limitations

Trip data stays in the current browser profile and device. Clearing browser storage removes it, so use the JSON export for backups. There is no account sync, shared collaboration, live map, flight booking, or live destination search. Cover photo URLs must point to images reachable by the browser. The initial sample trips are demonstration data and can be edited or deleted.

## Project structure

```text
index.html          Accessible application structure and dialogs
styles.css          Responsive visual system and layouts
app.js              Trip, itinerary, persistence, and export logic
manifest.webmanifest PWA metadata
service-worker.js   Offline application-shell cache
icon.svg            App icon
REPORT.md           Internship report draft for presentation preparation
```

## Internship report

See [REPORT.md](REPORT.md) for the project report draft and presentation outline. Personalize any institution-specific details and add only work you actually completed before submitting it.

## Credits

Project concept and implementation: Divyanshu Raj. This is an independent educational portfolio project. No travel data or external APIs are used.
