import joblib
import json
import os
from keras.models import load_model
from .mrcnn import model as modellib
from .config.MaskRCNN import InferenceConfig as InferenceConfig

class Model:
    def __init__(self, model_name):
        self.name = model_name
        self.model = self.load_model()

    def predict(self, data):
        if self.name == "MaskRCNN":
            return self.model.detect([data], verbose=1)
        return self.model.predict(data)
    
    @staticmethod   
    def loadConfig():
        BASE_DIR = os.path.dirname(__file__)
        MODELS = open(os.path.join(BASE_DIR, "path.json"))
        return MODELS

    def load_model(self):
        BASE_DIR = os.path.dirname(__file__)
        MODELS = Model.loadConfig()
        fileName = json.load(MODELS)[self.name]
        filePath = os.path.join(BASE_DIR, fileName)
        
        if self.name == "MaskRCNN":
            inference_config = InferenceConfig()
            model = modellib.MaskRCNN(mode="inference",config=inference_config, model_dir=BASE_DIR)
            model.load_weights(filePath, by_name=True)
            return model
            
        return load_model(filePath)
    
    @staticmethod
    def getModelNames():
        MODELS = Model.loadConfig()
        return list(json.load(MODELS).keys())
