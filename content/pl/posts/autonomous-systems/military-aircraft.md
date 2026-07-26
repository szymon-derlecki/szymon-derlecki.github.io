---
title: "Klasyfikacja Samolotów Wojskowych"
date: 2026-07-25
draft: false
description: "Model uczenia maszynowego do detekcji 46 klas samolotów wojskowych."
---

**Opis projektu**
Jest to pierwszy z moich poważniejszych projektów, a zarazem ten, który służył jako fundament w trakcie mojej rekrutacji na studia na DTU. Zapoczątkował on moje zaangażowanie w projekty bazujące na uczeniu maszynowym, zwłaszcza te dotyczące zastosowań militarnych.

**Dane i wyzwania**
Aby go wykonać, wykorzystałem ogólnodostępny zbiór danych ["Military Aircraft Detection Dataset"](https://www.kaggle.com/datasets/a2015003713/militaryaircraftdetectiondataset/data), który jako dataset w stylu open-source był już wielokrotnie modyfikowany. Zbiór ten rozszerzyłem o autorskie fotografie wykonywane podczas pokazów lotniczych w Polsce i za granicą na przestrzeni ostatnich 15 lat (pełny album dostępny [tutaj](https://www.flickr.com/photos/160419049@N02/albums/)), z których część również posłużyła jako dane testowe. 

Model został wytrenowany do rozpoznawania **46** klas maszyn[cite: 1], w tym m.in.: **[F-4, F-16, F-22 Raptor, Tornado, JAS-39 Gripen czy EF-2000]**.

Jedno z głównych wyzwań pojawiło się już na etapie analizy eksploracyjnej - zbiór charakteryzował się mocno niezbalansowanym rozkładem klas poszczególnych maszyn. Zamiast redukować pulę obrazów z klas większościowych, zastosowałem technikę oversamplingu w fazie przygotowywania danych treningowych. Sztuczne zbilansowanie zbioru pozwoliło architekturze bazowej **EfficientNetV2B1**, którą dodatkowo nadbudowałem własnym blokiem klasyfikującym (wykorzystującym warstwy `GlobalMaxPooling2D`, `BatchNormalization`, `Dropout` oraz `Dense`), na równomierną naukę cech charakterystycznych każdej z maszyn. Zapobiegło to faworyzowaniu samolotów, które były najbardziej liczne podczas treningu, a dodane warstwy wzmocniły regularyzację i zminimalizowały ryzyko przeuczenia (overfittingu).

**Wyniki**
Zastosowane podejście pozwoliło mi na osiągnięcie dokładności wynoszącej okolice **85%** na zbiorze testowym. 

[Zobacz pełny kod projektu w repozytorium na GitHub](https://github.com/szymon-derlecki/Bachelor_Thesis/blob/main/Bachelor_Thesis_Project.ipynb)

---

### Przykładowe detekcje

![Detekcja EF-2000](images/ef-2000_detection.png)
![Detekcja F-35](images/f-35_detection.png)
![Detekcja A-400M](images/a-400_detection.png)

<details>
<summary><b>Kliknij, aby zobaczyć pełną listę wspieranych maszyn (46 klas)</b></summary>

* A10
* A400M
* AG600
* AV8B
* B1
* B2
* B52
* Be200
* C2
* C5
* C17
* C130
* E2
* E7
* EF2000
* F4
* F14
* F15
* F16
* F117
* F18
* F22
* F35
* J10
* J20
* JAS39
* KC135
* Mig31
* Mirage2000
* MQ9
* P3
* Rafale
* RQ4
* SR71
* Su25
* Su34
* Su57
* Tornado
* Tu95
* Tu160
* U2
* US2
* V22
* Vulcan
* XB70
* YF23

</details>