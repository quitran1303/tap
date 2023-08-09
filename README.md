# TAP - Technical Application Project
# INTRODUCTION
**Client**
Fujian Medical University – Fujian Stomatological Hospital
Address: No 29, Xinquan Road, Gulou District 350001, Fuzhou City, Fuzhou, Fujian Province, China
Website: http://www.fjkqyy.com/english/HOME/ 

** Project topic background and motivations **
In the implant manufacturing market, there are many major dental implant manufacturers. Different implant products from many vendors need other applications and processes to operate and maintain. Due to many reasons, patients may be losing their medical records, transferring the hospitals, or moving living areas. The loss of medical records makes it impossible for doctors to read from paper; they have to figure out the brand of the implant through x-ray images.
This project aims to develop an automated assistant application (tool) to reshape implant branding using modern machine learning techniques.

# DESIGN
## High-level design
In the proposal of this project, we have proposed the high-level architecture as shown in the following diagram: 
![High level design](/images/1.png)

This design aims to bring trained models to end-users (dentists) as quickly as possible with a friendly graphical user interface (GUI). First, the models are introduced offline, then stored and loaded onto the application servers. Next, users can upload their new predicting image, cropping to select the ROIs. The cropped images will then be indicated with selected models, showing the user the result of these models with the class names and probability for these predictions. Google Colab is used for building the models with Python code, and Amazon Web Services is used as the deployment environment for the web server and database server. 

## Graphic User Interface Propose Designs & Implementation
### Proposal designs
#### Uploading the predicting image
Users click the upload button or drag files to the upload control to upload a new predicting file.

Design
![upload file](/images/2.png)

Implementation
![upload implementation](/images/3.png)

#### Cropping the image
Choose the cropping tool with a different size, crop for regions needing to be predicted, choose the implant regions' models, and click "Predict". User cans crop multiple implants and select different options for them, delete the pieces, and then do it again if seeing that piece is not trimmed correctly.

Design
![Design](/images/4.png)

Implementation
![Implementation](/images/5.png)

#### Predicting Results
On click "Predict", the application server will run the equivalent predictions like user choosing options, and the result will return with classes and probabilities for each type per model.

Design
![Design](/images/6.png)

Implemetation
![Implementation](/images/7.png)

![Implementation](/images/8.png)

## Dataset Description
The dental x-ray images are provided by Fujian Medical University - Fujian Stomatological Hospital in P.R. China. Three classes of dental implant manufacturers are the Bego, the Bicon, and the Straumann. The initially provided dataset has 850, 892, and 527 x-ray images before preprocessing for each group, respectively.
After processing, the collection of implant images is divided into groups as follows:
![Table](/images/9.png)

## Augmentation
There are multiple augmentation approaches applied to this dataset to increase the size of the dataset to a big enough size that can provide more accuracy in training the model.
![Aug](/images/10.png)

# Models research and implementation – Mask-RCNN, UNet with Multiple labels, VGG16
## Baseline Model 1 – Mask-R-CNN
As the diagram of Mask RCNN architect, the model contains two stages. In the 1st stage, the model will find out all the ROIs (Region of Interest) that can be represented for an object inside. The ROIs are then forwarded to stage 2nd to figure out the classes and boundary box and calculate the mask for the predicting thing. 

Mask RCNN architect
![Mask RCNN architect](/images/11.png)

Returning a prediction with both (predicting classes, boundary boxes for them, and their masks) is an advantage of Mask RCNN, which can support instant segmentation for the input picture. 
However, for annotating the images for the training of the Mask-RCNN model, we have used the VIA image annotator free tool. We can see that annotation time for all input files can take a long time, 2-3 minutes/image. In addition, the annotation for Mask-RCNN is stored as a JSON file containing the coordinates of the points in the images file. This way of storing annotation cause trouble when applying the augmentation approaches.
For this model, we have completed annotating 200 images (150 for training, 50 for testing), and the output result is quite promising, with around 70% accuracy. Still, we didn't go further with this model because of the considerable time just for annotation total. 
The following figure is an example of predicting the result:
![Result](/images/12.png)

## Baseline Model 2 – Unet
UNET Architect
![UNET Architect](/images/13.png)

In the first try, we converted the annotation from Mask RCNN to Unet mask files with background pixels having value '0' and the implants' pixel having the value '255'. The code for the first try has been implemented as implementing the UNET for the single label model, which is to answer "is there any implant in the providing picture?" instead of "which type of the implant is in the picture?". The problem was how we set the value for the implant's pixel.

The value '255' was set for the Straumann implant's pixel
![Image](/images/14.png)

The correct values are assigned to classes

![Image](/images/14.1.png) ![Image](/images/14.2.png)
![Image](/images/14.3.png) ![Image](/images/14.4.png)

In this step, we use ROI tool like (Fiji or Via) to make change the value of pixel to correct one.

After figuring out the mistake on the first try, we have converted all the annotations by some more code that converts a little differently for different types of labels, background with '0', Bego type with '1', Bicon type with '2', and Straumann type with '3'. 
Beginning with 200 images and equivalent 200 masks, which were transferred from the annotation file of Mask-RCNN, we have considered developing the code to do augmentation for the UNET model. This model does not get any difficulties when doing augmentation as Mask-RCNN because their files are images; any augmentation approaches applying to the images will be used to apply to their appropriated masks. This step gives us a more extensive dataset with 2000 images and 2000 masks.

## Implementation of Unet 
![Image](/images/15.png)
![Image](/images/15.1.png)
![Image](/images/15.2.png)

As the image of the model summary above, the UNET model is implemented quite complicated with both down path and up the path with multiple con2d, dropout, max-pooling, transpose, and concatenate similar to its architect. Therefore, the total trainable parameters for implementing this model are 1,940,868.
An example of predicting with the UNET model:

Example of predicting result with UNET Multiple Classes
![Image](/images/16.png)

Original VGG16 Architect
![Image](/images/17.png)

The original VGG16 model contains 13 Conv layers, five pooling after each stage and three dense layers on the fully connected just before the output layer. The big size of 3 dense layers leads to the VGG16 having many trainable params, up to 119,558,147 as the model described below. 

Original VGG16 Model Summary
![Images](/images/18.1.png)
![Images](/images/18.2.png)

On the first try with the original, the probabilities of predicting images are slow and usually around 33%. We found that this model's high number of trainable params has affected this low result. The implants are simple objects with some basic features like curves, straight lines, etc. They don't have any complex features like other objects like animals, vehicles, or buildings.  
So, four more derived models were developed based on the original one with some significant changes as follows:
![Models](/images/23.png)

And the result of the prediction for these models:
![Result](/images/24.png)

## New Model Methodology
This section will discuss the thinner VGG15 (deducted one layer and decreasing the neural nodes in the dense layer). This will be the suggested as the primary delivery of this project.

### Modified VGG16 Architect 
The thinner VGG15 Architect
![Modified VGG16](/images/19.png)

This model is a transferred learning model that uses the weight from the imagenet file; based on that, we will freeze all convolution layers and then change the Full-Connected layers. We have removed one dense (4096) and decreased another dense from 4096 to 1024. The last dense layer with softmax will be modified from 1000 (original labels of Imagenet) to 3. 
With these changes, the Thinned VGG15 has become more lightweight but still keeps the accuracy similar to its design.
Thinned VGG15 Implementation:
![Images](/images/20.1.png)
![Images](/images/20.2.png)

The new model has only 528,387 trainable params, 226 times less than the considerable number of the original VGG16 with 119,558,147 trainable params. The small trainable parameters of this model have been proved by the speed of training and the size of the weight file after training. 

Development Results
![Image](/images/25.png)

Accuracy Matrices for each Implant type
![Image](/images/26.png)

Training time and model sizes, and the best training and validating accuracies
![Image](/images/27.png)

Training and Validating Loss and Accuracy Trends
Mask RCNN
The training and validation accuracy and loss for Mask RCNN have not been developed yet.
Unet
For UNET, we can see the two diagrams of training and validation are 
![Image](/images/28.png)

Original VGG16 (model 1)
![Image](/images/29.png)

VGG16 – GAP (model 2)
![Image](/images/30.png)

Thinner VGG16 (model 4)
![Image](/images/31.png)

Confusion matrices for Models:
Because of limited time, we have not calculated the matrices for Mask-RCNN and Unet; the confusion matrices are computed for all VGG models:

Confusion Matrix for Model 5
![Image](/images/32.png)
![Image](/images/22.png)

# CONCLUSION
We have developed a new model (thinner VGG15) from the existing one, VGG16 and completed multiple experimental ways to increase its training speed, save the disk usage when generating the model file, and keep the appropriate predicting accuracy for a new model. As a result, the accuracy goal > 70% is completed, with the new model having 79% accuracy. 
In addition, other models like Mask RCNN, UNet and original VGG16 are also trained and tested to compare the results.
Last but not least, the optional part with a lightweight and friendly web application has also been implemented and used.

# Limits and Recommendations
There are some limits of this project that need to be solved in the near future:
-	The dataset used for this project has only three types of implants (Bego, Bicon, and Straumann). It's a small number of implant types. So, to bring this project to go-live with a production concept, we need a large dataset with more significant types of implants joining the training steps.
-	Compared to [1] and [2], the new model has not received a better result than theirs; it seems there are multiple windows for improving the training/validating and testing of the dataset. 

# References
[1] 	S. Sukegawa, K. Yoshii, T. Hara, T. Matsuyama, K. Yamashita, K. Nakano, K. Takabatake, H.
Kawai, H. Nagatsuka and Y. Furuki, "Multi-Task Deep Learning Model for Classification of
Dental Implant Brand and Treatment Stage Using Dental PanoramicImplant Brand and
Treatment Stage Using Dental Panoramic Radiograph Images," biomolecules, vol. 11, no.
6, 2021.
[2] 	J.-E. Kim, N.-E. Nam, J.-S. Shim, Y.-H. Jung, B.-H. Cho and J. J. Hwang, "Transfer Learning
via Deep Neural Networks for Implant Fixture System Classification Using Periapical
Radiographs," Journal of Clinical Medicine, vol. 9, no. 4, 2020.

# VIDEO
https://youtu.be/lH-rBGUS_MA 

# PUBLICATION
Publication at Frontier Magazine: https://www.frontiersin.org/articles/10.3389/fphar.2022.948283/full

# TEAM MEMBERS
Qui Tran Van 
Thi Hong Dang
Chanaka Nimantha Kaluarachchi 
Nikhitha Chintha
