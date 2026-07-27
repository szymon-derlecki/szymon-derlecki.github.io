---
title: "SLAM System and Autonomous Exploration (ROS2 & TurtleBot)"
date: 2026-07-27
draft: false
description: "A group project implementing an autonomy stack for the TurtleBot in ROS2. My contribution focused on SLAM algorithms and a particle filter."
---

## Project Objective

This project is aimed to program a virtual robot (TurtleBot) in a way allowing it to autonomously explore a completely unknown environment. Its task was to navigate smoothly without colliding with obstacles while simultaneously building a useful map of the space for future navigation. The project was developed as a final assignment for the "Robot Autonomy" course during my master's studies at DTU.

Instead of building the control fundamentals from scratch, we utilized the **ROS 2 (Robot Operating System)** framework, combining its built-in functionalities with our own advanced decision-making algorithms.

## How Does the Robot Learn the Space? (System Architecture and Task Division)

The system works a bit like a person entering a dark, unknown warehouse with a flashlight. To achieve full autonomy for the robot, we divided the tasks within the team:

### My Contribution: Where am I, and what does this room look like? (SLAM Module)
I was responsible for ensuring the robot oriented itself correctly in the new space and didn't lose track of its position on the map. My part of the code handled the following tasks:
*   **Real-time Mapping:** While moving, the robot continuously generated an Occupancy Grid of the room.
*   **Localization (Particle Filter):** I developed a mechanism acting as an indoor GPS, which continuously estimated the robot's exact position relative to the newly emerging map.
*   **TF Tree Management:** I configured the background coordinate frame logic (publishing a static transform between the `map` and `odom` frames) so that the wheel odometry was fully synchronized with readings from the laser scanner (LiDAR), which served as the primary source of environmental data.

### Team's Contribution: Where do we go next? (RRT-based Exploration)
The other team members developed the exploration planning module, whose task was to autonomously select areas the robot had not yet visited. An algorithm based on Rapidly-exploring Random Trees (RRT) analyzed the available environment map, identified unknown spaces, and then generated a safe, collision-free path to the selected goal. This allowed the robot to successively and independently expand its knowledge of the surroundings.

## Technology Stack Used

*   **Environment:** The **ROS 2** framework, with the robot's model and physics simulated in a virtual environment (Gazebo).
*   **Visualization and Control:** We used RViz2 to preview the live mapping process and analyze the robot's "thoughts." Kinematic parameters, such as linear and angular velocity, were monitored in parallel via the terminal.

## Final Result

We developed a system that enabled fully independent operation of the robot. Simulated in a virtual office environment, it could effectively and safely explore an unknown space until a complete map of the room was created. The operation of the individual modules can be seen in the video below:

<iframe width="100%" height="450" src="https://www.youtube.com/embed/SQNP_jh5A6o" title="SLAM and RRT algorithms demonstration (TurtleBot3)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Source Code

I have shared all the custom code responsible for the SLAM module in my public repository:
[GitHub - ROS_SLAM](https://github.com/szymon-derlecki/ROS_SLAM)