# Change Log

## Session - 2026-05-18

- Created this `CHANGE_LOG.md` because no existing project continuity log was present at the project root.
- Decision: start a new task requested by the user: analyze the `web/` Flask app and write a college-presentation-ready explanation in `web/readme.md`.
- Verified source syntax with `python -m compileall .` from `web/`; Python modules compiled successfully.
- Finding: `web/app.py` calls `load_dotenv()` after importing route modules, while `web/services/plantnet.py` and `web/services/perenual.py` read API keys at import time. In a local run, both service key globals stayed unloaded from `.env`; this is documented as a current implementation issue in `web/readme.md`.
- Added `web/readme.md` with a full college-presentation-ready analysis of the web app: project purpose, architecture, file responsibilities, data flow, APIs, setup, deployment, security notes, limitations, future work, viva questions, and demo script.
- Reviewed `web/readme.md` for formatting and accuracy. Confirmed the file exists, contains no non-ASCII artifact matches from the review check, and covers the requested web folder analysis.

## SESSION SUMMARY

- Completed the user's request to analyze the `web/` folder.
- Created `web/readme.md` as a detailed explanation document for college presentation use.
- Verified Python source syntax with `python -m compileall .` from `web/`.
- Confirmed a current implementation issue where `.env` values are loaded too late for module-level API key globals in PlantNet and Perenual services.

## CURRENT STATE

- `web/readme.md` is complete and ready to use for explanation/presentation.
- `CHANGE_LOG.md` exists at the project root for future continuity.
- Git status shows two new untracked files: `CHANGE_LOG.md` and `web/readme.md`.
- No previous `CODEBASE_KNOWLEDGE.md` or `CHANGE_LOG.md` content was available to resume from.

## OPEN TASKS

- Optional code fix: move `load_dotenv()` before route imports in `web/app.py`, or read API keys inside service functions, so local `.env` keys load correctly.
- Optional feature work: make alternative match selection functional on `templates/result.html`.
- Optional feature work: make history "View Details" open a real saved result page.
- Optional cleanup work: add automatic cleanup for old files in `web/static/uploads/`.
- Optional data work: expand `web/data/ayurveda_plants.json` beyond the current 44 entries.

## HANDOFF MESSAGE

Continue from: `web/readme.md` has been created with a full analysis of the Flask web app for college presentation. Python syntax was verified with `python -m compileall .` from `web/`. Important known issue: `web/app.py` loads `.env` after importing routes, but `services/plantnet.py` and `services/perenual.py` read API keys at import time, so local `.env` API keys may not load into those globals. Next useful task is to fix that env-loading order if the user wants code changes.
