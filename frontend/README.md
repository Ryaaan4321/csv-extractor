# GrowEasy CSV Importer Frontend

Next.js frontend for uploading arbitrary CSV lead exports, previewing parsed rows, and displaying AI-normalized GrowEasy CRM records.

## Setup

Install dependencies and create `frontend/.env.local` if the Express API is not running at the default address:

```bash
npm install
```

```env
BACKEND_API_URL=http://localhost:5000/api
```

`BACKEND_API_URL` is read only by the Next.js proxy routes and is never exposed to the browser.

Start the Express backend first, then run:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm run lint
npm test
npm run build
```

The frontend accepts CSV files up to 10 MB. Uploaded data is held by the backend for 30 minutes, so an expired import must be uploaded again.
