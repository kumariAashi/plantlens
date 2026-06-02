import json
import os
import re

import requests

_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "ayurveda_plants.json")
AYURVEDA_DB = {}
WIKIMEDIA_USER_AGENT = os.getenv(
    "WIKIMEDIA_USER_AGENT",
    "PlantLens/1.0 (educational plant identification app)",
)
WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php"
MEDICINAL_KEYWORDS = (
    "ayurveda",
    "ayurvedic",
    "traditional medicine",
    "medicinal",
    "medicine",
    "herbal medicine",
    "remedy",
    "folk medicine",
    "ethnomedicine",
    "anti-inflammatory",
    "antioxidant",
    "antimicrobial",
    "aromatherapy",
    "digestive",
    "fever",
    "wound",
    "cough",
    "diarrhea",
    "diabetes",
    "skin",
    "pain",
)

if os.path.exists(_DATA_PATH):
    with open(_DATA_PATH, "r", encoding="utf-8") as f:
        AYURVEDA_DB = json.load(f)


def _normalize_name(name: str) -> str:
    return re.sub(r"[^a-z0-9 ]+", " ", name.lower()).strip()


def _candidate_names(scientific_name: str, common_name: str = "") -> list:
    names = []
    for name in (scientific_name, common_name):
        if name and name not in names:
            names.append(name)
    return names


def _lookup_local_info(scientific_name: str, common_name: str = "") -> dict:
    candidates = [
        _normalize_name(name)
        for name in _candidate_names(scientific_name, common_name)
    ]

    for key, val in AYURVEDA_DB.items():
        normalized_key = _normalize_name(key)
        if any(candidate == normalized_key for candidate in candidates):
            return val

    for key, val in AYURVEDA_DB.items():
        normalized_key = _normalize_name(key)
        if any(candidate.startswith(normalized_key) for candidate in candidates):
            return val

    if scientific_name:
        genus = _normalize_name(scientific_name).split()[0]
        genus_matches = [
            val for key, val in AYURVEDA_DB.items()
            if _normalize_name(key).split()[0] == genus
        ]
        if len(genus_matches) == 1:
            return genus_matches[0]

    return {}


def _get_wikipedia_extract(name: str) -> tuple:
    if not name:
        return "", ""

    params = {
        "action": "query",
        "prop": "extracts",
        "explaintext": 1,
        "redirects": 1,
        "format": "json",
        "titles": name,
    }
    res = requests.get(
        WIKIPEDIA_API_URL,
        params=params,
        headers={"User-Agent": WIKIMEDIA_USER_AGENT},
        timeout=8,
    )
    if res.status_code != 200:
        return "", ""

    pages = res.json().get("query", {}).get("pages", {})
    for page in pages.values():
        if page.get("missing"):
            continue
        return page.get("extract", ""), page.get("title", "")

    return "", ""


def _search_wikipedia_title(name: str) -> str:
    params = {
        "action": "query",
        "list": "search",
        "srsearch": f"{name} Ayurveda medicinal uses plant",
        "format": "json",
        "srlimit": 1,
    }
    res = requests.get(
        WIKIPEDIA_API_URL,
        params=params,
        headers={"User-Agent": WIKIMEDIA_USER_AGENT},
        timeout=8,
    )
    if res.status_code != 200:
        return ""

    results = res.json().get("query", {}).get("search", [])
    return results[0].get("title", "") if results else ""


def _clean_sentence(sentence: str) -> str:
    sentence = re.sub(r"\[[^\]]+\]", "", sentence)
    sentence = re.sub(r"=+\s*[^=]+\s*=+", "", sentence)
    sentence = re.sub(r"\s+", " ", sentence).strip()
    return sentence[:220].rstrip()


def _has_medicinal_keyword(sentence: str) -> bool:
    lowered = sentence.lower()
    for keyword in MEDICINAL_KEYWORDS:
        if " " in keyword:
            if keyword in lowered:
                return True
            continue
        if re.search(rf"\b{re.escape(keyword)}\b", lowered):
            return True
    return False


def _is_useful_sentence(sentence: str) -> bool:
    lowered = sentence.lower()
    if len(sentence) < 40:
        return False
    if any(
        term in lowered
        for term in (
            "imprecisely applied",
            "regarded as a weed",
            "previously, it was known",
            "contact dermatitis",
            "allergic",
            "adverse",
        )
    ):
        return False
    return True


def _extract_medicinal_sentences(extract: str) -> list:
    sentences = re.split(r"(?<=[.!?])\s+", extract)
    benefits = []
    for sentence in sentences:
        if _has_medicinal_keyword(sentence):
            cleaned = _clean_sentence(sentence)
            if cleaned and _is_useful_sentence(cleaned) and cleaned not in benefits:
                benefits.append(cleaned)
        if len(benefits) == 5:
            break
    return benefits


def _fetch_wikipedia_medicinal_info(scientific_name: str, common_name: str = "") -> dict:
    for name in _candidate_names(scientific_name, common_name):
        extract, title = _get_wikipedia_extract(name)
        if not extract:
            title = _search_wikipedia_title(name)
            extract, title = _get_wikipedia_extract(title)

        benefits = _extract_medicinal_sentences(extract)
        if not benefits:
            title = _search_wikipedia_title(name)
            extract, title = _get_wikipedia_extract(title)
            benefits = _extract_medicinal_sentences(extract)

        if benefits:
            return {
                "sanskrit_name": "",
                "dosha": "",
                "properties": (
                    "Medicinal-use notes from Wikipedia. Classical Ayurvedic "
                    "rasa, virya, and dosha data was not found in the local database."
                ),
                "benefits": benefits,
                "traditional_use": (
                    f"Fallback source: Wikipedia page '{title}'. "
                    "Verify before medicinal use."
                ),
                "source": "Wikipedia fallback",
            }

    return {}


def get_ayurvedic_info(scientific_name: str, common_name: str = "") -> dict:
    """Look up Ayurvedic info locally, then fetch a Wikipedia medicinal fallback."""
    if not scientific_name and not common_name:
        return {}

    local_info = _lookup_local_info(scientific_name, common_name)
    if local_info:
        return local_info

    try:
        return _fetch_wikipedia_medicinal_info(scientific_name, common_name)
    except Exception:
        return {}
