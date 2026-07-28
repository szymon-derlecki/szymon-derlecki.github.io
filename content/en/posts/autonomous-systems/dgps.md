---
title: "Differential GPS - What helps an F-35 pilot land safely?"
date: 2026-07-28
draft: false
description: "Standard GPS is not enough to safely land a fighter jet on an aircraft carrier. In this post, I present my implementation of a DGPS algorithm variant."
---

## Project Goal

When an F-35 Lightning II pilot (or a pilot of any ultra-expensive machine) approaches for landing in tough weather conditions, they can't rely solely on a standard GPS signal. A typical positioning error of a few meters in aviation - especially when landing on a moving aircraft carrier - is the difference between a successful maneuver and, at best, a serious incident.

The solution to this problem lies in military augmentation systems based on the **DGPS (Differential GPS)** concept, such as the American JPALS (Joint Precision Approach and Landing System). Near the runway (or on the carrier's deck), there is a reference station that receives signals from the exact same satellites as the fighter jet. The station continuously calculates how much the signal is distorted by atmospheric conditions or clock errors, and then sends the correctly filtered signal straight to the landing aircraft's onboard computer.

In this project, I decided to recreate this mechanism from scratch, writing a custom DGPS algorithm in Python that analyzes satellite data and calculates the most accurate position possible on the map.

## Key Implementation Elements

My script processes the data in several stages, simulating the cooperation between the reference station and the receiver:

*   **Double differences:** Instead of relying on single GPS measurements, the algorithm compares signals received simultaneously by the base station and a second receiver (e.g., the one inside the aircraft). Thanks to this, most errors resulting from satellite and receiver clock inaccuracies are automatically eliminated, significantly increasing the accuracy of the determined position.
*   **Least squares adjustment:** Based on the collected measurements, the program calculates how much the initially assumed receiver position needs to be corrected. This process allows for step-by-step determination of coordinates that best match the actual observations.
*   **Iterative orbit determination:** This is an additional module that accounts for the fact that the GPS signal takes a fraction of a second to travel from the satellite to Earth. The program repeatedly recalculates the satellite's position for the exact moment the signal was transmitted, making the final position determination even more precise.

## Code and Visualization

I've shared the entire source code, showing step-by-step how to form the weight matrices and recalculate orbits, in [my GitHub repository](https://github.com/szymon-derlecki/DGPS_GNSS/blob/main/Assignment_5_DGPS.ipynb), where you can trace all stages of data processing.

To visualize the results, I used the `folium` library, which generates an interactive map in HTML format (`dgps_map.html`). Such a visualization perfectly illustrates why aviation and the navy relied exclusively on these systems for a long time, and why newly developed systems are still largely an evolution of them. The scatter of standard SPP is gone, and the dot marking the position practically "glued" itself to the correct reference point.

1.  **RINEX True Position (Black pin)** - The target we want to hit.
2.  **Classic SPP solution (Pink pin)** - Too far off for a safe landing.
3.  **Corrected DGPS solution (Red pin)** - A highly accurate position (represented by the pin literally glued to the required reference point).

<iframe src="/maps/dgps_map.html" width="100%" height="500px" frameborder="0" style="border: 1px solid #ddd; border-radius: 8px;"></iframe>