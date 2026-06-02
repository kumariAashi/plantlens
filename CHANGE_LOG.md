# Change Log

## Session - 2026-06-02

- Decision: start a new task requested by the user: fix missing plant descriptions on the result page by fetching short descriptions from Wikipedia.
- Changed `web/services/wikipedia.py`: added a Wikimedia `User-Agent` header for Wikipedia and Wikidata requests because Wikipedia returned HTTP 403 without it; added optional common-name fallback when the scientific-name summary has no usable extract.
- Changed `web/routes/identify.py`: now passes the PlantNet common name into `get_plant_details()` so Wikipedia lookup can fall back from scientific name to common name.
- Changed `web/app.py`: moved `load_dotenv()` before route imports so service modules can read `.env` values at import time, including API keys and optional `WIKIMEDIA_USER_AGENT`.
- Verified `get_plant_details("Psidium guajava", "Guava")` with network access; it now returns a Wikipedia description, thumbnail, and wiki URL.
- Verified Python syntax with `python -m compileall .` from `web/`; modules compiled successfully.
- Verified Flask startup import with `python -c "import app; print('app import ok')"` from `web/`.
- Decision: continue the same session with the user's new request to populate missing Ayurvedic properties and benefits.
- Changed `web/services/ayurveda.py`: improved name matching for local Ayurveda records and added a Wikipedia medicinal-use fallback when no local record exists.
- Changed `web/routes/identify.py`: now passes the PlantNet common name into `get_ayurvedic_info()` so the Ayurveda lookup can use both scientific and common names.
- Changed `web/templates/result.html`: displays the Ayurveda data source when fallback data comes from Wikipedia.
- Changed `web/services/ayurveda.py`: cleaned Wikipedia fallback sentences so section headings do not appear inside the benefits list.
- Changed `web/services/ayurveda.py`: allows fallback lookup when only a common name is available.
- Changed `web/services/ayurveda.py`: tightened fallback keyword matching so unrelated words such as `Spain` do not match medicinal keywords like `pain`.
- Changed `web/services/ayurveda.py`: narrowed Wikipedia fallback extraction to medicinal phrases and skipped adverse/non-benefit fragments.
- Changed `web/services/ayurveda.py`: if a direct Wikipedia page has no medicinal sentences, fallback now tries Wikipedia search before returning empty data.
- Changed `web/services/ayurveda.py`: cleaned up long fallback lines for readability without changing behavior.
- Verified curated local Ayurveda lookup with `get_ayurvedic_info("Psidium guajava", "Guava")`; it returns Guava properties and benefits from `web/data/ayurveda_plants.json`.
- Verified missing-local-record fallback with `get_ayurvedic_info("Lavandula angustifolia", "Lavender")`; it returns medicinal-use notes from Wikipedia instead of `{}`.
- Verified Python syntax with `python -m compileall .` from `web/`; modules compiled successfully.
- Verified Flask startup import with `python -c "import app; print('app import ok')"` from `web/`.
- Decision: help the user fix PowerShell virtual environment activation error.
- Created `web/venv` with `python -m venv venv` because no `web/venv` directory existed, so `.\venv\Scripts\Activate` could not be found.
- Installed `web/requirements.txt` into `web/venv` with `venv\Scripts\python.exe -m pip install -r requirements.txt` so Flask, requests, python-dotenv, Pillow, and Gunicorn are available inside the new environment.

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
- Completed the user's follow-up request to populate missing Ayurvedic properties and benefits.
- Ayurveda lookup now uses stronger local matching and falls back to Wikipedia medicinal-use text when a plant is not in the local Ayurveda JSON.
- Verified Guava still uses the curated local Ayurveda record, and Lavender receives Wikipedia fallback medicinal notes.
- Created a local virtual environment at `web/venv` for running the Flask app.
- Installed project dependencies into `web/venv`.

## CURRENT STATE

- Result-page description data now comes from `web/services/wikipedia.py` with Wikimedia-compliant headers.
- `web/routes/identify.py` passes both scientific name and common name to Wikipedia enrichment.
- `web/app.py` now loads `.env` before importing route/service modules.
- Result-page Ayurveda data now comes from `web/services/ayurveda.py` using local curated records first, then Wikipedia fallback medicinal-use notes.
- `web/templates/result.html` shows a source label when fallback Ayurveda data comes from Wikipedia.
- `web/readme.md` remains available as the college-presentation-ready project explanation.
- Git status shows modified files: `CHANGE_LOG.md`, `web/routes/identify.py`, `web/services/ayurveda.py`, and `web/templates/result.html`.
- Git status also shows one untracked upload image in `web/static/uploads/`: `4839d2c9-a2ac-4dc5-975a-b7e15a196ce0.jpg`.
- Flask is currently listening on port `5000`, so the app should be available at `http://127.0.0.1:5000`.
- `web/venv` now exists; activate it in PowerShell with `.\venv\Scripts\Activate.ps1`.
- `web/venv` has dependencies installed from `web/requirements.txt`.

## OPEN TASKS

- Optional config improvement: set `WIKIMEDIA_USER_AGENT` in `.env` to a project-specific value with contact information for production use.
- Optional data work: expand `web/data/ayurveda_plants.json` with more curated classical Ayurveda records so fewer plants need Wikipedia fallback.
- Optional feature work: make alternative match selection functional on `templates/result.html`.
- Optional feature work: make history "View Details" open a real saved result page.
- Optional cleanup work: add automatic cleanup for old files in `web/static/uploads/`.

## HANDOFF MESSAGE

Continue from: Plant descriptions and missing Ayurveda benefits were fixed. `web/services/wikipedia.py` sends a Wikimedia `User-Agent` header and falls back from scientific name to common name. `web/services/ayurveda.py` now checks local curated records with normalized scientific/common names, then fetches medicinal-use fallback notes from Wikipedia when local Ayurveda data is missing. `web/routes/identify.py` passes common names into both enrichment services, and `web/templates/result.html` shows a source label for Wikipedia fallback Ayurveda data. Verified Guava local Ayurveda data and Lavender Wikipedia fallback; `python -m compileall .` and `python -c "import app; print('app import ok')"` passed from `web/`. App is listening on `http://127.0.0.1:5000`.
Virtual environment note: `web/venv` has been created and dependencies from `web/requirements.txt` are installed. In PowerShell, activate it with `.\venv\Scripts\Activate.ps1`.
