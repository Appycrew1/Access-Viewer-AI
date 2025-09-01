
# Pre‑Survey Add‑on — Full UI + API (Next.js + TS)

This repo contains the full UI and all API routes. Works in MOCK mode by default; add keys for LIVE.
- `OPENAI_API_KEY` (optional) — enables AI endpoints
- `OPENAI_MODEL` (optional) — default `gpt-4o-mini`
- `GOOGLE_API_KEY` (optional) — geocode/directions/streetview if you want live data

## Test endpoints
- /api/ping
- /api/areas
- /api/metrics?area_code=SW11
- /api/heatmap
- /api/sample_addresses
- /api/intake (POST)
- /api/property-image
- /api/route
- /api/parking
- /api/building
- /api/safety
- /api/weather
- /api/compliance
- /api/ai/analyse (POST), /api/ai/{duration|crew|quote|risk|message} (POST)

## Run
npm i
npm run dev
