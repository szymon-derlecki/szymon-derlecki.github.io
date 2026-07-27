---
title: "Automatic Ship Detection in the Great Belt Bridge Area"
date: 2026-07-26
draft: false
description: "A YOLOv8n-based model for automatic ship detection and the creation of a dedicated dataset from the Great Belt region."
---

**Project Overview**

Working with computer vision in maritime environments is not a simple task. What started as a straightforward idea for data extraction ultimately evolved into a research publication and became the foundation for my master's thesis on autonomous systems and multi-sensor data fusion. This project ignited my deep involvement in open-source intelligence (OSINT) and coastal surveillance - areas where I am driven to create a real impact.

**Data and Challenges**

To build this solution, I wrote an automated script ([`storebaelt_cameras_acquistions.ipynb`](https://github.com/szymon-derlecki/OSINT_project/blob/master/Storebaelt_cameras_acquistions.ipynb)) to extract frames from publicly available surveillance cameras monitoring the Great Belt Strait. Capturing images every 10 seconds over several days in December and January meant dealing with tough, late-autumn and winter daytime conditions. After systematically annotating the images this collection became the **Danish Maritime Dataset (DMD)**.

The core architecture I chose for this project was **YOLOv8n**. As with any meaningful project, I encountered significant challenges early on. To push the model further and ensure its reliability, I experimented with various configurations and augmentations - such as color adjustments (e.g., brightness/HSV shifts) and geometric transformations (e.g., rotations) - where some of them are documented in my [`demo.ipynb`](https://github.com/szymon-derlecki/OSINT_project/blob/master/demo.ipynb) notebook.

Instead of taking an easy route, I have examined various training strategies. The model was initially pre-trained on large-scale maritime datasets (Singapore Maritime Dataset and SeaShips) and subsequently fine-tuned on a subset of our Danish camera feeds. To tackle the  risk of *data leakage* head-on, I implemented a strict temporal split: the model learned from frames captured on specific days and was tested on the ones from completely different days.

**Results**

By consistently pushing through these technical challenges, the model achieved a solid **mAP50 of 0.93** for the camera mounted on the East Pylon, and **0.85** for the sea-level camera on Sprogø.

However, this project highlighted how deeply atmospheric conditions impact computer vision algorithms. Winter weather, dense fog, and sharp sun glare reflecting off the water surface present significant decision-making hurdles for neural networks. A clear takeaway is that the ideal scenario would involve training the model across all seasons - either by collecting multi-month data or by engineering advanced synthetic augmentations to simulate diverse weather conditions.

**Future Work and Master's Thesis**

This project served as a crucial stepping stone for me. The dataset and the underlying analysis led to my first research publication, which soon I will have the opportunity to present at the IGARSS 2026 conference. 

Furthermore, both the trained model and the DMD dataset became key components of my master's thesis. I utilised them to build a comprehensive maritime traffic monitoring architecture based on multi-sensor data fusion - integrating camera detections with Automatic Identification Systems (AIS) and Distributed Acoustic Sensing (DAS).

**Project Resources:**
* Dataset available on Zenodo: [https://zenodo.org/records/18267483](https://zenodo.org/records/18267483)
* Full research paper: [IGARSS_Publication.pdf](https://szymon-derlecki.github.io/IGARSS_Publication.pdf/)

---

### Sample Classifications

![East Pylon Detection](/images/storebaelt_east_two_detections.jpg)
*View from the camera located on the East Pylon of the Storebaelt bridge.*

![Sprogø Detection](/images/sprogoe_detection.jpg)
*View from the camera located on the island of Sprogø.*