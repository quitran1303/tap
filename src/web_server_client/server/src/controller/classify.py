from ml_model.model import Model
import cv2
import shutil
import cv2
import numpy as np
import joblib
import os
import skimage

def getAccuracy(bego, bicon, straumann, nothing):
    return {
        "nothing": nothing, 
        "bego": bego, 
        "bicon": bicon,
        "straumann": straumann,
    }
def classify(file, parts,cuttingSize,  images_target):
   
    filename = file.filename
    # read image file string data
    filestr = file.read()
    
    destination = "/".join((images_target, filename))
    
    #convert string data to numpy array
    npimg = np.fromstring(filestr, np.uint8)
    # convert numpy array to image
    imgDecoded = cv2.imdecode(npimg, cv2.COLOR_BGR2RGB)
    
    cuttingSize = cuttingSize if isinstance(cuttingSize, int) else 224
    
    # skimage
    skImage = skimage.io.imread(file)
    
    
    finalResult = {}
    MaskRCNNOutcome = None
    for part in parts:
        id = part["id"]
        
        if "predict" in part.keys():
            finalResult[id] = part["predict"]
            if MaskRCNN in part["predict"].keys():
               MaskRCNNOutcome =  part["predict"]["MaskRCNN"]    
            continue
        
        finalResult[id] = {}
        
        x1 = int(part["x"])
        x2 = x1 + cuttingSize
        y1 = int(part["y"])
        y2 = y1 + cuttingSize
        
        print("______________________________________________")
        print("id ", id, ", x[", x1, ",", x2, "],y[", y1, ",", y2, "]", filename, cuttingSize)
        print("______________________________________________")
        
        croppedImage = imgDecoded[x1: x2, y1: y2]
        im = cv2.resize(cv2.cvtColor(croppedImage, cv2.COLOR_BGR2RGB), (224, 224)).astype(np.float32) / 255.0
        im = np.expand_dims(im, axis =0) 
        
        # skImageCropped = skImage[x1: x2, y1: y2]
                
        modelList = Model.getModelNames()
        for modelName in modelList:
            model = Model(modelName)
            
            if MaskRCNNOutcome is not None and modelName == "MaskRCNN":
                finalResult[id][modelName] = MaskRCNNOutcome
                continue
            
            if modelName == "MaskRCNN":
                results = None
                results = model.predict(skImage)
                nothing = getAccuracy (0,0,0,100);
                if results is None:
                    finalResult[id][modelName] = nothing
                    continue
                result = results[0]
                if "class_ids" not in result.keys():
                    finalResult[id][modelName] = nothing
                    continue
                    
                class_ids = result['class_ids']
                scores = result['scores']
                if class_ids.size == 0: 
                    finalResult[id][modelName] = nothing
                    continue
                    
                max = 0
                for count in range(0,len(class_ids)):
                    if scores[count] >  scores[max]:
                        max = count
                print(class_ids[max], scores[max])
                maxScore = round(scores[max] *100,2)
                begoScore = maxScore if (class_ids[max] == 1) else 0
                biconScore = maxScore if (class_ids[max] == 2) else 0
                straumannScore = maxScore if (class_ids[max] == 3) else 0
                nothingScore = 100 - (begoScore + biconScore + straumannScore)
                MaskRCNNOutcome = getAccuracy(begoScore,biconScore,straumannScore,nothingScore)
            else:
                outcome = model.predict(im)
                begoScore = round(outcome[0][0] * 100, 2)
                biconScore = round(outcome[0][1] * 100, 2)
                straumannScore = round(outcome[0][2] * 100, 2)
                nothingScore = 0
                
            finalResult[id][modelName] = getAccuracy(begoScore,biconScore,straumannScore,nothingScore)
            
    return finalResult
    
    # The below code is for saving image which can be used in the next version
    # file.save(destination)

    # filename = destination

    # org = open(filename, 'rb')

    # base = os.path.basename(filename)

    # dir = os.path.dirname(filename)

    # filename_cp = os.path.splitext(base)[0]

    # filename_cp = "cp_"+filename_cp+os.path.splitext(base)[1]

    # destination2 = dir+"/"+filename_cp
    # file.save(destination2)

    # cpy = open (destination2, 'wb')
    # shutil.copyfileobj(org, cpy)