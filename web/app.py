from flask import Flask, render_template
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
