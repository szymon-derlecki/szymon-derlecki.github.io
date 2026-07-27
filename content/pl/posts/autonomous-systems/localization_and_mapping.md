---
title: "System SLAM dla mobilnego robota (ROS 2 + TurtleBot)"
date: 2026-07-27
draft: false
description: "Oprogramowanie dla robota TurtleBot, dzięki któremu potrafi on samodzielnie eksplorować przestrzeń, tworzyć mapę otoczenia w czasie rzeczywistym (SLAM) i planować optymalną ścieżkę poruszania się."
---

## Cel projektu

Projekt polegał na oprogramowaniu wirtualnego robota (TurtleBot) w taki sposób, aby potrafił on samodzielnie eksplorować zupełnie nowe dla siebie pomieszczenie. Jego zadaniem było płynne nawigowanie bez kolizji z przeszkodami przy jednoczesnym budowaniu użytecznej mapy przestrzeni, która posłużyłaby mu do późniejszej nawigacji. Projekt zrealizowano jako zadanie końcowe w ramach kursu „Robot Autonomy” na moich studiach magisterskich na uczelni DTU.

Zamiast tworzyć podstawy sterowania od zera, wykorzystaliśmy platformę **ROS 2 (Robot Operating System)**. Połączyliśmy jej wbudowane funkcjonalności z naszymi autorskimi, zaawansowanymi algorytmami decyzyjnymi.

## Jak robot uczy się przestrzeni? (Architektura systemu i podział prac)

System działa trochę jak człowiek wchodzący z latarką do ciemnego, nieznanego magazynu. Aby osiągnąć pełną autonomię robota, podzieliliśmy się zadaniami w zespole:

### Mój wkład: Gdzie jestem i jak wygląda to pomieszczenie? (Moduł SLAM)
Odpowiadałem za to, aby robot poprawnie orientował się w nowej przestrzeni i nie zgubił własnej pozycji na mapie. Moja część kodu realizowała następujące zadania:
*   **Mapowanie w czasie rzeczywistym:** Podczas ruchu robot na bieżąco generował siatkę zajętości pomieszczenia (Occupancy Grid).
*   **Lokalizacja (Particle Filter):** Opracowałem mechanizm działający jak wewnątrzbudynkowy GPS, który nieustannie szacował dokładną pozycję robota względem nowo powstającej mapy.
*   **Zarządzanie drzewem TF:** Skonfigurowałem logikę układów współrzędnych w tle (publikowanie statycznej transformacji między ramkami `map` a `odom`), tak aby odometria z kół była w pełni zsynchronizowana z odczytami skanera laserowego (LiDAR), który stanowił główne źródło danych o otoczeniu.

### Wkład zespołu: Gdzie jedziemy dalej? (Eksploracja oparta na RRT)
Pozostali członkowie zespołu opracowali moduł planowania eksploracji, którego zadaniem było autonomiczne wybieranie obszarów, których robot jeszcze nie odwiedził. Algorytm na bazie drzew RRT (Rapidly-exploring Random Tree) analizował dostępną mapę środowiska, identyfikował nieznane przestrzenie, a następnie generował bezpieczną, bezkolizyjną ścieżkę prowadzącą do wybranego celu. Dzięki temu robot mógł sukcesywnie i samodzielnie poszerzać swoją wiedzę o otoczeniu.

## Wykorzystany stos technologiczny

*   **Środowisko:** Platforma **ROS 2**, z fizyką i modelem robota symulowanymi w środowisku wirtualnym (Gazebo).
*   **Wizualizacja i kontrola:** Do podglądu procesu mapowania na żywo i analizy „myśli” robota wykorzystaliśmy środowisko RViz2. Parametry kinematyczne, takie jak prędkość liniowa i kątowa, były monitorowane równolegle z poziomu terminala.

## Efekt końcowy

Opracowaliśmy system pozwalający na w pełni niezależną pracę robota. Symulowany w wirtualnym środowisku biurowym, potrafił on skutecznie i bezpiecznie eksplorować nieznaną przestrzeń aż do stworzenia kompletnej mapy pomieszczenia. Działanie poszczególnych modułów można zobaczyć na poniższym wideo:

<iframe width="100%" height="450" src="https://www.youtube.com/embed/SQNP_jh5A6o" title="Demonstracja algorytmów SLAM i RRT (TurtleBot3)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Kod źródłowy

Całość autorskiego kodu odpowiedzialnego za moduł SLAM udostępniłem w moim publicznym repozytorium:
[GitHub - ROS_SLAM](https://github.com/szymon-derlecki/ROS_SLAM)