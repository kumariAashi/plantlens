# Change Log

## Session - 2026-06-02

- Decision: start a new task requested by the user: fix missing plant descriptions on the result page by fetching short descriptions from Wikipedia.
- Changed `web/services/wikipedia.py`: added a Wikimedia `User-Agent` header for Wikipedia and Wikidata requests because Wikipedia returned HTTP 403 without it; added optional common-name fallback when the scientific-name summary has no usable extract.
- Changed `web/routes/identify.py`: now passes the PlantNet common name into `get_plant_details()` so Wikipedia lookup can fall back from scientific name to common name.
- Changed `web/app.py`: moved `load_dotenv()` before route imports so service modules can read `.env` values at import time, including API keys and optional `WIKIMEDIA_USER_AGENT`.
- Verified `get_plant_details("Psidium guajava", "Guava")` with network access; it now returns a Wikipedia description, thumbnail, and wiki URL.
- Verified Python syntax with `python -m compileall .` from `web/`; modules compiled successfully.
- Verified Flask startup import with `python -c "import app; print('app import ok')"` from `web/`.

## Session - 2026-05-18

- Created this `CHANGE_LOG.md` because no existing project continuity log was present at the project root.
- Decision: start a new task requested by the user: analyze the `web/` Flask app and write a college-presentation-ready explanation in `web/readme.md`.
- Verified source syntax with `python -m compileall .` from `web/`; Python modules compiled successfully.
- Finding: `web/app.py` calls `load_dotenv()` after importing route modules, while `web/services/plantnet.py` and `web/services/perenual.py` read API keys at import time. In a local run, both service key globals stayed unloaded from `.env`; this is documented as a current implementation issue in `web/readme.md`.
- Added `web/readme.md` with a full college-presentation-ready analysis of the web app: project purpose, architecture, file responsibilities, data flow, APIs, setup, deployment, security notes, limitations, future work, viva questions, and demo script.
- Reviewed `web/readme.md` for formatting and accuracy. Confirmed the file exists, contains no non-ASCII artifact matches from the review check, and covers the requested web folder analysis.

## SESSION SUMMARY

- Completed the user's request to make plant descriptions populate from Wikipedia.
- Fixed Wikipedia requests by adding a `User-Agent` header required by Wikimedia.
- Added common-name fallback in the description lookup so plants can still resolve when the scientific-name page is missing or empty.
- Fixed `.env` load order before route/service imports, which also resolves the previous PlantNet/Perenual API-key import-time issue.
- Verified the Guava lookup returns a short Wikipedia description for `Psidium guajava`.
- Verified Python source syntax with `python -m compileall .` from `web/`.
- Verified `app` imports successfully from `web/`.

## CURRENT STATE

- Result-page description data now comes from `web/services/wikipedia.py` with Wikimedia-compliant headers.
- `web/routes/identify.py` passes both scientific name and common name to Wikipedia enrichment.
- `web/app.py` now loads `.env` before importing route/service modules.
- `web/readme.md` remains available as the college-presentation-ready project explanation.
- Git status shows modified files: `CHANGE_LOG.md`, `web/app.py`, `web/routes/identify.py`, and `web/services/wikipedia.py`.
- Git status also shows two pre-existing untracked upload images in `web/static/uploads/`: `3901e1db-12b3-444b-9db7-1627c4dbba75.jpg` and `718841c0-cdb1-4301-9f30-2f2927863ff2.jpg`.

## OPEN TASKS

- Optional config improvement: set `WIKIMEDIA_USER_AGENT` in `.env` to a project-specific value with contact information for production use.
- Optional feature work: make alternative match selection functional on `templates/result.html`.
- Optional feature work: make history "View Details" open a real saved result page.
- Optional cleanup work: add automatic cleanup for old files in `web/static/uploads/`.
- Optional data work: expand `web/data/ayurveda_plants.json` beyond the current 44 entries.

## HANDOFF MESSAGE

Continue from: Plant descriptions were fixed. `web/services/wikipedia.py` now sends a Wikimedia `User-Agent` header and falls back from scientific name to common name; `web/routes/identify.py` passes the common name into that lookup. `web/app.py` now loads `.env` before route/service imports, fixing the previous import-time API-key issue. Verified `get_plant_details("Psidium guajava", "Guava")` returns a Wikipedia description, thumbnail, and URL. `python -m compileall .` and `python -c "import app; print('app import ok')"` passed from `web/`.
