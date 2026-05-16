import requests


def get_plant_details(scientific_name: str) -> dict:
    """Fetch summary and thumbnail from Wikipedia."""
    if not scientific_name:
        return {}

    slug = scientific_name.replace(" ", "_")
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{slug}"
    try:
        res = requests.get(url, timeout=5)
        if res.status_code != 200:
            return {}
        data = res.json()
        return {
            "description": data.get("extract", "")[:500],
            "thumbnail": data.get("thumbnail", {}).get("source", ""),
            "wiki_url": data.get("content_urls", {})
            .get("desktop", {})
            .get("page", ""),
        }
    except Exception:
        return {}


def get_local_names(scientific_name: str) -> dict:
    """Query Wikidata SPARQL for regional/local names of a plant."""
    if not scientific_name:
        return {}

    query = f"""
    SELECT ?hindiName ?tamilName ?teluguName ?marathiName ?sanskritName WHERE {{
      ?plant wdt:P225 "{scientific_name}" .
      OPTIONAL {{ ?plant wdt:P1843 ?hindiName . FILTER(lang(?hindiName) = "hi") }}
      OPTIONAL {{ ?plant wdt:P1843 ?tamilName . FILTER(lang(?tamilName) = "ta") }}
      OPTIONAL {{ ?plant wdt:P1843 ?teluguName . FILTER(lang(?teluguName) = "te") }}
      OPTIONAL {{ ?plant wdt:P1843 ?marathiName . FILTER(lang(?marathiName) = "mr") }}
      OPTIONAL {{ ?plant wdt:P1843 ?sanskritName . FILTER(lang(?sanskritName) = "sa") }}
    }}
    LIMIT 1
    """
    url = "https://query.wikidata.org/sparql"
    try:
        res = requests.get(
            url, params={"query": query, "format": "json"}, timeout=8
        )
        if res.status_code != 200:
            return {}
        bindings = res.json().get("results", {}).get("bindings", [])
        if not bindings:
            return {}
        row = bindings[0]
        return {
            "hindi": row.get("hindiName", {}).get("value", ""),
            "tamil": row.get("tamilName", {}).get("value", ""),
            "telugu": row.get("teluguName", {}).get("value", ""),
            "marathi": row.get("marathiName", {}).get("value", ""),
            "sanskrit": row.get("sanskritName", {}).get("value", ""),
        }
    except Exception:
        return {}
