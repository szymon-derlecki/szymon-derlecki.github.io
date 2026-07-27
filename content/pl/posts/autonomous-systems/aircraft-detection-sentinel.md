---
title: "Wykrywanie (detekcja) samolotów na zdjęciach satelitarnych Sentinel-2"
date: 2026-07-26
draft: false
description: "Oparte na architekturze YOLO oprogramowanie do wykrywania statków powietrznych na obrazach satelitarnych pozyskanych z satelity Sentinel-2."
---

**Cel Projektu**

Ten projekt skupia się na automatycznym wykrywaniu sylwetek samolotów na obrazach satelitarnych Sentinel-2 przy użyciu architektury YOLO (You Only Look Once). Głównym założeniem jest lokalizacja małych obiektów na zdjęciach o relatywnie niskiej rozdzielczości przestrzennej (10 m/px), co stanowi klasyczny problem detekcji małych obiektów w dziedzinie obserwacji Ziemi (Earth Observation). 

System powstał jako pasywna, oparta na analizie obrazu alternatywa i uzupełnienie dla tradycyjnych systemów śledzenia (takich jak np. ADS-B). Ma to szczególne znaczenie w strategicznie wrażliwych obszarach, takich jak region Morza Bałtyckiego, gdzie transpondery samolotów bywają celowo wyłączane.

## Zbiór Danych i Wyzwania

Model został wytrenowany na **579 obrazach RGB** z satelity Sentinel-2, a walidacja wyników została przeprowadzona z użyciem metadanych ADS-B pozyskanych dla konkretnego dnia z bazy OpenSky Network.

**Efekt "Planebow"**
Unikatowym zjawiskiem obserwowanym w tym zbiorze danych jest tzw. efekt "planebow" (chromatyczna smuga przedstawiająca trzy sylwetki tego samego samolotu bardzo blisko siebie). Wynika on z faktu, że czujniki satelity Sentinel-2 rejestrują pasma czerwone, zielone i niebieskie w sposób sekwencyjny. W przypadku szybko poruszających się obiektów – takich jak samoloty na wysokościach przelotowych (ale także np. samochody jadące z dużą prędkością po autostradach) – powoduje to wizualne rozwarstwienie kolorów. To zjawisko na pewnym etapie okazało się kluczową wskazówką ułatwiającą detekcję.

## Model i Architektura

Do zbudowania rozwiązania wykorzystano architekturę **YOLOv8s**. Wybór ten był podyktowany brakiem konieczności stosowania tzw. kotwic (anchor-free), niezależnym mechanizmem predykcji oraz dobrą wydajnością przy wykrywaniu małych obiektów na sprzęcie o ograniczonych zasobach obliczeniowych (takim jak standardowy laptop gamingowy).

**Parametry Treningowe:**
*   **Rozmiar wejścia:** 640x640 pikseli
*   **Epoki:** 50
*   **Batch Size:** 16
*   **Learning Rate:** 0.001
*   **Confidence Threshold:** 0.25
*   **IoU Threshold (NMS):** 0.45
*   **Augmentacja:** Zaimplementowano dedykowany pipeline z użyciem biblioteki `Albumentations` (odbicia lustrzane, rotacje $\pm45^{\circ}$, zmiany jasności). Celowo zrezygnowano z agresywnego przycinania obrazów (cropping), aby nie zniekształcić wspomnianego wyżej efektu "planebow".

## Ewaluacja i Wyniki

Ewaluację przeprowadzono techniką przesuwnych okien (sliding window) na pełnych, dużych scenach satelitarnych o rozdzielczości 7665x7791 pikseli. 

*   **mAP@50 (Trening):** ~98%
*   **Dokładność (Accuracy):** 56%
*   **Precyzja (Precision):** 62%
*   **Czułość (Recall):** 83%
*   **F1-Score:** 71%

Wysoki wskaźnik czułości (83%) dowodzi, że detektor skutecznie odnajduje zdecydowaną większość rzeczywistych samolotów. Umiarkowana precyzja wynika z występowania fałszywych detekcji (False Positives) w miejscach przypominających sylwetki maszyn. Należą do nich m.in. boiska piłkarskie, panele słoneczne, jasne dachy oraz wspomniane wcześniej, szybko poruszające się samochody, które również generują podobne smugi chromatyczne.

## Przykłady Detekcji

*Poniżej zawarłem przykłady z wizualizacją predykcji modelu:*

### Prawidłowa Detekcja
Wyraźna sylwetka samolotu z zauważalną smugą chromatyczną.

![Prawidłowa detekcja](/images/prawidlowa_detekcja.png)

### Fałszywa Detekcja 
Obiekt na ziemi błędnie zidentyfikowany jako samolot.

![Nieprawidłowa detekcja](/images/bledna_detekcja.png)

## Plany Rozwoju 
1.  **Rozbudowa zbioru danych:** Dodanie większej liczby tzw. negatywnych przykładów (boiska, autostrady), co powinno znacząco zredukować liczbę fałszywych detekcji.
2.  **Segmentacja instancji (Instance Segmentation):** Zastosowanie modeli typu Mask R-CNN lub YOLACT, które pomogą wyizolować dokładny kształt obiektu, zamiast zamykać go w standardowych ramkach (bounding boxes).
3.  **Filtrowanie kontekstowe:** Wdrożenie dodatkowych reguł odrzucających obiekty na podstawie ich rozmiaru lub analizy tła (np. wykluczenie detekcji w gęstej tkance miejskiej bez obecności chmur).

**Repozytorium Projektu:** [GitHub - Individual-course-Aircraft-Detection-in-Sentinel-2-Satellite-Images-using-Deep-Learning-25](https://github.com/szymon-derlecki/Individual-course-Aircraft-Detection-in-Sentinel-2-Satellite-Images-using-Deep-Learning-25)