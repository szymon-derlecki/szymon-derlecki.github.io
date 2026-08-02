---
title: "Bezradarowe śledzenie statków, czyli jak podwodny światłowód i zwykłe kamery pomagają zwalczać flotę cieni?"
date: 2026-08-02
draft: false
description: "Moja praca magisterska z DTU. Pokazuję w niej, jak wykorzystywać dane z podwodnych kabli światłowodowych (DAS), kamer umieszczonych w okolicy mostu oraz systemu AIS, aby skutecznie śledzić statki bez mrugnięcia okiem, nawet gdy znikną z radaru."
---

Zjawisko tzw. "floty cieni" – statków celowo wyłączających transpondery systemu AIS (Automatic Identification System), by zniknąć z konwencjonalnych radarów – to rosnące wyzwanie dla bezpieczeństwa morskiego[cite: 1]. Kiedy statek wyłącza AIS, standardowe systemy nadzoru tracą jego pozycję. Jak w takiej sytuacji utrzymać ciągłość śledzenia? Odpowiedzią może być wielomodalna fuzja danych sensorowych[cite: 1].

Głównym zadaniem takiego systemu jest **re-identyfikacja (Re-ID)**. Mówiąc najprościej, jest to zdolność algorytmu do rozpoznania, czy obiekt (np. statek) zarejestrowany przez dany czujnik w danym momencie, to dokładnie ta sama jednostka, którą widać na innym kadrze, z innej perspektywy lub w odczytach zupełnie innego sensora[cite: 1].

Ze względu na złożoność projektu, zdecydowałem się podzielić jego opis na trzy kolejne etapy, z których każdy stanowi krok w budowie docelowego systemu śledzenia:

1. **Etap 1: Re-identyfikacja wizualna w obrębie jednej kamery (Single-Camera Re-ID)**
Weryfikujemy tu, czy model potrafi poprawnie dopasować do siebie różne ujęcia tego samego statku, analizując dane zebrane przez daną kamerę z osobna[cite: 1].
2. **Etap 2: Re-identyfikacja akustyczna z użyciem kabla DAS (Distributed Acoustic Sensing)**
Etap prototypowy[cite: 1]. Sprawdzamy tu, czy jednostkę da się zidentyfikować na podstawie unikalnej sygnatury wibracyjno-akustycznej rejestrowanej przez podmorski światłowód[cite: 1].
3. **Etap 3: Re-identyfikacja krzyżowa (Cross-Camera Re-ID)**
Finałowa wczesna fuzja danych[cite: 1]. Oceniamy, czy system potrafi prawidłowo sparować tę samą jednostkę widoczną jednocześnie z dwóch drastycznie różnych perspektyw (np. ujęcia z poziomu morza i ujęcia z wysokiego pylonu)[cite: 1].

---

## Etap 1. Re-identyfikacja wizualna w obrębie jednej kamery

W tej części projektu porównałem dwie zupełnie różne architektury sieci neuronowych, aby sprawdzić, czy wybór podejścia robi tu istotną różnicę[cite: 1]. Zestawiłem klasyczną, konwolucyjną sieć **ResNet34** (która skanuje obraz lokalnie, budując kontekst warstwa po warstwie) z nowszą architekturą **DINOv2** (klasy Vision Transformer, która wykorzystuje mechanizm globalnej atencji do analizy całego obrazu jednocześnie)[cite: 1].

Proces uczenia bazował na metodzie wykorzystującej *supervised contrastive loss*[cite: 1]. Aby dostarczyć sieci precyzyjnych etykiet informujących o tym, co właściwie widzi na kadrze, wykorzystałem dane z systemu AIS (morski odpowiednik Flightradar24)[cite: 1]. Przypisanie logów AIS do obrazów nie zawsze jest jednak bezbłędne (np. gdy w kadrze nakładają się dwie jednostki), dlatego wymagało to zastosowania półautomatycznego procesu weryfikacji i filtrowania przestrzennego[cite: 1].

Skala zbioru danych wizualnych w tym badaniu obejmowała łącznie 50 unikalnych tożsamości statków (MMSI) oraz 2842 kadry zebrane w okresie od grudnia 2025 do stycznia 2026 roku[cite: 1].

Zdefiniujmy od razu dwa główne źródła obrazu, którymi będziemy operować:
* **Kamera East (Storebælt East):** umieszczona wysoko na wschodnim pylonie mostu, patrząca w dół (dobry punkt widokowy, mniej zakłóceń)[cite: 1].
* **Kamera Sprogø:** umieszczona na wysepce, nisko, niemal z poziomu morza (podatna na falowanie i atmosferyczną degradację obrazu)[cite: 1].

Podczas treningu Single-Camera model uczył się na parach kadrów tej samej jednostki[cite: 1]. Skoro korzystałem z *supervised contrastive loss*, sieć musiała uczyć się ignorowania zewnętrznych zmian. Dlatego bazowe kadry poddawałem augmentacji (np. modyfikacje jasności czy odbicia lustrzane w poziomie), by wymusić na modelu naukę cech statku niezależnych od warunków czy kierunku kursu[cite: 1].

### Przykłady par treningowych (Single-Camera Re-ID)

*Uwaga: Poniższe odbicia lustrzane zostały wygenerowane na potrzeby ilustracji procesu wzmacniania zbioru treningowego.*

**Widok 1: Kamera Sprogø**

| Ujęcie oryginalne | Zmodyfikowane ujęcie (augmentacja) |
| :---: | :---: |
| ![Sprogø oryginał](/images/single_cam_cam2.jpg) | ![Sprogø augmentacja](/images/single_cam_cam2_flipped.jpg) |

**Widok 2: Kamera East (pylon)**

| Ujęcie oryginalne | Zmodyfikowane ujęcie (augmentacja) |
| :---: | :---: |
| ![Camera East oryginał](/images/single_cam_cam1.jpg) | ![Camera East augmentacja](/images/single_cam_cam1_flipped.jpg) |

### Wyniki ewaluacji: Single-Camera Re-Identification

Zanim przejdziemy do wyników, krótkie przypomnienie metryk użytych do ewaluacji:
* **Top-1 Acc:** Procent sytuacji, w których absolutnie pierwsza predykcja modelu była trafna[cite: 1].
* **Top-5 Acc:** Procent sytuacji, w których poprawny statek znalazł się w czołowej piątce predykcji[cite: 1].
* **mAP (mean Average Precision):** Ocenia ogólną jakość wygenerowanego rankingu – im wyżej model umieszcza wszystkie poprawne dopasowania, tym wyższy wynik[cite: 1].

**Tabela 1: Wyniki dla architektury ResNet34**

| Dane Treningowe | Dane ewaluacyjne | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 72.85 | 91.86 | 41.44 |
| **V2:** Camera East | Camera East | 87.76 | 96.94 | 47.13 |
| **V3:** Połączone (Sprogø + East) | Sprogø | 68.78 | 90.05 | 33.01 |
| **V3:** Połączone (Sprogø + East) | Camera East | 80.10 | 92.86 | 50.43 |

**Tabela 2: Wyniki dla architektury DINOv2**

| Dane Treningowe | Dane ewaluacyjne | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 75.57 | 93.21 | 44.81 |
| **V2:** Camera East | Camera East | 86.73 | 96.43 | 53.46 |
| **V3:** Połączone (Sprogø + East) | Sprogø | 71.95 | 92.76 | 43.75 |
| **V3:** Połączone (Sprogø + East) | Camera East | 82.65 | 93.88 | 51.14 |

**Wnioski z Etapu 1:**
Jak widać w tabelach, kamera zamontowana wyżej na pylonie (Camera East) deklasuje kamerę wyspową (Sprogø) o średnio 11–15 punktów procentowych[cite: 1]. Jest to bezpośredni efekt mniejszej liczby zasłaniających fal i lepszej perspektywy[cite: 1]. Co ciekawe, zastosowanie treningu łączonego (V3) pogarszało wyniki dla ewaluacji na pojedynczych kamerach[cite: 1]. Sugeruje to, że specyfika obu widoków jest na tyle różna, że modele gubiły się przy próbach jednoczesnej generalizacji obu z nich[cite: 1].

Poniższe wizualizacje to swoisty *sanity check*. Potwierdzają one, że model potrafi rozróżnić jednostki, analizując ich ujęcia w przestrzeni cech.

**Ta sama jednostka (T=0s i T+70s):**

![Ujęcie 1 - Cel dla T=0s](/images/1763804942_220466000.jpg)
![Ujęcie 2 - Cel dla T+70s](/images/1763804912_220466000.jpg)

**Inna jednostka do porównania:**

![Ujęcie 3 - Inna jednostka](/images/1763820365_255806370.jpg)

**Macierz podobieństwa kosinusowego:**

![Schemat podobieństwa dla trzech jednostek](/images/similarity_matrix_same_and_different.png)
*Wysoki wynik podobieństwa dla poprawnej pary statków, niski dla statku o odmiennej tożsamości.*

#### Porównanie dwóch różnych statków z dwóch różnych dni

Aby ocenić odporność modelu na zmienne warunki środowiskowe, porównano dwie odrębne jednostki zarejestrowane w zupełnie różnych dniach[cite: 1]. 

![Jednostka 305425000](/images/1765715109_305425000.jpg)
![Jednostka 265079640](/images/1765721252_265079640.jpg)

**Macierz podobieństwa kosinusowego (Różne dni):**

![Schemat podobieństwa dla różnych dni](/images/sim_matrix_different_days.png)
*Niski wynik podobieństwa potwierdza, że model potrafi skutecznie rozróżniać jednostki pomimo zmian oświetlenia i tła.*

---

## Etap 2. Re-identyfikacja akustyczna z użyciem podmorskiego kabla światłowodowego DAS

Drugi etap to podejście eksperymentalne, w którym statki identyfikowane są wyłącznie na podstawie wibracji i szumu napędu[cite: 1]. Kabel światłowodowy biegnący po dnie cieśniny działa tu jako ogromny sensor, a co najważniejsze – jest obojętny na mgłę czy ciemność i niezwykle trudny do sabotażu[cite: 1].

Podzieliliśmy sygnał na 10-sekundowe segmenty (w oknie 250 metrów z każdej strony względem środka statku), z których wygenerowaliśmy ostatecznie 545 próbek treningowych przypisanych do 22 unikalnych statków[cite: 1]. Dane te przechowywane były jako macierze w formacie `.npy`.

Aby wyciągnąć charakterystykę sygnału, przetestowałem surowe dane w postaci wykresu wodospadowego (waterfall), reprezentację widmową (spektrogramy STFT) oraz ich połączenie.

| Spektrogram STFT | Waterfall (Oś X: pozycja na kablu, Oś Y: czas) |
| :---: | :---: |
| ![](/images/Ship_FFT.png) | ![](/images/Ship_NO_FFT.png) |

### Wyniki identyfikacji akustycznej (DAS)

| Architektura | Rodzaj danych | mAP (%) | Top-1 (%) | Top-5 (%) |
| :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Waterfall | 27.37 | 22.50 | 65.00 |
| ResNet34 | Spektrogram | 29.43 | 35.00 | 70.00 |
| ResNet34 | Waterfall + Spektrogram | 27.55 | 22.50 | 75.00 |
| DINOv2 | Waterfall | 34.03 | 47.50 | 95.00 |
| DINOv2 | Spektrogram | 33.44 | 30.00 | 70.00 |
| DINOv2 | Waterfall + Spektrogram | 34.17 | 30.00 | 85.00 |

*Uwaga interpretacyjna: Skala danych treningowych dla DAS (22 tożsamości) jest znacznie mniejsza niż dla kamer. W tak ograniczonym zbiorze wysokie wyniki Top-5 wynikają częściowo z faktu, że wybór błędnych alternatyw jest bardzo wąski.*

Najlepsze zdolności do różnicowania jednostek model DINOv2 wykazywał operując na surowych sygnałach (Waterfall), osiągając Top-1 na poziomie 47.50%[cite: 1]. Użycie samych spektrogramów (STFT) okazywało się zdradliwe – statki o podobnej budowie kadłuba generują podobne częstotliwości, co prowadzi do "nakładania spektralnego"[cite: 1]. Dodanie wymiaru przestrzennego z wykresu wodospadowego pozwalało uchwycić unikalny sposób promieniowania hałasu przez dany statek.

![Podobieństwo dual](/images/matrix_result_dual_temporal_2.png)
*Wykres podobieństwa wygenerowany przez model dwukanałowy. Kontrast między statkami jest ostry i wyraźny.*

---

## Etap 3. Re-identyfikacja krzyżowa (Cross-Camera Re-ID)

Ostatni etap weryfikuje zdolność systemu do re-identyfikacji statków na kadrach pochodzących z obu kamer jednocześnie (Cross-Camera)[cite: 1]. Wymaga to od sieci poradzenia sobie z drastycznymi różnicami perspektywy, oświetlenia i rozdzielczości[cite: 1].

Przetestowałem trzy podejścia do budowania zbiorów:
* **Baseline Cross-Camera:** Pary treningowe składały się wyłącznie z układu `Kamera East <-> Kamera Sprogø`[cite: 1].
* **Hybrydowe (Niezbalansowane):** Dorzucone pary zebrane wcześniej na pojedynczych kamerach[cite: 1].
* **Hybrydowe (Zbalansowane):** Równe proporcje par krzyżowych do par pochodzących z jednej kamery[cite: 1].

| Widok z kamery Sprogø (z augmentacją) | Widok z Camera East (oryginał) |
| :---: | :---: |
| ![](/images/single_cam_cam2_aug.jpg) | ![](/images/single_cam_cam1.jpg) |
*Przykładowa para użyta do treningu krzyżowego.*

### Wyniki ewaluacji: Cross-Camera Re-ID

**Tabela 1: Konfiguracja bazowa (Baseline Cross-Camera)**

| Architektura | Kierunek Ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Sprogø &rarr; Camera East | 14.03 | 33.94 | 18.80 |
| ResNet34 | Camera East &rarr; Sprogø | 12.76 | 52.04 | 18.81 |
| DINOv2 | Sprogø &rarr; Camera East | 13.12 | 36.20 | 21.18 |
| DINOv2 | Camera East &rarr; Sprogø | 21.94 | 45.92 | 24.49 |

**Tabela 2: Trening hybrydowy (Imbalanced Data-Sampling)**

| Architektura | Sposób próbkowania | Kierunek Ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Camera East | 32.13 | 48.42 | 26.67 |
| ResNet34 | Cross + Camera East | Camera East &rarr; Sprogø | 14.29 | 47.96 | 21.11 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Camera East | 19.46 | 36.65 | 21.42 |
| DINOv2 | Cross + Camera East | Camera East &rarr; Sprogø | 13.27 | 42.86 | 23.08 |

**Tabela 3: Trening hybrydowy (Balanced Data-Sampling)**

| Architektura | Sposób próbkowania | Kierunek ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Camera East | 15.84 | 32.58 | 24.55 |
| ResNet34 | Cross + Camera East | Camera East &rarr; Sprogø | 18.37 | 37.24 | 26.48 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Camera East | 32.58 | 61.09 | 24.39 |
| DINOv2 | Cross + Camera East | Camera East &rarr; Sprogø | 17.35 | 48.47 | 23.24 |

Bez odpowiedniego balansu w zbiorze (gdzie proporcja par zebranych z jednej kamery w stosunku do par krzyżowych wynosiła drastyczne 60:1), sieć szukała "drogi na skróty" i ignorowała dane krzyżowe[cite: 1]. Dopiero ścisłe zbalansowanie proporcji wymusiło na modelach naukę uniwersalnych cech wizualnych, co widać po skoku skuteczności dla modelu DINOv2[cite: 1].

| Widok z pierwszej kamery | Widok z drugiej kamery |
| :---: | :---: |
| ![](/images/1765704238_310816000.jpg) | ![](/images/1765704150_310816000.jpg) |

![Macierz Cross-Camera](/images/Same_vessel_diff_day.png)
*Wysokie prawdopodobieństwo podobieństwa wygenerowane przez sieć dla tej samej jednostki w wariancie Cross-Camera.*

### Noc bije dzień: Najciekawszy wniosek z uczenia krzyżowego

O ile dopasowanie tego samego statku uchwyconego pod różnymi kątami za dnia jest dla modelu sporym wyzwaniem, o tyle **w nocy model staje się zdecydowanie skuteczniejszy**[cite: 1]. 

Sieć rewelacyjnie uczy się unikalnych układów świateł nawigacyjnych, oświetlenia burt i masztów[cite: 1]. W nocy brak detali i tekstury kadłuba przestaje być przeszkodą, a uwidaczniają się ostre ułożenia świateł, które stanowią dla sieci doskonały "odcisk palca", doskonale widoczny niezależnie od perspektywy obu kamer.

**Porównanie w warunkach nocnych (Jednostka 259222000 i 209184000)**

| Kamera A (Camera East) | Kamera B (Sprogø) |
| :---: | :---: |
| ![](/images/1763828275_259222000.jpg) | ![](/images/1763828342_259222000.jpg) |
| ![](/images/1763824375_209184000.jpg) | ![](/images/1763824492_209184000.jpg) |

![Podobieństwo dla dwóch statków w nocy](/images/2_vessels_at_night.png)
*Diagram skuteczności dopasowania nocnego. Wartości na przekątnej jasno dowodzą wysokiej pewności w łączeniu tych samych tożsamości z dwóch różnych kamer.*

### Co dalej?

Gdybym miał rozwijać ten system, kolejnym krokiem byłaby późna fuzja danych (*late fusion*) – zbudowanie nadrzędnego modelu łączącego i ważącego predykcje niezależnych, wyspecjalizowanych sieci (wizualnych i akustycznych)[cite: 1].

Bardzo obiecujące byłoby również włączenie cech z samego systemu AIS (np. typ statku, długość kadłuba, prędkość, kurs) jako dodatkowej modalności uczącej[cite: 1]. Nawet gdyby statek wyłączył nadajnik po wejściu w strefę, system zasilony w ten sposób wiedzą "historyczną" potrafiłby szybciej zawęzić poszukiwania.

Ostatecznie, koncepcja oparta na fuzji tanich i rozproszonych sensorów (obraz + kabel na dnie) to kierunek z ogromnym potencjałem. Wielomodalna fuzja sensorów stanowi obiecujące wsparcie w obronie przed małymi, trudnymi do wykrycia celami, takimi jak drony nawodne, stanowiąc niezależną od pogody zaporę informacyjną.