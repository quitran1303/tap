from flask import Flask, render_template, request
import json
import os
import pandas as pd
from flask_cors import CORS, cross_origin
from controller.classify import classify 
import os.path
from os import path
from ml_model.model import Model

APP_ROOT = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)
app.config["DEBUG"] = True
CORS(app, support_credentials=True)

images_target = os.path.join(APP_ROOT, 'images')

def create_image_dir():     
    if not path.exists(images_target):
        os.mkdir(images_target)

create_image_dir()

@app.route("/healthCheck", methods=["GET"])
def healthCheck():
    return json.dumps({"success": True}), 200, {"ContentType": "application/json"}


@app.route("/classify", methods=["POST"])
@cross_origin(supports_credentials=True)
def classifyAImage():
    app.logger.info(" Uploading an image...")
    
    payload = request.form.get("payload")
    
    parts = json.loads(payload)
    
    cuttingSize = request.form.get("cuttingSize")
    cuttingSize = int(cuttingSize) if isinstance(cuttingSize, int) else cuttingSize
    
    file = request.files.getlist("file")[0]
    
    result = classify(file, parts, cuttingSize, images_target)
    
    print(result)
    
    return json.dumps(result)

@app.route("/models")
@cross_origin(supports_credentials=True)
def models():
    app.logger.info("Get current models...")
    print(Model.getModelNames())
    return json.dumps(Model.getModelNames())
    
@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6789)
