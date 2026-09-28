# SidTech Google Sheets Backend

This folder contains the first backend layer for migrating SidTech from browser/localStorage storage to Google Sheets.

## Setup

1. Create a Google Spreadsheet named `SidTech Database`.
2. Open **Extensions → Apps Script**.
3. Add `Code.ts` (or paste its contents into `Code.gs` if you do not use clasp yet).
4. Set the Apps Script project timezone to `Asia/Kolkata`.
5. Run `ensureDatabase()` once and authorize the script.
6. Deploy as **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Copy the Web App URL. It will be used as `VITE_GOOGLE_APPS_SCRIPT_URL` in the React app.

## Important

Do not put Gemini API keys, admin passwords, or service-account credentials in GitHub. Use Apps Script Properties / a server-side secret store for secrets.

The current `Code.ts` is the storage/API foundation. The next migration step wires the existing `SidTechDatabase` methods to this backend while preserving the current UI.
