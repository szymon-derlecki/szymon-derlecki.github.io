---
title: "Aircraft Detection in Sentinel-2 Satellite Images"
date: 2026-07-26
draft: false
description: "A deep learning computer vision pipeline designed to detect aircraft in optical satellite imagery from the Sentinel-2 mission. It uses YOLO architectures to tackle the unique challenges of small object detection in low-resolution, top-down Earth Observation data."
---

**Project Overview**

This project focuses on the automatic detection of aircraft silhouettes in Sentinel-2 satellite images using the YOLO (You Only Look Once) architecture. The main goal is to localize small objects in relatively low spatial resolution imagery (10 m/px), which is a classic small object detection problem in the Earth Observation domain. 

The system was developed as a passive, image-based alternative and a complementary solution to traditional tracking systems (such as ADS-B). This is particularly important in strategically sensitive areas, like the Baltic Sea region, where aircraft transponders are sometimes intentionally turned off (e.g., during illicit activities such as smuggling or human trafficking).

## Dataset and Challenges

The model was trained on **579 RGB images** from the Sentinel-2 satellite, and the results were validated using ADS-B metadata acquired for a specific day from the OpenSky Network database.

**The "Planebow" Effect**
A unique phenomenon observed in this dataset is the so-called "planebow" effect (a chromatic streak showing three slightly offset silhouettes of the same aircraft). This occurs because Sentinel-2 sensors capture red, green, and blue bands sequentially. For fast-moving objects—such as cruising aircraft or speeding cars on highways—this causes a visual separation of colors. This visual phenomenon ultimately proved to be a key feature for detecting aircraft.

## Model and Architecture

The **YOLOv8s** architecture was chosen for this specific problem. This approach was selected because the model has a straightforward, anchor-free design, processes predictions efficiently, and reliably detects small objects even on a standard gaming laptop.

**Training Parameters:**
*   **Input Size:** 640x640 pixels
*   **Epochs:** 50
*   **Batch Size:** 16
*   **Learning Rate:** 0.001
*   **Confidence Threshold:** 0.25
*   **IoU Threshold (NMS):** 0.45
*   **Augmentation:** A custom pipeline was implemented using the `Albumentations` library (horizontal flips, ±45° rotations, brightness adjustments). Aggressive image cropping was avoided to preserve the aforementioned "planebow" effect.

## Evaluation and Results

The evaluation was performed using a sliding window technique on full, large satellite scenes with a resolution of 7665x7791 pixels. 

*   **mAP@50 (Training):** ~98%
*   **Accuracy:** 56%
*   **Precision:** 62%
*   **Recall:** 83%
*   **F1-Score:** 71%

The high recall rate (83%) demonstrates that the detector successfully identifies the vast majority of aircraft. The moderate precision is due to false positives triggered by objects resembling aircraft silhouettes. These include football pitches, solar panels, bright roofs, and fast-moving cars, which generate similar chromatic streaks.

## Detection Examples

*Below are examples visualizing the model's predictions:*

### Correct Detection
A clear aircraft silhouette with a noticeable chromatic streak.

![Correct detection](/images/prawidlowa_detekcja.png)

### False Detection (False Positive)
An object on the ground mistakenly identified as an aircraft.

![False detection](/images/bledna_detekcja.png)

## Future Work
1.  **Dataset Expansion:** Incorporating more negative examples (e.g., pitches, highways) to significantly reduce false detections.
2.  **Instance Segmentation:** Applying models like Mask R-CNN or YOLACT to isolate the exact shape of the object rather than using standard bounding boxes.
3.  **Contextual Filtering:** Implementing rules to reject objects based on size or contextual background analysis (e.g., excluding detections in dense urban areas without cloud cover).

**Project Repository:** [GitHub - Individual-course-Aircraft-Detection-in-Sentinel-2-Satellite-Images-using-Deep-Learning-25](https://github.com/szymon-derlecki/Individual-course-Aircraft-Detection-in-Sentinel-2-Satellite-Images-using-Deep-Learning-25)