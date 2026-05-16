# 🌿 PlantLens Web — Python Flask App Plan

> A clean, modern web app built with **Flask (Python)** and **PlantNet API** — lets users upload or drag-drop a plant image and instantly get its local name, scientific details, toxicity info, and Ayurvedic benefits. Designed with a botanical minimal aesthetic.

---

## 📌 Project Overview

| Field | Details |
|---|---|
| **App Name** | PlantLens Web |
| **Backend** | Flask (Python 3.11+) |
| **Frontend** | Jinja2 templates + TailwindCSS + Vanilla JS |
| **Identification API** | PlantNet API (free tier) |
| **Details API** | Wikipedia API (free, no key) + Perenual API (free tier) |
| **Ayurvedic Data** | Wikipedia API + curated local JSON dataset |
| **Session Storage** | Flask session (scan history per browser session) |
| **Hosting** | Render (recommended free) or Railway |

---

## ⚠️ Hosting Reality Check

> You mentioned Cloudflare and Vercel — here's why Flask doesn't work there:

| Platform | Flask Support | Free Tier | Verdict |
|---|---|---|---|
| **Cloudflare Pages** | ❌ No Python runtime | Free | Not suitable |
| **Cloudflare Workers** | ⚠️ Python beta, very limited | Free | Too restrictive |
| **Vercel** | ⚠️ Serverless only, 10s timeout | Free | Risky for API calls |
| **Render** ✅ | Full Python/Flask support | Free (spins down) | **Best free choice** |
| **Railway** ✅ | Full Python/Flask support | $5 credit/month | **Best paid-free choice** |

**Recommendation: Deploy on Render (free tier)** — full Flask support, easy GitHub deploy, no cold-start issues for light traffic.

---

## 🎯 Core Features

1. **Drag & Drop / Click to Upload** — Image upload with preview
2. **Camera Capture** — Use browser `getUserMedia` API (desktop + mobile)
3. **Plant Identification** — Flask calls PlantNet API server-side
4. **Result Page** — Show:
   - Common name & scientific name
   - **Local / regional name** (Hindi + other Indian languages)
   - Confidence score with visual bar
   - Top 3 matches (user can pick)
   - **Plant details** (family, origin, habitat, description)
   - **Ayurvedic benefits** (medicinal uses, properties)
   - Toxicity badge (safe / toxic)
5. **Scan History** — Session-based, shown in sidebar or history page
6. **Responsive Design** — Works on mobile browser too

---

## 🗂️ Project Folder Structure

```
plantlens-web/
│
├── app.py                        # Flask app entry point
├── requirements.txt              # Python dependencies
├── .env                          # API keys (never commit)
├── .gitignore
├── render.yaml                   # Render deployment config
│
├── routes/
│   ├── __init__.py
│   ├── identify.py               # POST /identify — calls PlantNet
│   └── history.py                # GET /history — session history
│
├── services/
│   ├── plantnet.py               # PlantNet API wrapper
│   ├── wikipedia.py              # Wikipedia API — details + local names
│   ├── perenual.py               # Perenual — toxicity info
│   └── ayurveda.py               # Ayurvedic benefits lookup (local JSON + Wikipedia)
│
├── data/
│   └── ayurveda_plants.json      # Curated Ayurvedic benefits dataset
│
├── templates/
│   ├── base.html                 # Base layout (nav, footer)
│   ├── index.html                # Home — upload + camera
│   ├── result.html               # Plant detail result page
│   └── history.html              # Past scans this session
│
├── static/
│   ├── css/
│   │   └── style.css             # TailwindCSS + custom styles
│   ├── js/
│   │   ├── upload.js             # Drag-drop + file preview
│   │   └── camera.js             # Browser camera capture
│   └── images/
│       ├── logo.svg
│       └── placeholder.svg
│
└── utils/
    └── image_utils.py            # Image resize/compress before API call
```

---

## 🖥️ Page-by-Page Design

### Design System — Botanical Minimal

| Token | Value |
|---|---|
| **Font Display** | `Playfair Display` — elegant serif for headings |
| **Font Body** | `DM Sans` — clean, modern sans |
| **Primary** | `#1B4332` — Deep Forest Green |
| **Accent** | `#52B788` — Fresh Mint Green |
| **Surface** | `#FFFFFF` |
| **Background** | `#F8FAF8` — off-white with green tint |
| **Text** | `#1C1C1C` |
| **Muted Text** | `#6B7280` |
| **Toxic Badge** | `#DC2626` red |
| **Safe Badge** | `#16A34A` green |
| **Border Radius** | 16px cards, 8px buttons |
| **Shadow** | Soft: `0 2px 16px rgba(0,0,0,0.06)` |

---

### 1. Home Page (`/`) — `index.html`

**Sections:**
1. **Navbar** — Logo (leaf icon + "PlantLens"), nav links: Home | History
2. **Hero Section:**
   - Headline: *"Identify any plant. Instantly."* (Playfair Display, large)
   - Subtext: *"Upload a photo or use your camera — we'll handle the rest."*
3. **Upload Zone (center of page):**
   - Large dashed-border drop zone (300×300px min)
   - Icon: 🌿 leaf upload icon
   - Text: *"Drag & drop a photo, or click to browse"*
   - On hover: green border glow animation
   - Image preview replaces icon after file selected
4. **Camera Button** — Below upload zone: `"📷 Use Camera"` → triggers `getUserMedia`
5. **Identify Button** — Full-width green CTA: `"Identify Plant →"` (submits form)
6. **Footer** — Minimal: "Powered by PlantNet API"

---

### 2. Result Page (`/result`) — `result.html`

**Sections:**
1. **Navbar** (same as home)
2. **Two-column layout (desktop) / stacked (mobile):**

   **Left Column — Plant Image:**
   - Uploaded image, large, rounded card
   - Confidence bar below image (e.g., `94% match`)

   **Right Column — Plant Details:**
   - `titleLarge` — Common Name (e.g., *Tulsi*)
   - Italic — Scientific Name (*Ocimum tenuiflorum*)
   - 🏷️ **Local Name** — Hindi + regional name chip (e.g., "तुलसी · Tulashi · Thulasi")
   - Family tag chip (e.g., Lamiaceae)

3. **Info Cards Row (3 cards):**
   - 🌍 **Origin & Habitat** — e.g., "Native to Indian subcontinent, tropical regions"
   - 📖 **Description** — 2–3 sentence summary from Wikipedia
   - ⚠️ **Toxicity** — Red "Toxic to pets" / Green "Safe"

4. **Ayurvedic Benefits Section** — Highlighted green card:
   - 🌿 Section heading: *"Ayurvedic Properties & Benefits"*
   - Dosha effect chip (e.g., "Balances Vata · Kapha")
   - Bullet list of medicinal uses (e.g., immunity, digestion, fever)
   - Traditional Sanskrit name if available (e.g., *"Tulasi — Queen of Herbs"*)
   - Source note: *"Based on traditional Ayurvedic literature"*

5. **Other Matches Section** — Collapsible: shows top 3 alternatives from PlantNet
   - Each with name + confidence % + "Use this result" button

6. **Action Buttons:**
   - `"🔍 Scan Another"` → back to home
   - `"💾 Save to History"` → AJAX call saves to session

---

### 3. History Page (`/history`) — `history.html`

**Sections:**
1. **Navbar**
2. **Heading:** *"Your Plant Scans 🕘"*
3. **Card Grid** (3 columns desktop, 1 mobile):
   - Thumbnail image
   - Common name + scientific name
   - Confidence badge
   - Date/time
   - `"View Details"` button → result page
4. **Empty State:** *"No scans yet — go identify a plant! 🌱"*
5. **Clear History button** (bottom, muted style)

---

## 🔌 API Integration

### PlantNet API

```python
# services/plantnet.py
import requests
import os

PLANTNET_KEY = os.getenv("PLANTNET_API_KEY")
PLANTNET_URL = "https://my-api.plantnet.org/v2/identify/all"

def identify_plant(image_path: str) -> dict:
    with open(image_path, "rb") as f:
        files = [("images", (os.path.basename(image_path), f, "image/jpeg"))]
        params = {"api-key": PLANTNET_KEY, "nb-results": 3}
        response = requests.post(PLANTNET_URL, files=files, params=params)
        response.raise_for_status()
        data = response.json()

    results = []
    for r in data.get("results", []):
        results.append({
            "common_name": r["species"]["commonNames"][0] if r["species"]["commonNames"] else "Unknown",
            "scientific_name": r["species"]["scientificNameWithoutAuthor"],
            "family": r["species"]["family"]["scientificNameWithoutAuthor"],
            "confidence": round(r["score"] * 100, 1),
        })
    return results  # list of top 3 matches
```

### Wikipedia API (Local Names + Plant Details)

- **Endpoint:** `https://en.wikipedia.org/api/rest_v1/page/summary/{plant_name}`
- **Method:** GET — completely free, no key needed
- **Returns:** Description, extract, local names from Wikidata

```python
# services/wikipedia.py
import requests

def get_plant_details(scientific_name: str) -> dict:
    # Clean name for URL
    slug = scientific_name.replace(" ", "_")
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}"
    res = requests.get(url, timeout=5)

    if res.status_code != 200:
        return {}

    data = res.json()
    return {
        "description": data.get("extract", "")[:500],  # first 500 chars
        "thumbnail": data.get("thumbnail", {}).get("source", ""),
        "wiki_url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
    }

def get_local_names(scientific_name: str) -> dict:
    # Wikidata SPARQL for local/regional names
    query = f"""
    SELECT ?hindiName ?tamilName ?teluguName ?marathiName WHERE {{
      ?plant wikibase:label {{ bd:serviceParam wikibase:language "hi,ta,te,mr" }}
      ?plant wdt:P225 "{scientific_name}" .
      OPTIONAL {{ ?plant wdt:P1843 ?hindiName . FILTER(lang(?hindiName) = "hi") }}
      OPTIONAL {{ ?plant wdt:P1843 ?tamilName . FILTER(lang(?tamilName) = "ta") }}
    }}
    LIMIT 1
    """
    # Returns dict of regional names
    url = "https://query.wikidata.org/sparql"
    res = requests.get(url, params={"query": query, "format": "json"}, timeout=8)
    if res.status_code != 200:
        return {}
    bindings = res.json().get("results", {}).get("bindings", [])
    if not bindings:
        return {}
    row = bindings[0]
    return {
        "hindi": row.get("hindiName", {}).get("value", ""),
        "tamil": row.get("tamilName", {}).get("value", ""),
    }
```

---

### Ayurvedic Benefits (Local JSON + Wikipedia Fallback)

No dedicated public Ayurveda API exists — best approach is a **curated local JSON dataset** for the ~200 most common medicinal plants, with Wikipedia as a fallback for others.

```json
// data/ayurveda_plants.json (example entries)
{
  "Ocimum tenuiflorum": {
    "sanskrit_name": "Tulasi",
    "local_name_hi": "तुलसी",
    "dosha": "Balances Vata and Kapha",
    "benefits": [
      "Boosts immunity and fights infections",
      "Relieves respiratory issues (cold, cough, asthma)",
      "Reduces fever and inflammation",
      "Improves digestion and gut health",
      "Adaptogen — reduces stress and anxiety"
    ],
    "properties": "Bitter, pungent taste; heating potency (Ushna Virya)",
    "traditional_use": "Sacred plant in Hindu tradition; used in Ayurveda for 3000+ years"
  },
  "Azadirachta indica": {
    "sanskrit_name": "Nimba",
    "local_name_hi": "नीम",
    "dosha": "Pacifies Pitta and Kapha",
    "benefits": [
      "Powerful antibacterial and antifungal",
      "Purifies blood and detoxifies body",
      "Treats skin conditions (acne, eczema)",
      "Supports liver and digestive health",
      "Natural pesticide and wound healer"
    ],
    "properties": "Bitter taste; cooling potency (Sheeta Virya)",
    "traditional_use": "Known as 'village pharmacy' in India"
  }
}
```

```python
# services/ayurveda.py
import json, os

with open("data/ayurveda_plants.json") as f:
    AYURVEDA_DB = json.load(f)

def get_ayurvedic_info(scientific_name: str) -> dict:
    # Direct match
    if scientific_name in AYURVEDA_DB:
        return AYURVEDA_DB[scientific_name]

    # Partial match (genus level)
    genus = scientific_name.split()[0]
    for key, val in AYURVEDA_DB.items():
        if key.startswith(genus):
            return val

    return {}  # No ayurvedic data found — show "Not documented" on UI
```

---

### Perenual API (Toxicity only)

```python
# services/perenual.py
import requests, os

PERENUAL_KEY = os.getenv("PERENUAL_API_KEY")

def get_toxicity(scientific_name: str) -> dict:
    url = "https://perenual.com/api/v2/species-list"
    params = {"q": scientific_name, "key": PERENUAL_KEY}
    res = requests.get(url, params=params)
    data = res.json()

    if not data.get("data"):
        return {"poisonous_to_humans": False, "poisonous_to_pets": False}

    plant = data["data"][0]
    return {
        "poisonous_to_humans": plant.get("poisonous_to_humans", 0) == 1,
        "poisonous_to_pets": plant.get("poisonous_to_pets", 0) == 1,
    }
```

### Flask Route

```python
# routes/identify.py
from flask import Blueprint, request, session, redirect, url_for, render_template
from services.plantnet import identify_plant
from services.wikipedia import get_plant_details, get_local_names
from services.perenual import get_toxicity
from services.ayurveda import get_ayurvedic_info
from utils.image_utils import compress_image
import uuid, os

identify_bp = Blueprint("identify", __name__)

@identify_bp.route("/identify", methods=["POST"])
def identify():
    file = request.files.get("image")
    if not file:
        return redirect(url_for("main.index"))

    # Save + compress
    filename = f"{uuid.uuid4()}.jpg"
    path = os.path.join("static", "uploads", filename)
    file.save(path)
    compress_image(path)

    # Identify via PlantNet
    results = identify_plant(path)
    top = results[0] if results else None

    # Enrich with details
    details, local_names, toxicity, ayurveda = {}, {}, {}, {}
    if top:
        sci = top["scientific_name"]
        details    = get_plant_details(sci)
        local_names = get_local_names(sci)
        toxicity   = get_toxicity(sci)
        ayurveda   = get_ayurvedic_info(sci)

    # Save to session history
    history = session.get("history", [])
    history.insert(0, {
        "id": str(uuid.uuid4()),
        "image": filename,
        "common_name": top["common_name"] if top else "Unknown",
        "scientific_name": top["scientific_name"] if top else "",
        "confidence": top["confidence"] if top else 0,
    })
    session["history"] = history[:20]
    session.modified = True

    return render_template("result.html",
        results=results, details=details,
        local_names=local_names, toxicity=toxicity,
        ayurveda=ayurveda, image=filename
    )
```

---

## 🖼️ Image Utility

```python
# utils/image_utils.py
from PIL import Image
import os

def compress_image(path: str, max_size: int = 800):
    img = Image.open(path)
    img.thumbnail((max_size, max_size), Image.LANCZOS)
    img.save(path, "JPEG", quality=85)
```

---

## 📦 Dependencies

```txt
# requirements.txt
flask==3.0.3
python-dotenv==1.0.1
requests==2.31.0
pillow==10.3.0
gunicorn==22.0.0       # for production server on Render
```

---

## ⚙️ Flask App Setup

```python
# app.py
from flask import Flask
from routes.identify import identify_bp
from routes.history import history_bp
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key")
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB max upload

app.register_blueprint(identify_bp)
app.register_blueprint(history_bp)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
```

```ini
# .env
PLANTNET_API_KEY=your_plantnet_key_here
PERENUAL_API_KEY=your_perenual_key_here
SECRET_KEY=some_random_secret_string
```

---

## 🚀 Deployment — Render (Recommended Free)

### `render.yaml`
```yaml
services:
  - type: web
    name: plantlens-web
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
    envVars:
      - key: PLANTNET_API_KEY
        sync: false
      - key: PERENUAL_API_KEY
        sync: false
      - key: SECRET_KEY
        sync: false
```

### Deploy Steps
1. Push code to a **GitHub repo**
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Render auto-detects Python → add env vars in dashboard
5. Click Deploy → live URL in ~2 minutes ✅

> **Free tier note:** Render free apps spin down after 15 min of inactivity (cold start ~30s). Upgrade to $7/month for always-on.

---

## 🧱 Development Phases

### Phase 1 — Setup (Day 1)
- [ ] Create project folder, init git repo
- [ ] Set up Flask app + Blueprint routing
- [ ] Install dependencies, configure `.env`
- [ ] Create `base.html` layout with Tailwind CDN

### Phase 2 — Upload & Preview (Day 2)
- [ ] Build Home page with drag-drop upload zone
- [ ] Add JS file preview (show image before submit)
- [ ] Add browser camera capture via `getUserMedia`
- [ ] Handle file validation (type, size)

### Phase 3 — PlantNet Integration (Day 3)
- [ ] Build `plantnet.py` service
- [ ] Build `/identify` POST route
- [ ] Render basic Result page with name + confidence
- [ ] Handle API errors gracefully

### Phase 4 — Details, Local Names & Ayurveda (Day 4–5)
- [ ] Build `wikipedia.py` — fetch description + local names via Wikidata SPARQL
- [ ] Build `ayurveda.py` — lookup from `ayurveda_plants.json`
- [ ] Seed `ayurveda_plants.json` with 50–100 common Indian medicinal plants
- [ ] Update `perenual.py` to fetch toxicity only
- [ ] Add all new info sections to Result page

### Phase 5 — History (Day 5)
- [ ] Store scans in Flask session
- [ ] Build History page with card grid
- [ ] Add "Clear History" button

### Phase 6 — Polish & Deploy (Day 6–7)
- [ ] Finalize all CSS (fonts, colors, animations)
- [ ] Make fully responsive (mobile browser)
- [ ] Add loading spinner during API call (JS fetch)
- [ ] Push to GitHub → deploy on Render
- [ ] Test end-to-end on desktop + mobile

---

## ⚠️ Key Challenges & Solutions

| Challenge | Solution |
|---|---|
| Large image → slow API | `compress_image()` with Pillow before sending |
| PlantNet low confidence | Show top 3 results, let user pick correct one |
| Render cold starts (free) | Show friendly "waking up…" message on first load |
| Session history lost on refresh | Use `localStorage` JS fallback for persistence |
| CORS on camera access | HTTPS required — Render provides free SSL ✅ |
| `.env` keys not in git | `.gitignore` the `.env`, set vars in Render dashboard |
| No Ayurveda API exists | Curated local JSON for top 200 Indian plants + Wikipedia fallback |
| Wikidata SPARQL slow | Cache local name results in session by scientific name |
| Plant not in Ayurveda DB | Show "No Ayurvedic records found" gracefully |

---

## 🌱 Future Enhancements

- 🔐 **User auth** — Login with Google, persistent history across devices
- 🗃️ **Database** — PostgreSQL on Render for permanent history
- 🌍 **Multi-language** — Show plant names in Hindi/regional languages
- 📤 **Share result** — Generate shareable link for each scan
- 🧪 **Batch scan** — Upload multiple images at once

---

*Built with Flask + Python | UI: TailwindCSS (Botanical Minimal) | API: PlantNet + Wikipedia + Perenual | Ayurveda: Curated dataset | Hosting: Render*