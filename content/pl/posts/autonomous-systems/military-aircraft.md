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

Model został wytrenowany do rozpoznawania **46** klas maszyn, w tym m.in.: **[F-4, F-16, F-22 Raptor, Tornado, JAS-39 Gripen czy EF-2000]**.

Jedno z głównych wyzwań pojawiło się już na etapie analizy eksploracyjnej - zbiór charakteryzował się mocno niezbalansowanym rozkładem klas poszczególnych maszyn. Zamiast redukować pulę obrazów z klas większościowych, zastosowałem technikę oversamplingu w fazie przygotowywania danych treningowych. Sztuczne zbilansowanie zbioru pozwoliło architekturze bazowej **EfficientNetV2B1**, którą dodatkowo nadbudowałem własnym blokiem klasyfikującym (wykorzystującym warstwy `GlobalMaxPooling2D`, `BatchNormalization`, `Dropout` oraz `Dense`), na równomierną naukę cech charakterystycznych każdej z maszyn. Zapobiegło to faworyzowaniu samolotów, które były najbardziej liczne podczas treningu, a dodane warstwy wzmocniły regularyzację i zminimalizowały ryzyko przeuczenia (overfittingu).

**Wyniki**
Zastosowane podejście pozwoliło mi na osiągnięcie dokładności wynoszącej okolice **85%** na zbiorze testowym. 

[Zobacz pełny kod projektu w repozytorium na GitHub](https://github.com/szymon-derlecki/Bachelor_Thesis/blob/main/Bachelor_Thesis_Project.ipynb)

---

### Przykładowe detekcje

![Detekcja EF-2000](/images/ef-2000_detection.png)
![Detekcja F-35](/images/f-35_detection.png)
![Detekcja A-400M](/images/a-400_detection.png)


<details>
<summary><b>Kliknij, aby zobaczyć pełną listę wspieranych maszyn (46 klas)</b></summary>
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