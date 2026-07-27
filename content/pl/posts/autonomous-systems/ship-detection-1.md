---
title: "Automatyczne wykrywanie statków w rejonie mostu nad Wielkim Bełtem"
date: 2026-07-26
draft: false
description: "Model oparty na architekturze YOLOv8n, służący do wykrywania statków oraz tworzenia nowego zbioru danych z rejonu Wielkiego Bełtu."
---

Praca z danymi wizyjnymi w środowisku morskim potrafi być nie lada wyzwaniem. Dziś chciałbym podzielić się kulisami mojego projektu, który z prostego pomysłu na ekstrakcję danych ewoluował w pełnoprawną publikację naukową i stał się solidnym fundamentem moich dalszych badań nad fuzją danych i systemami autonomicznymi.

### Jak powstał zbiór danych?

Wszystko zaczęło się od pozyskania surowych materiałów. Za pomocą przygotowanego skryptu [`storebaelt_cameras_acquistions.ipynb`](https://github.com/szymon-derlecki/OSINT_project/blob/master/Storebaelt_cameras_acquistions.ipynb) automatycznie pobrałem klatki z ogólnodostępnych kamer monitorujących cieśninę Wielki Bełt. System zapisywał je z częstotliwością 10 sekund na przestrzeni kilku dni w grudniu i styczniu. Większość z nich ukazuje statki w dziennych warunkach późnej jesieni i zimy. To właśnie te obrazy, po procesie ręcznego etykietowania, utworzyły nowy zbiór danych - **Danish Maritime Dataset (DMD)**.

### Trenowanie modelu i walka z Data Leakage

Sam model detekcji bazuje na architekturze YOLOv8n. W trakcie prac przetestowałem kilka różnych konfiguracji, z czego część można zobaczyć w notatniku [`demo.ipynb`](https://github.com/szymon-derlecki/OSINT_project/blob/master/demo.ipynb), gdzie znajdują się również informacje o zastosowanych augmentacjach (m.in. takich jak modyfikacje właściwości obrazu takich jak np. jasność, czy modyfikacje geometryczne takie jak chociażby obrót obrazu).

Najlepsze rezultaty przyniósł scenariusz, w którym model został najpierw poddany pre-trenowaniu na dużych zbiorach morskich (Singapore Maritime Dataset oraz SeaShips), a następnie fine-tuningowi na części zdjęć z naszych duńskich kamer. Aby zapewnić wiarygodność wyników i całkowicie wyeliminować zjawisko *data leakage*, zastosowałem rygorystyczny podział: model uczył się na klatkach z konkretnych dni, natomiast testowany był na zdjęciach z zupełnie innych dób.

### Wyniki a kapryśna pogoda

Ostateczny model poradził sobie świetnie, osiągając mAP50 na poziomie 0.93 dla kamery umieszczonej na wschodnim pylonie mostu oraz 0.85 dla kamery z poziomu morza. Praca nad tym projektem dobitnie uświadomiła mi jednak, jak ogromny wpływ na skuteczność algorytmów wizyjnych mają warunki atmosferyczne. Zimowa aura, mgła czy ostre odbicia słońca na tafli wody stanowią poważny problem decyzyjny dla sieci neuronowej.

Płynie z tego jasny wniosek: idealnym scenariuszem rozwoju byłoby dotrenowanie modelu na zdjęciach ze wszystkich pór roku - czy to poprzez zebranie wielomiesięcznych danych, czy też przez użycie bardzo zaawansowanych augmentacji wspomnianych klatek z kamer, tak by zasymulować różnorodne zjawiska pogodowe.

### Co dalej? Od zbioru danych po pracę magisterską

Zbiór danych i oparta na nim analiza posłużyły do napisania mojej pierwszej publikacji badawczej, którą miałem okazję zaprezentować na konferencji IGARSS 2026. 

Zarówno wyuczony model, jak i sam zbiór DMD, zostały zintegrowane jako kluczowe elementy mojej pracy magisterskiej. Wykorzystałem je do budowy znacznie szerszej architektury monitorowania ruchu morskiego, polegającej na wielosensorowej fuzji danych - łączącej detekcję z kamer m.in. z systemami AIS oraz rozproszonymi czujnikami akustycznymi (DAS).

**Materiały do projektu:**
* Zbiór danych na platformie Zenodo: [https://zenodo.org/records/18267483](https://zenodo.org/records/18267483)
* Pełna treść artykułu naukowego: [IGARSS_Publication.pdf](https://szymon-derlecki.github.io/IGARSS_Publication.pdf/)

*Poniżej zdjęcia z przykładami udanych detekcji:*

![Detekcja statku - pylon wschodni](static/images/storebaelt_east_frame_detection.jpg)
*Widok z kamery umiejscowionej na wschodnim pylonie mostu Storebaelt*

![Detekcja statku - Sprogø](images/sprogoe_frame_detection.jpg)
*Widok z kamery umiejscowionej na wysepce Sprogø*

