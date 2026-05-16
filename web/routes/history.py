from flask import Blueprint, session, render_template, jsonify

history_bp = Blueprint("history", __name__)


@history_bp.route("/history")
def history():
    scans = session.get("history", [])
    return render_template("history.html", scans=scans)


@history_bp.route("/history/clear", methods=["POST"])
def clear_history():
    session.pop("history", None)
    session.modified = True
    return jsonify({"success": True})
