from services.plantnet import identify_plant
from services.wikipedia import get_plant_details, get_local_names
from services.perenual import get_toxicity
from services.ayurveda import get_ayurvedic_info
from utils.image_utils import compress_image
from flask import Blueprint, request, session, redirect, url_for, render_template, current_app
import uuid
import os

identify_bp = Blueprint("identify", __name__)


@identify_bp.route("/identify", methods=["POST"])
def identify():
    file = request.files.get("image")
    if not file:
        return redirect(url_for("index"))

    # Ensure uploads directory exists
    upload_dir = os.path.join(current_app.root_path, "static", "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    # Save + compress
    filename = f"{uuid.uuid4()}.jpg"
    path = os.path.join(upload_dir, filename)
    file.save(path)
    try:
        compress_image(path)
    except Exception:
        pass  # Continue even if compression fails

    # Identify via PlantNet
    results = []
    try:
        results = identify_plant(path)
    except Exception:
        pass

    top = results[0] if results else None

    # Enrich with details
    details, local_names, toxicity, ayurveda = {}, {}, {}, {}
    if top:
        sci = top["scientific_name"]
        details = get_plant_details(sci, top.get("common_name", ""))
        local_names = get_local_names(sci)
        toxicity = get_toxicity(sci)
        ayurveda = get_ayurvedic_info(sci)

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

    return render_template(
        "result.html",
        results=results,
        details=details,
        local_names=local_names,
        toxicity=toxicity,
        ayurveda=ayurveda,
        image=filename,
    )
