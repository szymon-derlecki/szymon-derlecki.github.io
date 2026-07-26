---
title: "Military Aircraft Classification"
date: 2026-07-25
draft: false
description: "A machine learning model for detecting 46 classes of military aircraft."
---

**Project Overview**

This was one of my first major projects, serving as a crucial stepping stone during my application to DTU. It ignited my deep involvement in machine learning, particularly in defence and military applications - an area where I have always been driven to create a real impact.

**Data and Challenges**

To build this solution, I utilised the open-source ["Military Aircraft Detection Dataset"](https://www.kaggle.com/datasets/a2015003713/militaryaircraftdetectiondataset/data). Knowing that real-world problems require robust data, I expanded this dataset with my own photographs taken at various airshows across Poland and Europe over the last 15 years (full album available [here](https://www.flickr.com/photos/160419049@N02/albums/)). A portion of these photos ultimately served as my test data.

The model was trained to recognise **46** distinct aircraft classes, including the **F-4, F-16, F-22 Raptor, Tornado, JAS-39 Gripen, and EF-2000**.

As with any meaningful project, I encountered significant challenges early on. Exploratory data analysis revealed a heavily imbalanced class distribution. Instead of taking the easy route and reducing the majority classes, I tackled the problem head-on through oversampling during the training phase preparation. Artificially balancing the dataset allowed the core architecture, **EfficientNetV2B1**, to learn the unique characteristics of each aircraft equally. 

To push the model further and tailor it to my exact needs, I engineered a custom classification block utilising `GlobalMaxPooling2D`, `BatchNormalization`, `Dropout`, and `Dense` layers. This prevented the model from favouring the most frequent aircraft and reinforced regularisation, effectively mitigating the risk of overfitting.

**Results**

By consistently pushing through these technical hurdles, this approach delivered a solid accuracy of approximately **85%** on the test set.

[View the complete project code in my GitHub repository](https://github.com/szymon-derlecki/Bachelor_Thesis/blob/main/Bachelor_Thesis_Project.ipynb)

---

### Sample Classifications

![EF-2000 Detection](/images/f-16_detection.png)
![F-35 Detection](/images/f-18_detection.png)
![A-400M Detection](/images/typhoon_detection.png)

<details>
<summary><b>Click here to see what aircraft are supported (46 types)</b></summary>
<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; margin: 12px 0;">
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">A-10</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">A-400M</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">AG-600</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">AV-8B</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">B-1</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">B-2</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">B-52</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Be-200</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">C-2</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">C-5</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">C-17</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">C-130</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">E-2</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">E-7</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">EF-2000</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">F-4</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">F-14</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">F-15</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">F-16</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">F-117</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">F-18</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">F-22</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">F-35</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">J-10</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">J-20</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">JAS-39</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">KC-135</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">MiG-31</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Mirage 2000</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">MQ-9</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">P-3</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Rafale</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">RQ-4</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">SR-71</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Su-25</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Su-34</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Su-57</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Tornado</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Tu-95</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Tu-160</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">U-2</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">US-2</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">V-22</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">Vulcan</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">XB-70</span>
  <span style="border: 1px solid #666; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; text-align: center;">YF-23</span>
</div>
</details>