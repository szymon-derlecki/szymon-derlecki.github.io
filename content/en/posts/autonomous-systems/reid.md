---
title: "Radarless ship tracking: how an underwater fiber optic cable and ordinary cameras help combat the shadow fleet"
date: 2026-08-02
draft: false
description: "My Master's thesis at DTU. I demonstrate how to use data from underwater fiber optic cables (DAS), bridge-mounted cameras, and the AIS system to keep ships in sight, even when they vanish from the radar."
---

The phenomenon of the "shadow fleet"—ships intentionally turning off their AIS transponders to disappear from radars—is a growing challenge for maritime security. When a vessel turns off its AIS, traditional surveillance systems lose sight of it. How can we maintain continuous tracking in such a situation? The answer might lie in multimodal sensor data fusion.

The heart of such a system is the **re-identification (Re-ID)** mechanism. Simply put, it is the algorithm's ability to answer the question: *"Is this image patch or signal I am seeing right now the exact same object that passed by another camera a moment ago?"*.

Because this project was highly complex, I decided to divide its description into three successive stages, each representing a separate step in building an advanced maritime tracking system:

1. **Stage 1: Single-Camera Visual Re-Identification (Single-Camera Re-ID)**
The first part focuses on tracking the same ship exclusively in frames originating from a single, specific video source. The algorithm's task is to recognize a specific vessel, ignoring external disturbances such as changing weather conditions. Here, I analyze the data collected by each camera individually.

2. **Stage 2: Acoustic Re-Identification using DAS (Distributed Acoustic Sensing) Cable**
The second part takes a completely different direction and is a highly experimental stage of the project. Here, I identify ships based on vibrational and acoustic data. These signals are recorded by an underwater fiber optic cable running along the bottom of the strait, which acts as a sensor covering a vast area of the maritime corridor.

3. **Stage 3: Cross-Camera Re-Identification (Cross-Camera Re-ID)**
The final part presents an architecture designed for mutual ship identification across frames from different sources—working "crosswise." I evaluate whether the program can pair the same vessel viewed from two drastically different perspectives.

## Stage 1. Single-Camera Visual Re-Identification

In this part of the project, I compared two completely different neural network architectures to see if the choice of approach makes a significant difference here.

The first is ResNet34—a classic Convolutional Neural Network (CNN). It analyzes the image locally, sliding a small filter (e.g., 3x3 or 7x7 px) over it and building context layer by layer. The second variant is DINOv2, a Vision Transformer (ViT) architecture. In its case, the image is divided into smaller fragments (so-called patches), which the network processes in parallel, instantly comparing each fragment with every other fragment using a global attention mechanism.

I trained the process based on a *supervised contrastive loss* method, so the algorithm needed precise labels. I used data from the AIS system (the maritime equivalent of Flightradar24) for this purpose. Of course, assigning AIS logs to images is rarely absolutely flawless (e.g., when ships overlap in the frame), which is why I applied spatial filters and manual verification to reliably describe the dataset.

The visual dataset covered the period from December 2025 to January 2026. I collected a total of **2,842 frames for 50 unique ship identities**. Let's immediately define two image sources that will appear throughout the post:

- **Sprogø:** a camera placed on a small island, low and close to the water level.
- **Camera East:** a camera placed high up on the eastern bridge pylon, offering a top-down perspective.

While building the training set for a single camera, I subjected each baseline ship image to augmentations (including horizontal mirror reflections and brightness modifications). From one shot, I created an artificial pair, forcing the network to learn the ship's features regardless of the direction it was sailing.

### Examples of Training Pairs (Single-Camera Re-ID)

Below is a visualization of the pair creation process. I generated an artificial pair from each base shot via a horizontal mirror reflection.

**View 1: Sprogø**

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

*The mirror reflection is shown here for illustrative purposes, generated in the browser.*

After 80 training epochs, I achieved satisfactory results. Before moving on to the tables, however, a brief explanation of the metrics. **Top-1** indicates the percentage of situations where the algorithm provided the flawless result immediately in the first place. **Top-5** is the percentage of situations where the correct ship was in the top five. In turn, **mAP** (mean Average Precision) evaluates the overall quality of the ranking generated by the model.

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

A very concrete conclusion can be drawn from the tables: the higher-mounted camera on the pylon (Camera East) beats Sprogø by almost 15 percentage points. This is a direct result of fewer obstructing waves and a better perspective. It is also worth noting that combined training (V3) degraded the results for evaluation on both cameras—the network simply got lost trying to generalize two drastically different visual environments in a single approach.

### Visual Frame Comparison and Match Matrices

Below, I am including the match matrices. Let's treat this more as a visual *sanity check* (an illustration that the model actually sees the differences) rather than final proof.

<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
<img src="/images/1763804942_220466000.jpg" alt="Shot 1 - Target for T=0s" style="max-width: 48%; height: auto;"/>
<img src="/images/1763804912_220466000.jpg" alt="Shot 2 - Target for T+70s" style="max-width: 48%; height: auto;"/>
</div>

<br>

**Shot 3 (Different vessel)**

<div style="text-align: center;">
<img src="/images/1763820365_255806370.jpg" alt="Shot 3 - Different vessel" style="max-width: 100%; height: auto;"/>
</div>

*Photos of the target vessel and an additional ship used for comparison.*

<br>

**Cosine Similarity Matrix (Three Units)**

<div style="text-align: center;">
<img src="/images/similarity_matrix_same_and_different.png" alt="Similarity scheme for three units" style="max-width: 100%; height: auto;"/>
</div>

Two shots of the same unit achieve high similarity, while the third, foreign frame clearly stands out—which is exactly what we expect.

---

#### Comparison of Two Different Ships from Two Different Days

To evaluate the model's robustness to varying environmental conditions, I compared two distinct vessels recorded on completely different days.

<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
<img src="/images/1765715109_305425000.jpg" alt="Vessel 305425000" style="max-width: 48%; height: auto;"/>
<img src="/images/1765721252_265079640.jpg" alt="Vessel 265079640" style="max-width: 48%; height: auto;"/>
</div>

<br>

**Cosine Similarity Matrix (Different Days)**

<div style="text-align: center;">
<img src="/images/sim_matrix_different_days.png" alt="Similarity scheme for different days" style="max-width: 100%; height: auto;"/>
</div>

The low similarity confirms that the model distinguishes the vessels themselves, not just the background and lighting conditions under which they were captured.

---

## Stage 2. Acoustic Re-Identification using DAS Underwater Fiber Optic Cable

The second part differs fundamentally in terms of hardware. The cable running along the bottom of the strait acts as a massive acoustic sensor here. The advantage is that weather conditions do not affect it the way they do a camera, and physically damaging it on the seabed is extremely difficult.

However, weather resistance does not mean resistance to the environment itself. Ocean currents and waves cause the signal to always "drift" a bit relative to the ship's position calculated from AIS. To avoid losing key acoustic data, I adopted a 250-meter margin on each side from the center of the vessel and divided this window into 5 segments. The scale of this prototype dataset amounted to **545 samples for 22 unique ship identities**. Keep in mind that with such a narrow pool of test ships, the Top-5 metric will naturally be very high (because the choice of potential "mistakes" is small).

I tested raw spatiotemporal data (*waterfall* plots) and frequency spectrograms (STFT).

### Acoustic Signal Analysis (DAS)

| STFT Spectrogram | Data in 'WATERFALL' plot format |
| :---: | :---: |
| <img src="/images/Ship_FFT.png" width="400"/> | <img src="/images/Ship_NO_FFT.png" width="400"/> |

*For the waterfall plot, the horizontal axis presents the position along the cable, and the vertical axis presents time. The STFT spectrogram shows the frequency distribution over time.*

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

DINOv2 performed better than ResNet34 in every mode. The highest mAP was achieved by combining the raw signal with the spectrogram (34.17%), but the best Top-1 result came from the waterfall itself (47.50%)—though with such a small dataset, these differences should be treated as a trend rather than a hard ranking. More interestingly, relying solely on spectrograms can be deceptive: ships of similar build generate very similar frequencies, leading to "spectral overlapping". Only the raw spatial signal highlighted the unique way noise radiates in the water.

**Similarity Matrix for Dual-Channel Model (Dual)**

<div style="text-align: center;">
<img src="/images/matrix_result_dual_temporal_2.png" alt="Dual Matrix" style="max-width: 100%; height: auto;"/>
</div>

The chart compares the same two vessels across successive time windows. The contrast between them is clearer here than when using only the raw signal or only the spectrogram, suggesting that adding the STFT channel strengthens the features already present in the spatial data.

---

## Stage 3. Cross-Camera Re-Identification (Cross-Camera Re-ID)

We have reached the final stage, which constitutes an early form of data fusion—re-identifying the same vessel in shots from both cameras simultaneously. From the network's perspective, this is a copy of the model from the first section; the main difference lies in the data sampling approach.

The biggest problem turned out to be the lack of balance in the dataset—for every 60 pairs from one camera, there was only 1 cross-camera pair. Without intervention, the network optimized itself with easier images, almost ignoring pairs from two different perspectives. Therefore, I tested two variants: hybrid training on natural, imbalanced proportions and strict dataset balancing (for every 2 Cross-Camera pairs, there were 2 Single-Camera pairs).

### Example Training Pair: Cross-Camera Re-ID

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| View 1: Sprogø (Flipped + Brightness Change) | View 2: Camera East (Original) |
| :---: | :---: |
| <img src="/images/single_cam_cam2.jpg" style="transform: scaleX(-1); filter: brightness(0.65);" alt="Sprogø - Augmentation" width="400"/> | <img src="/images/single_cam_cam1.jpg" alt="Camera East - Original" width="400"/> |

</div>

---

### Evaluation Results: Cross-Camera Re-ID

The notation "Sprogø → Camera East" means that the model receives a query from the Sprogø camera and searches for a match in the dataset of frames from Camera East.

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

Comparing Table 1 with the others reveals the most important takeaway from this stage: **throwing single-camera pairs into the cross-camera dataset can more than double the Top-1 metric** (14.03% → 32.13% for ResNet34 and 13.12% → 32.58% for DINOv2 in the balanced variant). The model first needs to learn what "the same ship" looks like in an easier scenario to have something to work with in a harder one.

The dataset balancing itself also yields interesting results—it doesn't work identically for both architectures. ResNet34 achieved a better result on natural, imbalanced proportions (32.13% vs 15.84%), while DINOv2 benefited from strict balancing (32.58% vs 19.46%). However, the absolute performance level remains low, and this task is still an open challenge.

### Cross-Camera Analysis: Vessel Identity Verification

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø | Camera East |
| :---: | :---: |
| <img src="/images/1765704238_310816000.jpg" alt="View from Sprogø" width="400"/> | <img src="/images/1765704150_310816000.jpg" alt="View from Camera East" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <img src="/images/Same_vessel_diff_day.png" alt="Cross-Camera Matrix" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>

Similarity between two frames of the above vessel, captured by both cameras.

---

### Cross-Camera Re-Identification in Nighttime Conditions

This stage provided me with the most interesting observation of the entire project. It turned out that while cross-camera re-identification performs rather averagely during the day, **it becomes significantly more effective at night**.

Why is this? At night, the confusing, highly similar hull textures of merchant ships disappear. Instead, unique arrangements of warning lights and hull illumination take center stage, providing the network with an excellent reference point that is independent of the viewing angle.

**Vessel 259222000**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø | Camera East |
| :---: | :---: |
| <img src="/images/1763828275_259222000.jpg" alt="Vessel 259222000 - Sprogø" width="400"/> | <img src="/images/1763828342_259222000.jpg" alt="Vessel 259222000 - Camera East" width="400"/> |

</div>

<br>

**Vessel 209184000**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø | Camera East |
| :---: | :---: |
| <img src="/images/1763824375_209184000.jpg" alt="Vessel 209184000 - Sprogø" width="400"/> | <img src="/images/1763824492_209184000.jpg" alt="Vessel 209184000 - Camera East" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <img src="/images/2_vessels_at_night.png" alt="Similarity for two ships captured at night" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>

Similarity diagram for two vessels spotted at night.

### What's Next?

If I were to develop this system further, the ideal solution would be to create a complex "mega-model". It could consist of several smaller networks (visual and acoustic), which would combine their predictions at the very end in a framework known as *late fusion*. Each of these sensors individually is average, but each fails under different conditions—and that is exactly the point of fusion.

Another powerful step would be incorporating features from the AIS system (ship type, length, speed, course) as an additional learning modality. Even if a ship turned off its transmitter right before entering a monitored zone, a model fed with such "historical" knowledge would still be able to narrow down the search and make an accurate decision.

Finally, it is worth looking at the broader picture. Designing a similar, multimodal data fusion system—based on relatively cheap, passive, and hard-to-jam sensors—could provide excellent support in protecting infrastructure against objects that intentionally evade traditional radars. This project concerned ships in a Danish strait, but the principle itself transfers beyond the maritime domain unchanged: **several imperfect sensors, failing at different moments, together provide something much better than each of them individually.**