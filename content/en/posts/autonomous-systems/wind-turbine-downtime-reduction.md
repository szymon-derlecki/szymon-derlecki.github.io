---
title: "How to predict a wind turbine failure using TCN networks?"
date: 2026-07-29
draft: false
description: "The downtime of massive wind turbines results in gigantic costs. In this post, I show how we used Temporal Convolutional Networks (TCN) to predict rotor blade loads."
---

### Project Goal

Wind turbine downtime severely impacts the overall efficiency of renewable energy sources. When giant turbine blades stop spinning due to a failure, it obviously leads to significant financial losses, and in worst-case scenarios, can even cause blackouts. Instead of waiting for a breakdown, a much better approach is to predict the loads acting on the turbine blades. This allows for planning maintenance well in advance, consequently leading to a massive reduction in failures.

In this project, our main goal was to predict wind loads (specifically the bending moments: Mz1, Mz2, Mz3) acting on the turbine blades.

## Key Implementation Elements

Our designed solution processes data in several main stages, from filtering out unnecessary noise to advanced prediction using a convolutional neural network:

*   **Data Selection:** As input, we had 17 simulated turbine features, including blade pitch angles and rotor parameters at various wind speeds. We applied variance thresholding to remove low-variance features. Next, we calculated the mean absolute correlation with our targets (Mz1, Mz2, Mz3) to "feed" the model only the most critical variables.
*   **Temporal Convolutional Network (TCN) Architecture:** We utilized a TCN because it's an incredibly powerful tool for analyzing time-series data. Thanks to the use of dilated convolutions and pooling layers, the network can efficiently process past information and deliver highly accurate predicted values of these crucial loads. The architecture was based on three temporal blocks (increasing the number of channels: 16-32, 32-64, 64-64), connected to a classic Fully Connected layer (64-3) at the very end.
*   **Training Parameters:** The model was trained using the Adam optimizer, and we chose Mean Square Error as our loss function. We set the learning rate to 0.0001, and the entire process was scheduled for 100 epochs. Additionally, we introduced a safeguard in the form of Early Stopping, with a patience parameter set to 5 epochs in case of no metric improvement on the validation set.

## Code and Visualization

The final results prove that this type of network is a fantastic architecture for working with such data. The best model achieved a stellar R² score of 0.9784, with a Mean Squared Error (MSE) of only 33.1251. On the other hand, when tested on all available data without strict prior selection, the R² score dropped to 0.8223.

Below, I'm attaching our project poster with a closer look at the feature selection plots and the block diagram of the TCN itself:

![Project Poster - Lowering the downtime of wind turbines](/images/turbine_dt.jpg)

I've shared the entire source code for this project in my GitHub repository, where you can thoroughly trace the model architecture and the data processing pipeline.
[GitHub Repository: Wind Turbines Project - Deep Learning](https://github.com/szymon-derlecki/Deep_Learning_Project_Wind_Turbines/blob/main/Wind_Turbines_Project_Deep_Learning.ipynb)