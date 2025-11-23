# Wichtel-App 🎁

Eine kleine Web-App zum Organisieren von Wichtel-Aktionen (Secret
Santa). Teilnehmende werden eingetragen, zufällig einander zugewiesen
und können ihre Wichtel-Zuteilung bequem online einsehen.


## Features

-   ✏️ Teilnehmende erfassen (Name, ggf. E-Mail o. Ä.)
-   🔀 Zufällige Wichtel-Zuteilung per Klick
-   🔒 Speicherung der Daten über Firebase (z. B. Firestore/Realtime DB)
-   🌐 Deployment über Netlify -- sofort online nutzbar
-   📱 Responsive UI mit Tailwind CSS

## Tech-Stack

-   **Build-Tool:** Vite
-   **Sprache:** JavaScript (Frontend)
-   **Styling:** Tailwind CSS
-   **Hosting (Frontend):** Netlify
-   **Backend / Daten:** Firebase

## Live-Demo

> 🔗 **Live:** https://DEINE-NETLIFY-URL.netlify.app

## Installation & Entwicklung

### Voraussetzungen

-   Node.js (empfohlen: ≥ 18)
-   npm oder anderer Paketmanager

### Projekt klonen

``` bash
git clone https://github.com/esugre/wichtel-app.git
cd wichtel-app
```

### Abhängigkeiten installieren

``` bash
npm install
```

### Entwicklungsserver starten

``` bash
npm run dev
```

### Produktionsbuild

``` bash
npm run build
```

Optional: lokaler Preview

``` bash
npm run preview
```

## Konfiguration (Firebase)

Erstelle eine `.env` oder `.env.local`:

    VITE_FIREBASE_API_KEY=dein_api_key
    VITE_FIREBASE_AUTH_DOMAIN=dein_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=dein_project_id
    VITE_FIREBASE_STORAGE_BUCKET=dein_project.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=deine_sender_id
    VITE_FIREBASE_APP_ID=deine_app_id

## Deployment auf Netlify

1.  Repo verbinden
2.  Build Command: `npm run build`
3.  Publish Directory: `dist`
4.  Env-Variablen hinterlegen
5.  Deploy starten

## Ordnerstruktur

    wichtel-app/
    ├─ src/
    │  ├─ components/
    │  ├─ assets/
    │  ├─ main.js
    │  └─ ...
    ├─ index.html
    ├─ netlify.toml
    ├─ package.json
    ├─ tailwind.config.js
    ├─ vite.config.js
    └─ ...

## Lizenz

MIT License -- optional ergänzen.

## TODO

-   E-Mail-Benachrichtigungen
-   Gruppen-Unterstützung
-   Ausschlussregeln
-   Dark Mode
