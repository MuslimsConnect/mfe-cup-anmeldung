# MFE Cup 2026 — Anmeldeformular

Anmeldeformular für das **MFE Cup 4v4 Fußballturnier** bei München feiert Eid '26.

- **URL (geplant):** mfecup.muslimsconnect.de
- **Event:** 30. & 31. Mai 2026 · ab 14:00 Uhr · Riemer Park
- **Anmeldeschluss:** 27. Mai 2026
- **Limits:** Max. 16 Teams · 20 € Anmeldegebühr / Team
- **Alter:** Spieler ab 16 Jahre am Turniertag (keine Obergrenze)

## Stack

- Vite + React 19 + TypeScript + Tailwind v4
- Netlify Forms (form name: `cup-anmeldung`) + Resend für Benachrichtigungen
- Netlify Function: `netlify/functions/submission-created.mjs` → schickt E-Mail an events@muc-connect.de

## Lokale Entwicklung

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Production Build → dist/
```

## Deployment (Netlify)

1. Neue Netlify-Site mit diesem GitHub-Repo verknüpfen
2. Build: `npm run build`, Publish dir: `dist`
3. Environment Variable setzen: `RESEND_API_KEY` (vorhandener Key aus mfe-gastro-anmeldung wiederverwenden)
4. Custom Domain hinzufügen: `mfecup.muslimsconnect.de` (CNAME bei Cloudflare auf Netlify-URL setzen)
5. **WICHTIG:** Akismet Spam-Filter unter Forms → Settings → Form notifications deaktivieren

## Formular-Felder

| Schritt | Felder |
|---------|--------|
| 1 — Team | `teamname`, `kapitaen_name`, `kapitaen_telefon`, `kapitaen_email` |
| 2 — Spieler | `spieler1..4_name`, `spieler1..4_geburtsdatum` (Pflicht, ab 16 J.) · `spieler5..8` optional |
| 3 — Regelwerk | `regelwerk_bestaetigt` |
| 4 — Absenden | `ueberweisung_bestaetigt`, `unterschrift_name`, `digitale_bestaetigung` |

## Bankverbindung

- Empfänger: Muslimrat München e.V.
- IBAN: DE92 5023 4500 0436 8100 01
- Verwendungszweck: `MFE Cup 2026 — [Teamname]`
- Betrag: 20,00 €
