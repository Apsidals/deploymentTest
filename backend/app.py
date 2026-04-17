from flask import Flask, jsonify, request
from flask_cors import CORS
import uuid
import os

app = Flask(__name__)
CORS(app)

VERSION = os.getenv("APP_VERSION", "1.0.0")

items = [
    {"id": str(uuid.uuid4()), "name": "Sample Item 1", "done": False},
    {"id": str(uuid.uuid4()), "name": "Sample Item 2", "done": True},
]


@app.route("/health")
def health():
    return jsonify({"status": "ok", "version": VERSION})


@app.route("/api/items", methods=["GET"])
def get_items():
    return jsonify(items)


@app.route("/api/items", methods=["POST"])
def create_item():
    data = request.get_json()
    if not data or not data.get("name", "").strip():
        return jsonify({"error": "name is required"}), 400
    item = {"id": str(uuid.uuid4()), "name": data["name"].strip(), "done": False}
    items.append(item)
    return jsonify(item), 201


@app.route("/api/items/<item_id>", methods=["PATCH"])
def toggle_item(item_id):
    item = next((i for i in items if i["id"] == item_id), None)
    if not item:
        return jsonify({"error": "not found"}), 404
    item["done"] = not item["done"]
    return jsonify(item)


@app.route("/api/items/<item_id>", methods=["DELETE"])
def delete_item(item_id):
    global items
    before = len(items)
    items = [i for i in items if i["id"] != item_id]
    if len(items) == before:
        return jsonify({"error": "not found"}), 404
    return "", 204


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
