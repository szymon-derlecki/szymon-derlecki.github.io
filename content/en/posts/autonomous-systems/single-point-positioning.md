---
title: "Single Point Positioning in Python"
date: 2026-07-28
draft: false
description: "A Single Point Positioning algorithm written in Python using the georinex library, covering raw RINEX file processing, satellite orbit interpolation, as well as measurement smoothing."
---

## Project Goal

This project represents an implementation of one of the fundamental approaches in GNSS (Global Navigational Satellite System). The developed program processes raw observations in RINEX format (using the `georinex` library) and combines them with precise orbit data (stored in an SP3 format) to compute the receiver's position - exactly how it's done in your car, phone, or a smartwatch.

## Key Implementation Elements

The script is divided into several essential stages:

*   **Satellite Tracking (SP3):** The script is designed to calculate with high precision exactly where a satellite was in space while transmitting its signal. It also accounts for the fact that the Earth has rotated slightly during the fraction of a second it took for the signal to reach us.
*   **Calculating our position (SPP Algorithm):** This is the core and due to that the most important part. Based on formulas that might look a bit like black magic to many people, it finds our geographical coordinates on Earth (X, Y, Z) and simultaneously corrects the errors of the clock built into the receiver.
*   **Accuracy Assessment (PDOP):** Such program checks if the satellite constellation was well-aligned in the sky. In my test run, the geometry was almost perfect (the PDOP value was 1.379), which means that our position was calculated  with an accuracy of about 1.38 meters.
*   **Pseudorange Smoothing (Hatch Filter):** GPS measurements can act quite "crazy" due to the disturbances along the signal path to a specific receiver. This filter cleverly combines two different types of satellite signals to sift out the noise. As a result, our dot on the map stops bouncing around and becomes very stable.

## Code and Visualization

I've shared the entire source code for this project in [my GitHub repository](https://github.com/szymon-derlecki/Single_Point_Positioning/blob/main/Final_version.ipynb), where you can trace all the data processing stages step by step. 

To visualize the results, I used the `folium` library, which generates an interactive HTML map (`spp_comparison.html`). Below is a glimpse of the final map, which nicely illustrates the comparison between three key points:

1.  **Reference Position (Blue marker)**
2.  **SPP solution based on unfiltered pseudoranges (Red marker)**
3.  **SPP solution based on pseudoranges after applying the Hatch filter (Green marker)**

<iframe src="/maps/spp_comparison.html" width="100%" height="500px" frameborder="0" style="border: 1px solid #ddd; border-radius: 8px;"></iframe>