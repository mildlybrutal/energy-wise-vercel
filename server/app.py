from flask import Flask, request, jsonify
from model.generator import generate_tips
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Server is running"}), 200

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "OK"}), 200

@app.route("/suggestions", methods=["POST"])
def suggestions():
    data = request.get_json()
    units = data.get("unitsUsed")
    cost = data.get("perUnitCost")
    bill = data.get("totalBill")

    if not all([units, cost, bill]):
        return jsonify({"error": "Missing required values"}), 400

    try:
        # The generate_tips function now returns a formatted string with tips
        tips_text = generate_tips(units, cost, bill)

        # Parse the formatted tips into a list for the frontend
        tips_list = []
        for line in tips_text.split('\n'):
            # Remove the number prefix and any leading/trailing whitespace
            clean_line = line.strip()
            if clean_line:
                # Remove the number and dot prefix if present
                if clean_line[0].isdigit() and '. ' in clean_line:
                    clean_line = clean_line.split('. ', 1)[1]
                tips_list.append(clean_line)

        return jsonify({"suggestions": tips_list}), 200
    except Exception as e:
        return jsonify({"error": "Failed to generate suggestions", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)