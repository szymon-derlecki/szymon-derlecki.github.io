---
title: "Bezradarowe śledzenie statków: Jak podwodny światłowód i zwykłe kamery pomagają zwalczać flotę cieni?"
date: 2026-07-31
draft: false
description: "Moja praca magisterska z DTU. Pokazuję w niej, jak wykorzystywać dane z podwodnych kabli światłowodowych (DAS), kamer umieszczonych w okolicy mostu oraz systemu AIS, aby skutecznie śledzić statki, nawet gdy znikną z radarów."
---

Statek, który chce zniknąć, po prostu wyłącza transponder AIS. Radar też nie zawsze pomoże — nie ma go wszędzie, a przy złej pogodzie bywa zawodny. Pytanie, które postawiłem sobie w pracy magisterskiej, brzmi więc: **czy da się rozpoznać ten sam statek na dwóch różnych nagraniach (albo na dźwięku z dna morza), nie mając ani radaru, ani AIS?**

To zadanie nazywa się **re-identyfikacją** (Re-ID). Model nie ma tu odpowiadać "to jest prom Oscar Wilde". Ma odpowiadać na prostsze, ale bardzo praktyczne pytanie: *czy te dwa wycinki obrazu przedstawiają tę samą jednostkę?* Jeśli tak — możemy śledzić statek dalej, przekazując go sobie między czujnikami, nawet kiedy formalnie "zniknął".

Projekt był dość rozbudowany, więc podzieliłem opis na trzy etapy — każdy to osobny krok w budowie systemu:

1. **Etap 1: Re-identyfikacja w obrębie jednej kamery (Single-Camera Re-ID)** —
sprawdzam, czy model potrafi rozpoznać ten sam statek na kadrach z jednego źródła wideo, ignorując zmienne warunki atmosferyczne. To test wykonalności: jeśli tu nie zadziała, dalej nie ma sensu iść.

2. **Etap 2: Re-identyfikacja akustyczna z użyciem kabla DAS (Distributed Acoustic Sensing)** —
zwrot w zupełnie inną stronę i najbardziej prototypowa część projektu. Statki rozpoznaję tu wyłącznie po drganiach i dźwięku (silnik, śruba napędowa), rejestrowanych przez podwodny światłowód biegnący po dnie cieśniny.

3. **Etap 3: Re-identyfikacja krzyżowa (Cross-Camera Re-ID)** —
najtrudniejszy wariant. Model musi sparować tę samą jednostkę widzianą z dwóch drastycznie różnych perspektyw: niemal z poziomu wody (wyspa Sprogø) oraz z góry, z wschodniego pylonu mostu.

### Dwie kamery — dla jasności

W całym poście przewijają się te same dwa źródła wideo, więc ustalmy nazwy raz na początku:

| Oznaczenie | Lokalizacja | Charakterystyka |
| :--- | :--- | :--- |
| **Sprogø** | wysepka na środku cieśniny | ujęcie niemal z poziomu wody, statki daleko, obraz mocno degradowany przez pogodę |
| **Storebælt East** | wschodni pylon mostu | ujęcie z dużej wysokości, statek bliżej i lepiej widoczny |

### Jak czytać metryki

W tabelach pojawiają się trzy liczby:

* **Top-1 (%)** — jak często *najlepsze* dopasowanie wskazane przez model to faktycznie ten sam statek.
* **Top-5 (%)** — jak często poprawna odpowiedź jest gdziekolwiek w pierwszej piątce typów. W praktyce operacyjnej to bardzo użyteczna metryka: człowiek albo kolejny czujnik może dobić decyzję z pięciu kandydatów.
* **mAP (%)** — miara jakości całego rankingu, nie tylko czubka listy. Karze model, gdy poprawne dopasowania są rozrzucone po całej liście.

## Etap 1. Re-identyfikacja w obrębie jednej kamery

Zacząłem od ustalenia architektury sieci. Chciałem sprawdzić, czy wybór podejścia robi tu w ogóle różnicę, więc porównałem dwa dość odległe od siebie rozwiązania.

**ResNet34** to klasyczna sieć konwolucyjna (CNN). Przesuwa po obrazie niewielkie filtry (rzędu 3x3 piksele), warstwa po warstwie składając z lokalnych detali coraz bardziej ogólny obraz tego, co widzi.

**DINOv2** to nowsza architektura typu Vision Transformer (ViT). Tu obraz jest najpierw cięty na siatkę kwadratowych fragmentów (*patchy*), a potem sieć porównuje każdy fragment z każdym innym naraz. Efekt jest taki, że model od pierwszej warstwy widzi zależności między odległymi częściami kadru — np. że sylwetka dziobu pasuje do nadbudówki na drugim końcu statku.

Trening oparłem na *supervised contrastive loss*, czyli metodzie uczenia nadzorowanego — a to znaczy, że model potrzebował etykiet mówiących, na co właściwie patrzy. Tu do gry wszedł system **AIS**, o którym można myśleć jak o morskim Flightradar24. Przetworzyłem surowe logi AIS tak, aby przypisać numer rejestracyjny statku (MMSI) do odpowiadającego mu kadru. W większości przypadków przypisanie było jednoznaczne; problematyczne były sytuacje z kilkoma jednostkami w kadrze naraz oraz momenty, gdy pozycja z AIS przychodziła z opóźnieniem — takie próbki odrzucałem.

Mając gotowy i opisany zbiór, przeszedłem do budowy par treningowych. Na tym etapie pracowałem wyłącznie w obrębie jednej kamery, więc pary powstawały tylko z kadrów z tego samego źródła.

W praktyce wyglądało to tak: każde bazowe zdjęcie statku przepuszczałem przez zestaw losowych modyfikacji — odbicie lustrzane w poziomie, zmiany jasności, kontrastu i nasycenia oraz drobne transformacje geometryczne (rotacje, skalowanie). Z jednego ujęcia powstawały więc dwie różne wizualnie wersje, tworzące parę opisaną jako "ta sama jednostka". Dzięki temu sieć uczy się, że statek to statek niezależnie od kierunku, w którym płynie, i niezależnie od tego, czy słońce świeci mu w burtę.

Poniżej wizualizacja tego procesu — schemat prosto z pracy.

### Przykłady par treningowych (Single-Camera Re-ID)

**Widok 1: Wysepka Sprogø**

<table>
<tr>
<th>Ujęcie oryginalne</th>
<th>Zmodyfikowane ujęcie</th>
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

**Widok 2: Wschodni pylon mostu (Storebælt East)**

<table>
<tr>
<th>Ujęcie oryginalne</th>
<th>Zmodyfikowane ujęcie</th>
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

*Odbicie lustrzane pokazane tu poglądowo, wygenerowane w przeglądarce.*

### Wyniki ewaluacji: Single-Camera Re-ID

Po 80 epokach treningu i dobraniu hiperparametrów wyniki wyglądały tak. V1 i V2 to trening na jednej kamerze, V3 to trening na obu naraz.

**Tabela 1: Architektura ResNet34**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Dane treningowe | Dane ewaluacyjne | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 72.85 | 91.86 | 41.44 |
| **V2:** Storebælt East | Storebælt East | 87.76 | 96.94 | 47.13 |
| **V3:** Sprogø + Storebælt East | Sprogø | 68.78 | 90.05 | 33.01 |
| **V3:** Sprogø + Storebælt East | Storebælt East | 80.10 | 92.86 | 50.43 |

</div>

<br>

**Tabela 2: Architektura DINOv2**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Dane treningowe | Dane ewaluacyjne | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 75.57 | 93.21 | 44.81 |
| **V2:** Storebælt East | Storebælt East | 86.73 | 96.43 | 53.46 |
| **V3:** Sprogø + Storebælt East | Sprogø | 71.95 | 92.76 | 43.75 |
| **V3:** Sprogø + Storebælt East | Storebælt East | 82.65 | 93.88 | 51.14 |

</div>

Z tych tabel wychodzą trzy rzeczy warte podkreślenia:

* **Kamera na pylonie bije Sprogø o kilkanaście punktów procentowych.** Nic dziwnego — z góry statek jest większy, ostrzejszy i mniej zasłonięty przez mgłę czy zamglenie nad wodą.
* **Trening na obu kamerach naraz (V3) pogorszył wyniki na Sprogø**, a na Storebælt East wypadł niejednoznacznie. Innymi słowy: samo wrzucenie do jednego worka danych z dwóch perspektyw nie wystarcza, żeby model automatycznie zaczął je łączyć.
* **DINOv2 jest lekko lepszy niż ResNet34**, zwłaszcza w mAP i na trudniejszej kamerze, ale różnica nie jest dramatyczna. Wybór architektury pomaga, tylko nie ratuje sytuacji.

### Wizualne porównanie kadrów i macierze dopasowań

Poniższe przykłady to nie ewaluacja, a raczej *sanity check* — chciałem zobaczyć na konkretnych kadrach, czy model zachowuje się sensownie.

Najpierw dwa ujęcia tej samej jednostki (w odstępie ok. 70 sekund) plus trzeci kadr zupełnie innego statku jako kontrola.

<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">

<img src="/images/1763804942_220466000.jpg"
     alt="Ujęcie 1 - Cel dla T=0s"
     style="max-width: 48%; height: auto;"/>

<img src="/images/1763804912_220466000.jpg"
     alt="Ujęcie 2 - Cel dla T+70s"
     style="max-width: 48%; height: auto;"/>

</div>

<br>

**Ujęcie 3 (inna jednostka)**

<div style="text-align: center;">

<img src="/images/1763820365_255806370.jpg"
     alt="Ujęcie 3 - Inna jednostka"
     style="max-width: 100%; height: auto;"/>

</div>

<br>

**Macierz podobieństwa kosinusowego (trzy jednostki)**

<div style="text-align: center;">

<img src="/images/similarity_matrix_same_and_different.png"
     alt="Schemat podobieństwa dla trzech jednostek"
     style="max-width: 100%; height: auto;"/>

</div>

Dwa ujęcia tego samego statku dostają wysokie podobieństwo, a trzeci, obcy kadr wyraźnie odstaje. Dokładnie tego oczekujemy.

---

#### Ten sam test, ale na dwóch różnych dniach

Żeby sprawdzić, czy model nie oszukuje — czyli czy nie dopasowuje statków po tle, oświetleniu albo porze dnia — porównałem dwie różne jednostki zarejestrowane w całkowicie odmiennych dniach. Tło, światło i pogoda różnią się tu naturalnie.

<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">

<img src="/images/1765715109_305425000.jpg"
     alt="Jednostka 305425000"
     style="max-width: 48%; height: auto;"/>

<img src="/images/1765721252_265079640.jpg"
     alt="Jednostka 265079640"
     style="max-width: 48%; height: auto;"/>

</div>

<br>

**Macierz podobieństwa kosinusowego (różne dni)**

<div style="text-align: center;">

<img src="/images/sim_matrix_different_days.png"
     alt="Schemat podobieństwa dla różnych dni"
     style="max-width: 100%; height: auto;"/>

</div>

Niskie podobieństwo potwierdza, że model rozróżnia jednostki, a nie tylko warunki, w których zostały sfotografowane.

---

## Etap 2. Re-identyfikacja akustyczna z użyciem światłowodu DAS

Druga część projektu używa niemal tego samego kodu, ale fundamentalnie innego sprzętu do zbierania danych. Tu nie ma obrazu — statki rozpoznaję wyłącznie po drganiach i dźwięku, jakie generują silnik i śruba napędowa. Kabel światłowodowy leżący na dnie cieśniny działa jako jeden gigantyczny, bardzo czuły mikrofon rozciągnięty na kilometry. Ma dwie ogromne zalety wobec kamery: pogoda przeszkadza mu znacznie mniej, a uszkodzić go jest naprawdę trudno.

Jest jednak haczyk. Odporność na pogodę nie znaczy odporność na *środowisko*. Prądy, falowanie i zmieniający się w ciągu dnia wiatr sprawiają, że rejestrowany sygnał zawsze trochę "pływa" względem oczekiwanej pozycji statku. Dlatego wspólnie z promotorami zdecydowaliśmy się wycinać sygnał w oknie o marginesie 250 metrów w każdą stronę od środka jednostki — łącznie około 500 metrów — i dzielić je na 5 segmentów. Tak szerokie okno wymagało minimalnej korekty pozycji, ale dawało pewność, że nie utnę kluczowych danych akustycznych.

Trening szybko pokazał, że parametry przeniesione żywcem ze zdjęć są tu bardzo niestabilne. Konieczne było wprowadzenie harmonogramowania *Cosine Annealing* i przestrojenie optymalizatora. Dane (przechowywane jako macierze `.npy`) też augmentowałem — napisałem do tego system, który potrafił nakładać filtry kaskadowo na cały zbiór albo dzielić go na porcje z pojedynczymi modyfikacjami. W użyciu były m.in. *dropout*, *cutout* (wycinanie fragmentów sygnału), odbicia w obu osiach, *random crop* oraz szum Gaussa skalowany do odchylenia standardowego samego sygnału.

Wniosek końcowy: "surowy" sygnał to za mało. Wymagał mocniejszego filtrowania i transformacji czasowo-częstotliwościowych. Najlepiej działało złożenie wykresu *waterfall* z tym samym sygnałem przedstawionym jako spektrogram STFT. Co ciekawe, w suchych metrykach ten wariant nie zawsze wygrywał — ale na pojedynczych przykładach właśnie on najwyraźniej różnicował jednostki.

### Jak wygląda sygnał z DAS

| Spektrogram STFT | Dane w postaci wykresu typu "waterfall" |
| :---: | :---: |
| ![](/images/Ship_FFT.png) | ![](/images/Ship_NO_FFT.png) |

Oba obrazy pochodzą z tego samego statku i tego samego przedziału czasu. Na wykresie **waterfall** oś pozioma to pozycja wzdłuż kabla, a oś pionowa to czas — wyraźna czerwona linia to bezpośrednio trajektoria statku przesuwającego się nad światłowodem. **Spektrogram STFT** to klasyczna reprezentacja czasowo-częstotliwościowa: pokazuje rozkład częstotliwości (oś pionowa) w czasie (oś pozioma), co pozwala zobaczyć unikalną sygnaturę akustyczną jednostki.

### Wyniki identyfikacji akustycznej (DAS)

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura | Rodzaj danych | mAP (%) | Top-1 (%) | Top-5 (%) |
| :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Waterfall | 27.37 | 22.50 | 65.00 |
| ResNet34 | Spektrogram | 29.43 | 35.00 | 70.00 |
| ResNet34 | Waterfall + Spektrogram | 27.55 | 22.50 | 75.00 |
| DINOv2 | Waterfall | 34.03 | 47.50 | 95.00 |
| DINOv2 | Spektrogram | 33.44 | 30.00 | 70.00 |
| DINOv2 | Waterfall + Spektrogram | 34.17 | 30.00 | 85.00 |

</div>

Augmentacje dla danych typu waterfall: `dropout`, `gaussian_noise`, `cutout`, `random_crop`, `flip_lr`. Dla spektrogramów: `dropout`, `gaussian_noise`, `cutout`.

Trzeba to czytać ostrożnie: zbiór testowy DAS był mały, więc pojedyncze punkty procentowe niewiele znaczą i pełne 95% w Top-5 nie oznacza gotowego produktu. Widać natomiast czytelny trend — **DINOv2 radzi sobie z sygnałem akustycznym wyraźnie lepiej niż ResNet34 w każdym trybie**, a poprawna odpowiedź prawie zawsze ląduje w pierwszej piątce. To dokładnie ten rodzaj wyniku, który jest bezużyteczny jako samodzielny czujnik, ale bardzo cenny jako *element fuzji* z obrazem.

**Macierz podobieństwa dla modelu dwukanałowego (waterfall + spektrogram)**

![](/images/matrix_result_dual_temporal_2.png)

Wykres porównuje te same dwie jednostki w kolejnych oknach czasowych. Kontrast między statkami jest tu wyraźnie ostrzejszy niż przy użyciu samego surowego sygnału albo samego spektrogramu — co sugeruje, że dodanie kanału STFT wzmacnia cechy obecne już w danych przestrzennych.

## Etap 3. Re-identyfikacja krzyżowa (Cross-Camera Re-ID)

I dochodzimy do ostatniego etapu, który jest formą wczesnej fuzji danych — łączy obrazy z dwóch różnych kamer. Architektonicznie to praktycznie ten sam model co w Etapie 1. Cała różnica leży w tym, **jak dobieram pary** i czego od modelu wymagam: ma teraz rozpoznać tę samą jednostkę widzianą z dwóch zupełnie różnych perspektyw.

Przetestowałem kilka strategii budowania zbioru:

* **Podstawowe Cross-Camera** — para to zdjęcie statku z kamery A i zdjęcie tej samej jednostki z kamery B. W praktyce wypadło słabo.
* **Podejście hybrydowe (Cross + Single)** — do zbioru dorzuciłem wcześniejsze pary z jednej kamery. Wyniki zauważalnie się poprawiły.
* **Zbalansowane próbkowanie** — ścisłe wyrównanie proporcji: na 2 pary krzyżowe przypadały 2 pary tej samej jednostki z wybranej kamery. Przetestowane dla obu widoków.
* **Pełna fuzja (plany na przyszłość)** — trening na parach krzyżowych z jednoczesnym uwzględnieniem par single-camera z *obu* kamer naraz. Na to zabrakło już czasu.

### Przykładowa para treningowa: Cross-Camera Re-ID

Model dostaje w parze ujęcia tej samej jednostki z dwóch różnych źródeł. Na kadr ze Sprogø nałożono dodatkowo odbicie lustrzane (symulacja innego kierunku ruchu) i zmianę jasności.

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø (odbicie + zmiana jasności) | Storebælt East (oryginał) |
| :---: | :---: |
| <img src="/images/single_cam_cam2.jpg" style="transform: scaleX(-1); filter: brightness(0.65);" alt="Sprogø - Augmentacja" width="400"/> | <img src="/images/single_cam_cam1.jpg" alt="Storebælt East - Oryginał" width="400"/> |

</div>

---

### Wyniki ewaluacji: Cross-Camera Re-ID

Zapis "Sprogø → Storebælt East" oznacza: model dostaje zapytanie z kamery Sprogø i szuka dopasowania w zbiorze kadrów z Storebælt East.

**Tabela 1: Konfiguracja bazowa (baseline cross-camera)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura | Metoda ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Sprogø &rarr; Storebælt East | 14.03 | 33.94 | 18.80 |
| ResNet34 | Storebælt East &rarr; Sprogø | 12.76 | 52.04 | 18.81 |
| DINOv2 | Sprogø &rarr; Storebælt East | 13.12 | 36.20 | 21.18 |
| DINOv2 | Storebælt East &rarr; Sprogø | 21.94 | 45.92 | 24.49 |

</div>

<br>

**Tabela 2: Trening hybrydowy (imbalanced data sampling)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura | Sposób próbkowania | Metoda ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Storebælt East | 32.13 | 48.42 | 26.67 |
| ResNet34 | Cross + Storebælt | Storebælt East &rarr; Sprogø | 14.29 | 47.96 | 21.11 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Storebælt East | 19.46 | 36.65 | 21.42 |
| DINOv2 | Cross + Storebælt | Storebælt East &rarr; Sprogø | 13.27 | 42.86 | 23.08 |

</div>

<br>

**Tabela 3: Trening hybrydowy (balanced data sampling)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura | Sposób próbkowania | Metoda ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Storebælt East | 15.84 | 32.58 | 24.55 |
| ResNet34 | Cross + Storebælt | Storebælt East &rarr; Sprogø | 18.37 | 37.24 | 26.48 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Storebælt East | 32.58 | 61.09 | 24.39 |
| DINOv2 | Cross + Storebælt | Storebælt East &rarr; Sprogø | 17.35 | 48.47 | 23.24 |

</div>

Porównując Tabelę 1 z pozostałymi widać najważniejszą rzecz z tego etapu: **dorzucenie par z jednej kamery do zbioru krzyżowego potrafi ponad dwukrotnie podnieść Top-1** (14.03% → 32.13% dla ResNet34, 13.12% → 32.58% dla DINOv2 w wariancie zbalansowanym). Model najpierw musi się nauczyć, jak wygląda "ten sam statek" w łatwiejszym scenariuszu, żeby mieć czym operować w trudniejszym. Poziom bezwzględny nadal jest jednak niski — to zadanie pozostaje otwarte.

### Weryfikacja tożsamości statku między kamerami

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø | Storebælt East |
| :---: | :---: |
| <img src="/images/1765704238_310816000.jpg" alt="Widok ze Sprogø" width="400"/> | <img src="/images/1765704150_310816000.jpg" alt="Widok ze Storebælt East" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <img src="/images/Same_vessel_diff_day.png" alt="Macierz Cross-Camera" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>

Podobieństwo między dwoma kadrami tej samej jednostki zarejestrowanymi z obu kamer.

---

### Re-identyfikacja krzyżowa w warunkach nocnych

W nocy dochodzi problem ograniczonego oświetlenia. Poniżej dwie różne jednostki (MMSI 259222000 i 209184000) uchwycone jednocześnie przez obie kamery.

**Jednostka 259222000**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø | Storebælt East |
| :---: | :---: |
| <img src="/images/1763828275_259222000.jpg" alt="Jednostka 259222000 - Sprogø" width="400"/> | <img src="/images/1763828342_259222000.jpg" alt="Jednostka 259222000 - Storebælt East" width="400"/> |

</div>

<br>

**Jednostka 209184000**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø | Storebælt East |
| :---: | :---: |
| <img src="/images/1763824375_209184000.jpg" alt="Jednostka 209184000 - Sprogø" width="400"/> | <img src="/images/1763824492_209184000.jpg" alt="Jednostka 209184000 - Storebælt East" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <img src="/images/2_vessels_at_night.png" alt="Podobieństwo dla dwóch statków uchwyconych nocą" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>

Macierz podobieństwa dla dwóch jednostek widocznych nocą.

### Wnioski z uczenia krzyżowego

Ten etap dał mi najciekawszą obserwację całego projektu: **re-identyfikacja krzyżowa działa lepiej w nocy niż w ciągu dnia.** Brzmi wbrew intuicji, ale wyjaśnienie jest proste — po zmroku statki mają włączone światła nawigacyjne i ostrzegawcze, a ich kolory oraz rozstawienie na burtach i masztach tworzą praktycznie unikalny wzór. Dla sieci to znacznie mocniejszy punkt odniesienia niż kształt kadłuba.

W dzień te wskazówki znikają, bo w ciągu dnia oświetlenia się po prostu nie używa. Dopasowanie oddalonej, zdegradowanej przez zamglenie miniatury statku ze Sprogø do wyraźnego ujęcia z pylonu pozostaje więc trudnym problemem. Wyniki sugerują, że dalszy postęp wymaga nie lepszego modelu, a **dodatkowych źródeł informacji** — danych satelitarnych, obrazu z dronów albo kolejnych czujników.

### Co dalej?

Gdybym rozwijał ten system dalej, celem byłby jeden złożony model zbudowany z kilku wyspecjalizowanych sieci, które łączą swoje predykcje z odpowiednimi wagami (*late fusion*). Każdy czujnik z osobna jest tu przeciętny — ale każdy zawodzi w innych warunkach, i właśnie na tym polega sens fuzji.

Drugi krok, na który zabrakło czasu: włączenie cech z samego AIS jako osobnej modalności — typ jednostki, długość, prędkość, kurs. To dane strukturalne i bardzo precyzyjne. Model wytrenowany również na nich potrafiłby podjąć trafną decyzję nawet wtedy, gdy obraz z jednej kamery albo sygnał z kabla zostaną zniekształcone.

Na koniec rzecz, która wydaje mi się najistotniejsza. Wiele państw nie ma dziś skutecznej odpowiedzi na małe, tanie cele — drony i pociski. Obecne środki reagowania bywają albo absurdalnie drogie w stosunku do celu, albo stwarzają zagrożenie dla ludzi na ziemi. Wielomodalna fuzja czujników — kamery, akustyka, dane pasywne — jest tania, pasywna i trudna do zakłócenia. Ten projekt dotyczył statków w duńskiej cieśninie, ale sama zasada przenosi się bez zmian: **kilka niedoskonałych czujników, które zawodzą w różnych momentach, razem dają coś znacznie lepszego niż każdy z nich osobno.**