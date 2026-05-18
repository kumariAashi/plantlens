# PlantLens Web

PlantLens Web is a Flask-based plant and Ayurvedic herb identification application. It lets a user upload a plant photo or capture one with the browser camera, sends the image to the PlantNet API for identification, enriches the result with Wikipedia, Wikidata, Perenual, and a local Ayurveda dataset, then displays a clean result page with plant names, confidence score, safety information, and traditional Ayurvedic properties.

This README explains the `web/` folder in detail so the project can be presented clearly in college.

## 1. Project Summary

| Item | Details |
| --- | --- |
| Project name | PlantLens Web |
| Main goal | Identify plants from images and show botanical plus Ayurvedic information |
| Backend | Python Flask |
| Frontend | Jinja2 HTML templates, TailwindCSS CDN, custom CSS, vanilla JavaScript |
| Main AI/API feature | Plant recognition through PlantNet API |
| Extra data sources | Wikipedia REST API, Wikidata SPARQL, Perenual API, local Ayurveda JSON |
| Storage | Flask signed session for recent scan history, uploaded images on local disk |
| Deployment target | Render using Gunicorn |

In simple words: the app works like a plant scanner. The user gives an image, the backend identifies the plant, gathers useful information, and shows the final result in a readable web page.

## 2. What Problem This Project Solves

Many people can see a plant but do not know its name, scientific classification, safety, or medicinal value. This project solves that by combining image-based identification with educational plant information.

The special focus is Ayurveda. Apart from general plant identification, the app tries to show traditional Ayurvedic details such as Sanskrit name, dosha effect, properties, benefits, and traditional use when that plant exists in the local dataset.

## 3. Main Features

- Upload a plant image from the device.
- Drag and drop an image onto the upload area.
- Capture a photo directly using the browser camera.
- Compress uploaded images before sending them to the identification API.
- Identify the plant using PlantNet.
- Show top 3 possible plant matches.
- Display confidence score as a percentage and progress bar.
- Fetch plant summary and Wikipedia link.
- Fetch local/regional names from Wikidata in Hindi, Tamil, Telugu, Marathi, and Sanskrit when available.
- Fetch toxicity information for humans and pets from Perenual.
- Show Ayurvedic properties from `data/ayurveda_plants.json`.
- Keep the last 20 scans in browser session history.
- Allow clearing scan history.
- Provide a Render deployment configuration.

## 4. Folder Structure

```text
web/
|-- app.py
|-- requirements.txt
|-- render.yaml
|-- plan.md
|-- .env
|-- .gitignore
|
|-- data/
|   |-- ayurveda_plants.json
|
|-- routes/
|   |-- identify.py
|   |-- history.py
|   |-- __init__.py
|
|-- services/
|   |-- plantnet.py
|   |-- wikipedia.py
|   |-- perenual.py
|   |-- ayurveda.py
|   |-- __init__.py
|
|-- static/
|   |-- css/
|   |   |-- style.css
|   |-- js/
|   |   |-- upload.js
|   |   |-- camera.js
|   |-- uploads/
|       |-- uploaded scan images
|
|-- templates/
|   |-- base.html
|   |-- index.html
|   |-- result.html
|   |-- history.html
|
|-- utils/
    |-- image_utils.py
    |-- __init__.py
```

## 5. High-Level Architecture

The app follows a simple Flask MVC-style structure:

- `app.py` creates and configures the Flask application.
- `routes/` contains URL endpoints and request handling logic.
- `services/` contains external API and data lookup logic.
- `utils/` contains reusable helper functions.
- `templates/` contains Jinja2 HTML pages.
- `static/` contains CSS, JavaScript, and uploaded images.
- `data/` contains the local Ayurvedic plant database.

Architecture flow:

```text
User browser
    |
    | Upload image or camera photo
    v
Flask route: POST /identify
    |
    | Save image to static/uploads
    | Compress image with Pillow
    v
PlantNet service
    |
    | Returns top plant matches
    v
Data enrichment services
    |
    |-- Wikipedia: description and link
    |-- Wikidata: local names
    |-- Perenual: toxicity
    |-- Local JSON: Ayurveda details
    v
result.html
    |
    | Shows image, plant name, confidence, safety, Ayurveda, other matches
    v
Session history
```

## 6. Request and Data Flow

### Step 1: User opens home page

The route `/` is defined in `app.py`.

```python
@app.route("/")
def index():
    return render_template("index.html")
```

It renders `templates/index.html`, which contains the upload form, drag-and-drop area, camera button, image preview, and identify button.

### Step 2: User selects or captures an image

There are two frontend scripts:

- `static/js/upload.js` handles file selection, drag-and-drop, preview, remove button, and loading state.
- `static/js/camera.js` uses the browser `navigator.mediaDevices.getUserMedia()` API to open the camera, capture a frame into a canvas, convert it into a JPEG file, and place it into the same file input used by normal uploads.

The browser camera works reliably on `localhost` during development or on HTTPS in production.

### Step 3: Form submits to `/identify`

The upload form posts to the Flask route in `routes/identify.py`.

```text
POST /identify
```

The route reads the uploaded file from:

```python
request.files.get("image")
```

If no file is present, it redirects back to the home page.

### Step 4: Image is saved and compressed

The image is saved under:

```text
web/static/uploads/
```

The filename is generated with `uuid.uuid4()` so uploads do not overwrite each other.

Then `utils/image_utils.py` compresses the image:

- Maximum image dimension becomes 800 pixels.
- Image is converted to RGB if needed.
- Final JPEG quality is 85.

This reduces file size and makes API upload faster.

### Step 5: PlantNet identifies the plant

`services/plantnet.py` sends the image to:

```text
https://my-api.plantnet.org/v2/identify/all
```

It requests 3 results using:

```python
params = {"api-key": PLANTNET_KEY, "nb-results": 3}
```

For each result, the app extracts:

- Common name
- Scientific name
- Family
- Confidence score

The confidence score is calculated by multiplying PlantNet score by 100.

### Step 6: Top result is enriched

If PlantNet returns at least one result, the first result is treated as the top match. Its scientific name is then passed to other services.

The enrichment process collects:

- Plant description and Wikipedia URL from Wikipedia.
- Local names from Wikidata.
- Toxicity flags from Perenual.
- Ayurvedic benefits from the local JSON file.

### Step 7: Scan is saved in history

The app saves a lightweight history object into Flask session:

```python
{
    "id": "...",
    "image": "...jpg",
    "common_name": "...",
    "scientific_name": "...",
    "confidence": 95.4
}
```

Only the latest 20 scans are kept:

```python
session["history"] = history[:20]
```

This is not a permanent database. It is session-based and useful for a simple demo.

### Step 8: Result page is rendered

`templates/result.html` displays:

- Uploaded image
- Common name
- Scientific name
- Confidence bar
- Local names
- Family
- Description
- Origin and habitat fallback text
- Toxicity badge
- Ayurvedic properties and benefits
- Other possible matches
- Scan another button

## 7. Backend File Explanation

### `app.py`

This is the main Flask entry point.

Responsibilities:

- Loads environment variables using `python-dotenv`.
- Creates the Flask app.
- Sets the secret key.
- Sets maximum upload size to 10 MB.
- Registers route blueprints.
- Defines the home page route.
- Runs the development server when executed directly.

Important lines:

```python
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024
```

This prevents very large uploads above 10 MB.

### `routes/identify.py`

This file contains the main plant scan route.

Route:

```text
POST /identify
```

Responsibilities:

- Receive uploaded image.
- Create upload folder if missing.
- Save image with a random UUID filename.
- Compress image.
- Call PlantNet.
- Get the top result.
- Fetch details from other services.
- Save scan summary in session history.
- Render `result.html`.

This is the most important backend file because it connects the user upload with all services.

### `routes/history.py`

This file handles scan history.

Routes:

```text
GET /history
POST /history/clear
```

Responsibilities:

- Read scan history from Flask session.
- Render `history.html`.
- Clear history and return JSON success.

The clear history route is called by JavaScript from the history page.

### `services/plantnet.py`

This is the PlantNet API wrapper.

Responsibilities:

- Read `PLANTNET_API_KEY`.
- Upload image to PlantNet.
- Parse returned plant matches.
- Convert API response into a simple list of dictionaries used by templates.

Output format:

```python
{
    "common_name": "Tulsi",
    "scientific_name": "Ocimum tenuiflorum",
    "family": "Lamiaceae",
    "confidence": 93.2
}
```

### `services/wikipedia.py`

This file has two functions.

`get_plant_details(scientific_name)`:

- Calls Wikipedia page summary API.
- Returns description, thumbnail, and Wikipedia URL.
- Description is trimmed to 500 characters.

`get_local_names(scientific_name)`:

- Calls Wikidata SPARQL endpoint.
- Searches by scientific name property.
- Tries to return local names in Hindi, Tamil, Telugu, Marathi, and Sanskrit.

### `services/perenual.py`

This file gets toxicity information from the Perenual API.

It returns:

```python
{
    "poisonous_to_humans": False,
    "poisonous_to_pets": False
}
```

If the API key is missing, no data is found, or the request fails, the app falls back to `False` for both values.

### `services/ayurveda.py`

This file loads `data/ayurveda_plants.json` into memory.

Function:

```python
get_ayurvedic_info(scientific_name)
```

Lookup strategy:

- First tries exact scientific name match.
- If no exact match exists, tries genus-level partial match.
- If still no match, returns an empty dictionary.

Example: if the scan returns a scientific name beginning with `Ocimum`, the service may match a stored `Ocimum ...` Ayurveda entry.

### `utils/image_utils.py`

This utility compresses images using Pillow.

Responsibilities:

- Open the uploaded image.
- Resize it using thumbnail logic.
- Convert transparent or palette images to RGB.
- Save it as JPEG at quality 85.

This improves performance and reduces external API upload size.

## 8. Frontend File Explanation

### `templates/base.html`

This is the shared page layout.

It contains:

- HTML document structure.
- TailwindCSS CDN.
- Google Fonts.
- Tailwind theme colors and fonts.
- Navbar.
- Main content block.
- Footer.
- Script block for page-specific JavaScript.

All pages extend this file.

### `templates/index.html`

This is the home page.

It contains:

- Hero heading.
- Upload form.
- Hidden file input.
- Drag-and-drop area.
- Image preview.
- Remove button.
- Camera button.
- Camera modal.
- Identify button.

The form submits to:

```text
/identify
```

### `templates/result.html`

This is the result page after a scan.

It handles two states:

- Results found.
- No confident result found.

When results exist, it shows the top match and enriched information. If more than one PlantNet result exists, it displays other possible matches in a collapsible section.

### `templates/history.html`

This page displays past scans from the current session.

It contains:

- Grid of scan cards.
- Uploaded image thumbnail.
- Common name and scientific name.
- Confidence badge.
- Clear history button.
- Empty state when no scans exist.

The current "View Details" button only shows an alert. It does not yet reopen a full saved result page.

### `static/js/upload.js`

This script improves the upload user experience.

It handles:

- Clicking the upload zone.
- Selecting a file.
- Dragging and dropping a file.
- Validating that the file is an image.
- Previewing the image.
- Removing the selected image.
- Disabling/enabling the identify button.
- Showing "Identifying..." and spinner during form submit.

### `static/js/camera.js`

This script handles browser camera capture.

It handles:

- Opening a camera modal.
- Requesting rear camera where supported.
- Capturing video frame to canvas.
- Converting canvas image to a JPEG file.
- Assigning the captured file to the form file input.
- Closing camera and stopping camera tracks.

### `static/css/style.css`

This file adds custom styling on top of Tailwind.

It includes:

- Smooth scrolling.
- Drag-over visual style for the upload zone.
- Custom scrollbar styling.
- Spinner animation.
- Image preview transition.
- Camera video object fit.

## 9. Local Ayurveda Dataset

File:

```text
data/ayurveda_plants.json
```

The dataset currently contains 44 plant entries.

Each entry is keyed by scientific name and may contain:

- `sanskrit_name`
- `local_name_hi`
- `dosha`
- `benefits`
- `properties`
- `traditional_use`

Example fields:

```json
{
  "sanskrit_name": "Tulasi",
  "dosha": "Balances Vata and Kapha",
  "benefits": [
    "Boosts immunity and fights infections",
    "Relieves respiratory issues"
  ],
  "properties": "Bitter, pungent taste; heating potency",
  "traditional_use": "Sacred plant in Hindu tradition"
}
```

This local dataset is important because there is no simple public API that gives reliable Ayurvedic medicinal details for every plant. Keeping it local makes the app faster, controlled, and suitable for academic demonstration.

## 10. External APIs Used

### PlantNet API

Purpose:

- Identify plant species from an uploaded image.

Used in:

```text
services/plantnet.py
```

Needs:

```text
PLANTNET_API_KEY
```

### Wikipedia REST API

Purpose:

- Get readable plant description.
- Get Wikipedia page URL.
- Get thumbnail URL if available.

Used in:

```text
services/wikipedia.py
```

No API key is needed.

### Wikidata SPARQL

Purpose:

- Search for local and regional plant names using scientific name.

Used in:

```text
services/wikipedia.py
```

No API key is needed.

### Perenual API

Purpose:

- Check if plant is poisonous to humans or pets.

Used in:

```text
services/perenual.py
```

Needs:

```text
PERENUAL_API_KEY
```

## 11. Environment Variables

The app expects a `.env` file inside `web/`.

Required variables:

```ini
PLANTNET_API_KEY=your_plantnet_api_key
PERENUAL_API_KEY=your_perenual_api_key
SECRET_KEY=your_secret_key
```

Meaning:

- `PLANTNET_API_KEY`: allows plant image identification.
- `PERENUAL_API_KEY`: allows toxicity lookup.
- `SECRET_KEY`: signs Flask session cookies.

The `.env` file should not be committed to Git because it contains secrets.

## 12. Dependencies

File:

```text
requirements.txt
```

Current dependencies:

```text
flask==3.0.3
python-dotenv==1.0.1
requests==2.31.0
pillow>=11.0.0
gunicorn==22.0.0
```

Purpose:

- Flask: web framework.
- python-dotenv: loads `.env` values locally.
- requests: calls external APIs.
- Pillow: image compression and format conversion.
- Gunicorn: production WSGI server for Render deployment.

## 13. How To Run Locally

From the project root:

```bash
cd web
```

Create and activate virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env`:

```ini
PLANTNET_API_KEY=your_plantnet_api_key
PERENUAL_API_KEY=your_perenual_api_key
SECRET_KEY=your_secret_key
```

Run:

```bash
python app.py
```

Open:

```text
http://localhost:5000
```

## 14. Deployment

The project includes Render configuration:

```text
render.yaml
```

Current Render settings:

```yaml
services:
  - type: web
    name: plantlens-web
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
```

Environment variables must be added in Render dashboard:

- `PLANTNET_API_KEY`
- `PERENUAL_API_KEY`
- `SECRET_KEY`

The production command is:

```bash
gunicorn app:app
```

## 15. Security and Privacy Notes

- API keys stay on the server side, not in frontend JavaScript.
- The app accepts uploads up to 10 MB.
- Uploaded images are stored in `static/uploads/`.
- Uploaded image files are not automatically deleted.
- Uploaded images can be served as static files if someone knows the generated filename.
- There is no login system.
- History is session-based and not a permanent database.
- This app is for educational and demonstration use, not professional medical or botanical diagnosis.

## 16. Current Implementation Notes and Limitations

These are useful points to mention honestly during presentation.

### 1. Environment loading issue

`app.py` currently imports route modules before calling `load_dotenv()`.

The service modules read environment variables at import time:

- `services/plantnet.py`
- `services/perenual.py`

Because of that, local `.env` values may not be loaded into `PLANTNET_KEY` and `PERENUAL_KEY` unless the variables are already available in the shell environment.

Expected fix:

- Move `load_dotenv()` before route imports in `app.py`, or
- Read `os.getenv()` inside each API function instead of at module import time.

### 2. API errors are hidden

The identify route catches some exceptions and continues silently. This prevents crashes, but it also means the user may only see "Unknown" instead of a helpful error message.

### 3. History is not permanent

History is stored in Flask session and uploaded images are stored on disk. There is no database. If the session changes or deployment storage resets, history can disappear.

### 4. Uploaded images are not cleaned up

The session only keeps the latest 20 scan records, but old image files may remain in `static/uploads/`.

### 5. Other match selection is not fully implemented

The result page shows other possible PlantNet matches, but the "Use this" button currently displays an alert instead of reloading details for that selected match.

### 6. History "View Details" is not fully implemented

The history cards show a "View Details" button, but it currently displays an alert. A future version could store full result data and open a dedicated result detail page.

### 7. Origin and habitat is fallback text

The result template has an "Origin & Habitat" card, but `get_plant_details()` does not currently return an `origin` field. So the app usually shows fallback text.

## 17. Strengths of the Project

- Clear separation between routes, services, templates, static files, and utilities.
- Multiple data sources are combined into one useful result.
- Server-side API calls protect secret API keys.
- Image compression improves performance.
- User interface supports both upload and camera workflows.
- Local Ayurveda dataset makes the project unique compared with normal plant identification apps.
- Render deployment config is already included.
- The code is small enough to explain clearly in a college presentation.

## 18. Future Improvements

- Fix environment variable loading order.
- Add user-facing error messages when APIs fail.
- Store scans and full result data in a database.
- Add login so users can keep scan history across devices.
- Add automatic cleanup for old uploaded images.
- Make "Use this" alternative match button fully functional.
- Make "View Details" in history open a real saved result.
- Cache Wikipedia/Wikidata/Perenual responses to reduce API calls.
- Expand Ayurveda dataset beyond 44 plants.
- Add Hindi or multilingual UI.
- Add disclaimer before showing medicinal benefits.
- Add confidence threshold warnings for low-confidence scans.

## 19. College Presentation Explanation

You can explain the project like this:

PlantLens Web is a Flask web application that identifies plants from images and gives Ayurvedic information. The user uploads a photo or captures one using the browser camera. The backend saves and compresses the image, then sends it to the PlantNet API. PlantNet returns the top possible plant matches with confidence scores.

After getting the top match, the app enriches it using other data sources. Wikipedia gives a short description, Wikidata gives local names, Perenual gives toxicity information, and a local JSON file gives Ayurvedic details like Sanskrit name, dosha effect, properties, benefits, and traditional usage.

The final result page shows the uploaded image, plant name, scientific name, family, confidence score, local names, safety information, Ayurvedic benefits, and other possible matches. The app also stores the latest scans in session history so the user can see recent identifications.

The main technical idea is integration: one image goes into the system, several services process it, and the final page combines all the information into a useful educational result.

## 20. Possible Viva Questions and Answers

### What framework is used?

Flask is used for the backend. Jinja2 templates, TailwindCSS, and vanilla JavaScript are used for the frontend.

### How does plant identification work?

The uploaded image is sent from Flask to the PlantNet API. PlantNet analyzes the image and returns possible species matches with confidence scores.

### Why is image compression used?

Compression reduces image size before sending it to the API. This improves upload speed and reduces processing time.

### Where is Ayurvedic information stored?

Ayurvedic information is stored locally in `data/ayurveda_plants.json`. The app looks up entries using scientific plant names.

### Is history permanent?

No. History is session-based. It is suitable for a demo, but a database would be needed for permanent storage.

### Are API keys exposed to users?

No. API keys are used only in the Flask backend and are stored in environment variables.

### What makes this different from a normal plant identification app?

The project adds Ayurvedic medicinal context, local Indian names, toxicity information, and educational plant details instead of only showing the plant name.

## 21. Quick Demo Script

1. Open the home page.
2. Upload or capture a clear plant image.
3. Click "Identify Plant".
4. Explain that Flask saves and compresses the image.
5. Explain that PlantNet identifies the plant.
6. Show the confidence score and scientific name.
7. Show local names, description, safety card, and Ayurvedic benefits.
8. Open the history page and show recent scans.
9. Mention current limitations and future improvements.

## 22. One-Line Project Description

PlantLens Web is a Flask application that identifies plants from images and combines plant recognition, regional names, toxicity, and Ayurvedic knowledge into one educational result page.
