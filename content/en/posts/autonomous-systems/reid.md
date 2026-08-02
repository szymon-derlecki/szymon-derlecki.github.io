---
title: "Radarless Ship Tracking: How Underwater Fiber Optics and Ordinary Cameras Help Combat the Shadow Fleet"
date: 2026-08-02
draft: false
description: "My Master's thesis at DTU. I demonstrate how to use data from underwater fiber optic cables (DAS), bridge-mounted cameras, and the AIS system to effectively track ships without missing a beat, even when they vanish from the radar."
---

The phenomenon of the "shadow fleet"—ships intentionally turning off their AIS transponders to disappear from radars—is a growing challenge for maritime security. When a vessel turns off its AIS, traditional surveillance systems lose sight of it. How can we maintain continuous tracking in such situations? The answer might lie in multimodal sensor data fusion.

The heart of such a system is the **re-identification (Re-ID)** mechanism. Simply put, it is the algorithm's ability to answer the question: *"Is this image patch or signal I am seeing right now the exact same object that passed by another camera a moment ago?"*.

Because this project was highly complex, I decided to divide its description into three distinct stages, each representing a separate step in building an advanced maritime tracking system:

1. **Stage 1: Single-Camera Visual Re-Identification (Single-Camera Re-ID)**
The first part focuses on tracking the same ship exclusively in frames originating from a single, specific video source. The algorithm's task is to recognize a specific vessel, ignoring external disturbances such as changing weather conditions. Here, we analyze the data collected by each camera individually.

2. **Stage 2: Acoustic Re-Identification using DAS (Distributed Acoustic Sensing) Cable**
The second part takes a completely different direction and is a highly experimental stage of the project. Here, we identify ships based on vibrational and acoustic data. These signals are recorded by an underwater fiber optic cable running along the bottom of the strait, naturally acting as a massive sensor covering a vast area of the maritime corridor.

3. **Stage 3: Cross-Camera Re-Identification (Cross-Camera Re-ID)**
The final part presents an architecture designed to handle mutual ship identification across frames from different sources—this time working "crosswise". We evaluate whether the program can pair the same vessel viewed from two drastically different perspectives.

## Stage 1. Single-Camera Visual Re-Identification

In this part of the project, I compared two completely different neural network architectures to see if the choice of approach makes a significant difference here.

The first is ResNet34—a classic Convolutional Neural Network (CNN). It analyzes the image locally, "sliding" over it with a small filter window (e.g., 3x3 or 7x7 px) and building context layer by layer. The second variant is DINOv2, a Vision Transformer (ViT) architecture. In this case, the image is divided into smaller patches, which the network processing in parallel, instantly comparing each fragment with every other fragment using a global attention mechanism.

I based the training process on a *supervised contrastive loss* method, so the algorithm needed precise labels. I used data from the AIS system (the maritime equivalent of Flightradar24) for this purpose. Of course, mapping AIS logs to images is rarely absolutely flawless (e.g., when ships overlap in the frame), which is why I applied spatial filters and manual verification to reliably annotate the dataset.

Our visual dataset covered the period from December 2025 to January 2026. We collected a total of **2,842 frames for 50 unique ship identities**. Let's define our two image sources right away:
- **Camera A (Sprogø):** placed on a small island, low and close to the water level.
- **Camera B (Camera East):** placed high up on the eastern bridge pylon, offering a top-down perspective.

While building the training set for a single camera, I subjected each baseline ship image to augmentations (including horizontal flipping and brightness modifications). From one shot, I created an artificial pair, forcing the network to learn the ship's features regardless of the direction it was sailing.

### Examples of Training Pairs (Single-Camera Re-ID)

Below is a visualization of the pair creation process. An artificial pair was generated from each base shot using a horizontal mirror reflection.

**View 1: Sprogø Camera**

<table>
<tr>
<th>Original shot</th>
<th>Modified shot</th>
</tr>
<tr>
<td>
<img src="/images/single_cam_cam2.jpg" width="400"/>
</td>
<td>
<img src="/images/single_cam_cam2.jpg" width="400" style="transform: scaleX(-1);"/>
</td>
</tr>
</table>

**View 2: Camera East (pylon)**

<table>
<tr>
<th>Original shot</th>
<th>Modified shot</th>
</tr>
<tr>
<td>
<img src="/images/single_cam_cam1.jpg" width="400"/>
</td>
<td>
<img src="/images/single_cam_cam1.jpg" width="400" style="transform: scaleX(-1);"/>
</td>
</tr>
</table>

After 80 training epochs, I achieved satisfactory results. Before moving on to the tables, here is a quick explanation of the metrics. **Top-1** indicates the percentage of situations where the algorithm provided the correct result instantly in the first place. **Top-5** is the percentage of situations where the correct ship was in the top five. Finally, **mAP** (mean Average Precision) evaluates the overall quality of the ranking generated by the model.

### Evaluation Results: Single-Camera Re-Identification

**Table 1: Results for ResNet34 Architecture**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Training Data | Evaluation Data | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 72.85 | 91.86 | 41.44 |
| **V2:** Camera East | Camera East | 87.76 | 96.94 | 47.13 |
| **V3:** Sprogø + Camera East| Sprogø | 68.78 | 90.05 | 33.01 |
| **V3:** Sprogø + Camera East | Camera East | 80.10 | 92.86 | 50.43 |

</div>

<br>

**Table 2: Results for DINOv2 Architecture**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Training Data | Evaluation Data | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 75.57 | 93.21 | 44.81 |
| **V2:** Camera East | Camera East | 86.73 | 96.43 | 53.46 |
| **V3:** Sprogø + Camera East| Sprogø | 71.95 | 92.76 | 43.75 |
| **V3:** Sprogø + Camera East | Camera East | 82.65 | 93.88 | 51.14 |

</div>

A very specific conclusion can be drawn from the tables: the camera mounted higher up on the pylon (Camera East) outperforms Sprogø by almost 15 percentage points. This is a direct result of fewer obstructing waves and a better perspective. It is also worth noting that combined training (V3) worsened the results for evaluation on both cameras—the network simply got lost trying to generalize two drastically different visual environments in a single approach.

### Visual Frame Comparison and Match Matrices

Below, I've included the match matrices. Let's treat this more as a visual *sanity check* (an illustration that the model actually sees differences) rather than definitive proof.

<div style="display: flex; gap: 20px; justify-content: center;">
<img src="/images/1763804942_220466000.jpg" alt="Shot 1 - Target at T=0s" width="700"/>
<img src="/images/1763804912_220466000.jpg" alt="Shot 2 - Target at T+70s" width="700"/>
</div>

<br>

**Shot 3 (Different vessel)**

<div style="text-align: center;">
<img src="/images/1763820365_255806370.jpg" alt="Shot 3 - Different vessel" width="900"/>
</div>

*Photos of the target vessel and an additional ship used for comparison.*

<br>

**Cosine Similarity Matrix (Three Vessels)**

<div style="text-align: center;">
<img src="/images/similarity_matrix_same_and_different.png" alt="Similarity matrix for three vessels" width="900"/>
</div>

---

#### Comparison of Two Different Ships from Two Different Days

To evaluate the model's robustness to varying environmental conditions, two distinct vessels recorded on completely different days were compared.

<div style="display: flex; gap: 20px; justify-content: center;">
<img src="/images/1765715109_305425000.jpg" alt="Vessel 305425000" width="700"/>
<img src="/images/1765721252_265079640.jpg" alt="Vessel 265079640" width="700"/>
</div>

<br>

**Cosine Similarity Matrix (Different Days)**

<div style="text-align: center;">
<img src="/images/sim_matrix_different_days.png" alt="Similarity matrix for different days" width="900"/>
</div>

---

## Stage 2. Acoustic Re-Identification using DAS Underwater Fiber Optic Cable

The second part differs fundamentally in terms of hardware. The cable running along the bottom of the strait acts as a massive acoustic sensor here. The advantage is that weather conditions do not affect it the same way they affect a camera, and physically damaging it on the seabed is incredibly difficult.

To preserve as much crucial acoustic data as possible (sound underwater waves and travels), I split the signal into 5 segments, adopting a 250-meter margin on each side from the center of the ship. The scale of this prototype dataset amounted to **545 samples for 22 unique ship identities**. It must be remembered that with such a narrow pool of test ships, the Top-5 metric will naturally be very high (because the selection of potential "mistakes" is small).

I tested raw spatiotemporal data (*waterfall* plots) and frequency spectrograms (STFT).

### Acoustic Signal Analysis (DAS)

| STFT Spectrogram | Data in 'WATERFALL' plot format |
| :---: | :---: |
| <img src="/images/Ship_FFT.png" width="400"/> | <img src="/images/Ship_NO_FFT.png" width="400"/> |

*For the waterfall plot, the horizontal axis represents the position along the cable, and the vertical axis represents time. The STFT spectrogram shows the distribution of frequencies over time.*

### Acoustic Identification Results (DAS)

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architecture | Data Type | mAP (%) | Top-1 (%) | Top-5 (%) |
| :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Waterfall | 27.37 | 22.50 | 65.00 |
| ResNet34 | Spectrogram | 29.43 | 35.00 | 70.00 |
| ResNet34 | Waterfall + Spectrogram | 27.55 | 22.50 | 75.00 |
| DINOv2 | Waterfall | 34.03 | 47.50 | 95.00 |
| DINOv2 | Spectrogram | 33.44 | 30.00 | 70.00 |
| DINOv2 | Waterfall + Spectrogram | 34.17 | 30.00 | 85.00 |

</div>

The DINOv2 architecture on the combined raw signal and spectrogram generally performed the best, even if the mAP metric indicates otherwise in some cases. It turned out that relying solely on spectrograms can be tricky—ships of similar construction generate very similar frequencies, leading to "spectral overlapping". Only the raw spatial signal highlighted the unique way noise radiates in the water, which is precisely why the mAP metric results in the table were the best here.

**Similarity Matrix for Dual-Channel Model (Dual)**
<br>
<img src="/images/matrix_result_dual_temporal_2.png" alt="Dual Matrix"/>

---

## Stage 3. Cross-Camera Re-Identification (Cross-Camera Re-ID)

We have reached the final stage, which constitutes an early form of data fusion—re-identifying the same vessel in shots from both cameras simultaneously. From a network architecture perspective, this is a copy of the model from the first section; the main difference lies in the data sampling approach.

The biggest problem turned out to be the lack of balance in the dataset—for every 60 pairs from a single camera, there was only 1 cross-camera pair. Without intervention, the network optimized itself using the easier images, almost ignoring pairs from two different perspectives. I decided to strictly balance the proportions (e.g., for every 2 Cross-Camera pairs, there were 2 Single-Camera pairs).

### Example Training Pair: Cross-Camera Re-ID

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| View 1: Sprogø (Flipped + Brightness Change) | View 2: Camera East (Original) |
| :---: | :---: |
| <img src="/images/single_cam_cam2.jpg" style="transform: scaleX(-1); filter: brightness(0.65);" alt="Sprogø - Augmentation" width="400"/> | <img src="/images/single_cam_cam1.jpg" alt="Camera East - Original" width="400"/> |

</div>

---

### Evaluation Results: Cross-Camera Re-ID

**Table 1: Baseline Configuration (Baseline Cross-Camera)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Model Architecture | Evaluation Protocol | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Sprogø &rarr; Camera East | 14.03 | 33.94 | 18.80 |
| ResNet34 | Camera East &rarr; Sprogø | 12.76 | 52.04 | 18.81 |
| DINOv2 | Sprogø &rarr; Camera East | 13.12 | 36.20 | 21.18 |
| DINOv2 | Camera East &rarr; Sprogø | 21.94 | 45.92 | 24.49 |

</div>

<br>

**Table 2: Hybrid Training (Imbalanced Data-Sampling)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Model Architecture | Sampling Method | Evaluation Protocol | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Camera East | 32.13 | 48.42 | 26.67 |
| ResNet34 | Cross + Camera East | Camera East &rarr; Sprogø | 14.29 | 47.96 | 21.11 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Camera East | 19.46 | 36.65 | 21.42 |
| DINOv2 | Cross + Camera East | Camera East &rarr; Sprogø | 13.27 | 42.86 | 23.08 |

</div>

<br>

**Table 3: Hybrid Training (Balanced Data-Sampling)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Model Architecture | Sampling Method | Evaluation Protocol | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Camera East | 15.84 | 32.58 | 24.55 |
| ResNet34 | Cross + Camera East | Camera East &rarr; Sprogø | 18.37 | 37.24 | 26.48 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Camera East | 32.58 | 61.09 | 24.39 |
| DINOv2 | Cross + Camera East | Camera East &rarr; Sprogø | 17.35 | 48.47 | 23.24 |

</div>

### Cross-Camera Analysis: Vessel Identity Verification

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| View from First Camera | View from Second Camera |
| :---: | :---: |
| <img src="/images/1765704238_310816000.jpg" alt="View from first camera" width="400"/> | <img src="/images/1765704150_310816000.jpg" alt="View from second camera" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <strong>Similarity between two frames of the above vessel</strong>
    <br>
    <br>
    <img src="/images/Same_vessel_diff_day.png" alt="Cross-Camera Matrix" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>

---

### Cross-Camera Re-Identification in Nighttime Conditions

This stage provided me with extremely interesting observations. It turned out that while cross-camera re-identification performs rather averagely during the day, **it becomes significantly more effective at night**.

Why is this? At night, confusing and highly similar hull textures of merchant ships disappear. Instead, unique arrangements of warning lights and hull illumination take center stage, providing the network with an excellent reference point that is independent of the viewing angle.

**Vessel 259222000**
<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Camera 1 | Camera 2 |
| :---: | :---: |
| <img src="/images/1763828275_259222000.jpg" alt="Vessel 259222000 - Camera 1" width="400"/> | <img src="/images/1763828342_259222000.jpg" alt="Vessel 259222000 - Camera 2" width="400"/> |

</div>

<br>

**Vessel 209184000**
<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Camera 1 | Camera 2 |
| :---: | :---: |
| <img src="/images/1763824375_209184000.jpg" alt="Vessel 209184000 - Camera 1" width="400"/> | <img src="/images/1763824492_209184000.jpg" alt="Vessel 209184000 - Camera 2" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <strong>Similarity diagram for two vessels spotted at night</strong>
    <br>
    <br>
    <img src="/images/2_vessels_at_night.png" alt="Similarity for two ships captured at night" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>

### What's Next? 

If I were to develop this system further, the ideal solution would be to create a complex "mega-model". It could consist of several smaller networks (visual and acoustic), which would combine their predictions at the very end in a process known as *late fusion*.

Another powerful step would be incorporating features from the AIS system (ship type, length, speed, course) as an additional learning modality. Even if a ship turned off its transmitter right before entering a monitored zone, a model fed with such "historical" knowledge would still be able to narrow down the search and make an accurate decision.

Finally, it is worth looking at the broader picture. Designing a similar, multimodal data fusion system—based on relatively cheap, passive sensors—could provide excellent support in protecting infrastructure against objects that intentionally evade traditional radars.

Furthermore, this proven re-identification algorithm and its constituent models could be tested for integration with weaponry operating in all possible environments (navy + ground forces + air and space forces) to create one massive tracking system, allowing conflicts to be conducted with even greater precision.