---
title: "Bezradarowe śledzenie statków, czyli jak podwodny światłowód i zwykłe kamery pomagają zwalczać flotę cieni?"
date: 2026-08-02
draft: false
description: "Moja praca magisterska z DTU. Pokazuję w niej, jak wykorzystywać dane z podwodnych kabli światłowodowych (DAS), kamer umieszczonych w okolicy mostu oraz systemu AIS, aby nie tracić statków z oczu, nawet gdy znikną z radaru."
---

Zjawisko tzw. "floty cieni" - statków, które celowo wyłączają transpondery systemu AIS, by zniknąć z radarów - to rosnące wyzwanie dla bezpieczeństwa na morzu. Kiedy jednostka wyłącza AIS, tradycyjne systemy nadzoru tracą ją z oczu. Jak w takiej sytuacji utrzymać ciągłość śledzenia? Odpowiedzią może być wielomodalna fuzja danych sensorowych.

Sercem takiego systemu jest mechanizm **re-identyfikacji (Re-ID)**. Mówiąc najprościej, jest to zdolność algorytmu do odpowiedzi na pytanie: *"Czy ten wycinek obrazu lub sygnał, który widzę teraz, to dokładnie ten sam obiekt, który przed chwilą minął inną kamerę?"*.

Ze względu na to, że projekt ten był bardzo złożony, zdecydowałem się podzielić jego opis na trzy kolejne etapy, gdzie każdy z nich stanowi osobny krok w budowie zaawansowanego systemu śledzenia jednostek morskich:

1. **Etap 1: Re-identyfikacja wizualna w obrębie jednej kamery (Single-Camera Re-ID)**
Pierwsza część skupia się na śledzeniu tego samego statku wyłącznie na kadrach pochodzących z jednego, konkretnego źródła wideo. Algorytm ma za zadanie rozpoznawać konkretną jednostkę, ignorując zakłócenia, takie jak zmienne warunki atmosferyczne. Analizuję tu dane zebrane przez każdą z kamer z osobna.

2. **Etap 2: Re-identyfikacja akustyczna z użyciem kabla DAS (Distributed Acoustic Sensing)**
Druga część to zwrot w zupełnie inną stronę i jednocześnie dość mocno eksperymentalny etap projektu. Identyfikuję tu statki bazując na danych wibracyjnych i akustycznych. Sygnały te są rejestrowane przez podwodny kabel światłowodowy biegnący po dnie cieśniny, który pełni funkcję czujnika obejmującego bardzo duży rejon morskiego korytarza.

3. **Etap 3: Re-identyfikacja krzyżowa (Cross-Camera Re-ID)**
Finałowa część przedstawia architekturę, której zadaniem jest wzajemna identyfikacja statków na kadrach pochodzących z różnych źródeł - działając "na krzyż". Oceniam, czy program potrafi sparować tę samą jednostkę widoczną z dwóch drastycznie różnych perspektyw.

## Etap 1. Re-identyfikacja wizualna w obrębie jednej kamery

W tej części projektu porównałem dwie zupełnie różne architektury sieci neuronowych, aby sprawdzić, czy wybór podejścia robi tu istotną różnicę.

Pierwszym z nich jest ResNet34 - klasyczna, konwolucyjna sieć neuronowa (CNN). Analizuje ona obraz lokalnie, przesuwając po nim niewielki filtr (np. 3x3 lub 7x7 px) i budując kontekst warstwa po warstwie. Drugim wariantem jest DINOv2, czyli architektura typu Vision Transformer (ViT). W jej przypadku obraz dzielony jest na mniejsze fragmenty (tzw. patche), które sieć przetwarza równolegle, od razu porównując każdy fragment z każdym za pomocą mechanizmu globalnej uwagi.

Proces uczyłem bazując na metodzie *supervised contrastive loss*, algorytm potrzebował więc precyzyjnych etykiet. Użyłem do tego danych z systemu AIS (morski odpowiednik Flightradar24). Oczywiście przypisanie logów AIS do obrazu rzadko jest absolutnie bezbłędne (np. gdy statki nakładają się w kadrze), dlatego zastosowałem filtry przestrzenne i ręczną weryfikację, aby rzetelnie opisać zbiór.

Zbiór danych wizualnych obejmował okres od grudnia 2025 do stycznia 2026 roku. Zebrałem łącznie **2842 kadry dla 50 unikalnych tożsamości statków**. Zdefiniujmy od razu dwa źródła obrazu, które będą przewijać się przez cały post:

*   **Sprogø:** kamera umieszczona na wysepce, nisko, blisko poziomu wody.
*   **Camera East:** kamera umieszczona wysoko na wschodnim pylonie mostu, oferująca perspektywę z góry.

Podczas budowy zbioru treningowego dla pojedynczej kamery, każde bazowe zdjęcie statku poddałem augmentacjom (m.in. odbicia lustrzane w poziomie, modyfikacje jasności). Z jednego ujęcia robiłem sztuczną parę, wymuszając na sieci naukę cech statku niezależnie od kierunku, w którym płynie.

### Przykłady par treningowych (Single-Camera Re-ID)

Poniżej znajduje się wizualizacja procesu tworzenia par. Z każdego bazowego ujęcia wygenerowałem sztuczną parę poprzez odbicie lustrzane w poziomie.

**Widok 1: Sprogø**

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

**Widok 2: Camera East (pylon)**

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

Po 80 epokach treningu osiągnąłem satysfakcjonujące wyniki. Zanim jednak przejdziemy do tabel, krótkie wyjaśnienie metryk. **Top-1** oznacza procent sytuacji, w których algorytm podał bezbłędny wynik od razu na pierwszym miejscu. **Top-5** to odsetek sytuacji, gdzie poprawny statek był w czołowej piątce. Z kolei **mAP** (mean Average Precision) ocenia ogólną jakość wygenerowanego przez model rankingu.

### Wyniki ewaluacji: Single-Camera Re-Identification

**Tabela 1: Wyniki dla architektury ResNet34**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Dane Treningowe | Dane ewaluacyjne | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 72.85 | 91.86 | 41.44 |
| **V2:** Camera East | Camera East | 87.76 | 96.94 | 47.13 |
| **V3:** Sprogø + Camera East| Sprogø | 68.78 | 90.05 | 33.01 |
| **V3:** Sprogø + Camera East | Camera East | 80.10 | 92.86 | 50.43 |

</div>

<br>

**Tabela 2: Wyniki dla architektury DINOv2**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Dane Treningowe | Dane ewaluacyjne | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 75.57 | 93.21 | 44.81 |
| **V2:** Camera East | Camera East | 86.73 | 96.43 | 53.46 |
| **V3:** Sprogø + Camera East| Sprogø | 71.95 | 92.76 | 43.75 |
| **V3:** Sprogø + Camera East | Camera East | 82.65 | 93.88 | 51.14 |

</div>

Z tabel płynie bardzo konkretny wniosek: wyżej zamontowana kamera na pylonie (Camera East) bije Sprogø o niemal 15 punktów procentowych. To bezpośredni efekt mniejszej liczby zasłaniających fal i lepszej perspektywy. Warto też zauważyć, że trening łączony (V3) pogarszał wyniki dla ewaluacji na obu kamerach - sieć po prostu gubiła się, próbując uogólniać dwa tak drastycznie różne środowiska wizualne w jednym podejściu.

### Wizualne porównanie kadrów i macierze dopasowań

Poniżej wrzucam macierze dopasowań. Traktujmy to raczej jako wizualny *sanity check* (ilustrację, że model faktycznie widzi różnice), a nie ostateczny dowód.

<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
<img src="/images/1763804942_220466000.jpg" alt="Ujęcie 1 - Cel dla T=0s" style="max-width: 48%; height: auto;"/>
<img src="/images/1763804912_220466000.jpg" alt="Ujęcie 2 - Cel dla T+70s" style="max-width: 48%; height: auto;"/>
</div>

<br>

**Ujęcie 3 (Inna jednostka)**

<div style="text-align: center;">
<img src="/images/1763820365_255806370.jpg" alt="Ujęcie 3 - Inna jednostka" style="max-width: 100%; height: auto;"/>
</div>

*Zdjęcia docelowej jednostki oraz dodatkowego statku wykorzystane do porównania.*

<br>

**Macierz podobieństwa kosinusowego (Trzy jednostki)**

<div style="text-align: center;">
<img src="/images/similarity_matrix_same_and_different.png" alt="Schemat podobieństwa dla trzech jednostek" style="max-width: 100%; height: auto;"/>
</div>

Dwa ujęcia tej samej jednostki uzyskują wysokie podobieństwo, a trzeci, obcy kadr wyraźnie odstaje - dokładnie tego oczekujemy.

---

#### Porównanie dwóch różnych statków z dwóch różnych dni

Aby ocenić odporność modelu na zróżnicowane warunki środowiskowe, porównałem dwie odrębne jednostki zarejestrowane w zupełnie różnych dniach.

<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
<img src="/images/1765715109_305425000.jpg" alt="Jednostka 305425000" style="max-width: 48%; height: auto;"/>
<img src="/images/1765721252_265079640.jpg" alt="Jednostka 265079640" style="max-width: 48%; height: auto;"/>
</div>

<br>

**Macierz podobieństwa kosinusowego (Różne dni)**

<div style="text-align: center;">
<img src="/images/sim_matrix_different_days.png" alt="Schemat podobieństwa dla różnych dni" style="max-width: 100%; height: auto;"/>
</div>

Niskie podobieństwo potwierdza, że model rozróżnia same jednostki, a nie tylko tło i warunki oświetleniowe, w jakich zostały uchwycone.

---

## Etap 2. Re-identyfikacja akustyczna z użyciem podmorskiego kabla światłowodowego DAS

Druga część różni się fundamentalnie sprzętem. Kabel biegnący po dnie cieśniny działa tu jako ogromny sensor akustyczny. Zaletą jest to, że warunki atmosferyczne nie wpływają na niego tak jak na kamerę, a fizyczne uszkodzenie go na dnie morza jest niezwykle trudne.

Odporność na pogodę nie znaczy jednak odporności na samo środowisko. Prądy morskie i falowanie powodują, że sygnał zawsze trochę "pływa" względem pozycji statku wyliczonej z AIS. Aby nie utracić kluczowych danych akustycznych, przyjąłem margines 250 metrów z każdej strony od środka jednostki i podzieliłem to okno na 5 segmentów. Skala tego prototypowego zbioru wyniosła **545 próbek dla 22 unikalnych tożsamości statków**. Trzeba pamiętać, że przy tak wąskiej puli statków testowych metryka Top-5 z natury będzie bardzo wysoka (bo wybór potencjalnych "pomyłek" jest mały).

Przetestowałem surowe dane przestrzenno-czasowe (wykres typu *waterfall*) oraz spektrogramy częstotliwościowe (STFT).

### Analiza sygnału akustycznego (DAS)

| Spektrogram STFT | Dane w postaci wykresu typu 'WATERFALL' |
| :---: | :---: |
| <img src="/images/Ship_FFT.png" width="400"/> | <img src="/images/Ship_NO_FFT.png" width="400"/> |

*W przypadku wykresu waterfall, oś pozioma prezentuje pozycję wzdłuż kabla, a pionowa czas. Spektrogram STFT ukazuje rozkład częstotliwości w czasie.*

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

DINOv2 wypadło lepiej od ResNet34 w każdym trybie. Najwyższy mAP osiągnęło złożenie surowego sygnału ze spektrogramem (34.17%), ale najlepszy wynik Top-1 dał sam waterfall (47.50%) - przy tak małym zbiorze te różnice trzeba jednak traktować jako trend, a nie twardy ranking. Ciekawsze jest to, że opieranie się na samych spektrogramach bywa zdradliwe: statki o podobnej budowie generują bardzo podobne częstotliwości, co prowadzi do "nakładania spektralnego". Dopiero surowy sygnał przestrzenny uwydatniał unikalny sposób promieniowania hałasu w wodzie.

**Macierz podobieństwa dla modelu dwukanałowego (Dual)**

<div style="text-align: center;">
<img src="/images/matrix_result_dual_temporal_2.png" alt="Dual Matrix" style="max-width: 100%; height: auto;"/>
</div>

Wykres porównuje te same dwie jednostki w kolejnych oknach czasowych. Kontrast między nimi jest tu wyraźniejszy niż przy użyciu wyłącznie surowego sygnału albo wyłącznie spektrogramu, co sugeruje, że dodanie kanału STFT wzmacnia cechy obecne już w danych przestrzennych.

---

## Etap 3. Re-identyfikacja krzyżowa (Cross-Camera Re-ID)

Dotarliśmy do ostatniego etapu, stanowiącego wczesną fuzję danych - re-identyfikacji tej samej jednostki na ujęciach z obu kamer naraz. Pod kątem samej sieci jest to kopia modelu z pierwszej sekcji, główna różnica polega na podejściu do próbkowania danych.

Największym problemem okazał się brak balansu w zbiorze - na 60 par z jednej kamery przypadała tylko 1 para krzyżowa. Bez interwencji sieć optymalizowała się łatwiejszymi obrazami, niemal ignorując pary z dwóch różnych perspektyw. Przetestowałem więc dwa warianty: trening hybrydowy na naturalnych, niezbalansowanych proporcjach oraz ścisłe zbalansowanie zbioru (na 2 pary Cross-Camera przypadały 2 pary Single-Camera).

### Przykładowa para treningowa: Cross-Camera Re-ID

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Widok 1: Sprogø (Odwrócenie + Zmiana jasności) | Widok 2: Camera East (Oryginał) |
| :---: | :---: |
| <img src="/images/single_cam_cam2.jpg" style="transform: scaleX(-1); filter: brightness(0.65);" alt="Sprogø - Augmentacja" width="400"/> | <img src="/images/single_cam_cam1.jpg" alt="Camera East - Oryginał" width="400"/> |

</div>

---

### Wyniki ewaluacji: Cross-Camera Re-ID

Zapis "Sprogø → Camera East" oznacza, że model otrzymuje zapytanie z kamery Sprogø i szuka dopasowania w zbiorze kadrów z Camera East.

**Tabela 1: Konfiguracja bazowa (Baseline Cross-Camera)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura Modelu | Metoda Ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Sprogø &rarr; Camera East | 14.03 | 33.94 | 18.80 |
| ResNet34 | Camera East &rarr; Sprogø | 12.76 | 52.04 | 18.81 |
| DINOv2 | Sprogø &rarr; Camera East | 13.12 | 36.20 | 21.18 |
| DINOv2 | Camera East &rarr; Sprogø | 21.94 | 45.92 | 24.49 |

</div>

<br>

**Tabela 2: Trening hybrydowy (Imbalanced Data-Sampling)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura Modelu | Sposób próbkowania | Metoda Ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Camera East | 32.13 | 48.42 | 26.67 |
| ResNet34 | Cross + Camera East | Camera East &rarr; Sprogø | 14.29 | 47.96 | 21.11 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Camera East | 19.46 | 36.65 | 21.42 |
| DINOv2 | Cross + Camera East | Camera East &rarr; Sprogø | 13.27 | 42.86 | 23.08 |

</div>

<br>

**Tabela 3: Trening hybrydowy (Balanced Data-Sampling)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura Modelu | Sposób próbkowania | Metoda ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Camera East | 15.84 | 32.58 | 24.55 |
| ResNet34 | Cross + Camera East | Camera East &rarr; Sprogø | 18.37 | 37.24 | 26.48 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Camera East | 32.58 | 61.09 | 24.39 |
| DINOv2 | Cross + Camera East | Camera East &rarr; Sprogø | 17.35 | 48.47 | 23.24 |

</div>

Porównanie Tabeli 1 z pozostałymi pokazuje najważniejszą rzecz z tego etapu: **dorzucenie par single-camera do zbioru krzyżowego potrafi ponad dwukrotnie podnieść Top-1** (14.03% → 32.13% dla ResNet34 oraz 13.12% → 32.58% dla DINOv2 w wariancie zbalansowanym). Model musi się najpierw nauczyć, jak wygląda "ten sam statek" w łatwiejszym scenariuszu, aby mieć czym operować w trudniejszym.

Ciekawie wypada też samo zbalansowanie zbioru - nie działa ono jednakowo dla obu architektur. ResNet34 osiągnął lepszy wynik na naturalnych, niezbalansowanych proporcjach (32.13% vs 15.84%), natomiast DINOv2 skorzystał ze ścisłego balansu (32.58% vs 19.46%). Poziom bezwzględny pozostaje jednak niski i to zadanie wciąż jest otwarte.

### Analiza Cross-Camera: Weryfikacja tożsamości statku

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø | Camera East |
| :---: | :---: |
| <img src="/images/1765704238_310816000.jpg" alt="Widok ze Sprogø" width="400"/> | <img src="/images/1765704150_310816000.jpg" alt="Widok z Camera East" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <img src="/images/Same_vessel_diff_day.png" alt="Macierz Cross-Camera" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>

Podobieństwo między dwoma kadrami powyższej jednostki, zarejestrowanymi przez obie kamery.

---

### Re-identyfikacja krzyżowa w warunkach nocnych

Ten etap dostarczył mi najciekawszej obserwacji całego projektu. Okazało się, że o ile re-identyfikacja krzyżowa radzi sobie dość przeciętnie w ciągu dnia, o tyle **w nocy staje się zdecydowanie skuteczniejsza**.

Z czego to wynika? W nocy znikają mylące, bardzo podobne do siebie tekstury kadłubów statków handlowych. Zamiast nich na pierwszy plan wysuwają się unikalne układy świateł ostrzegawczych i oświetlenia burt, które stanowią dla sieci świetny, niezależny od kąta patrzenia punkt odniesienia.

**Jednostka 259222000**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø | Camera East |
| :---: | :---: |
| <img src="/images/1763828275_259222000.jpg" alt="Jednostka 259222000 - Sprogø" width="400"/> | <img src="/images/1763828342_259222000.jpg" alt="Jednostka 259222000 - Camera East" width="400"/> |

</div>

<br>

**Jednostka 209184000**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Sprogø | Camera East |
| :---: | :---: |
| <img src="/images/1763824375_209184000.jpg" alt="Jednostka 209184000 - Sprogø" width="400"/> | <img src="/images/1763824492_209184000.jpg" alt="Jednostka 209184000 - Camera East" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <img src="/images/2_vessels_at_night.png" alt="Podobieństwo dla dwóch statków uchwyconych nocą" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>

Diagram podobieństwa dla dwóch jednostek widocznych nocą.

### Co dalej?

Gdybym miał rozwijać ten system dalej, idealnym rozwiązaniem byłoby stworzenie złożonego "mega-modelu". Mógłby on składać się z kilku mniejszych sieci (wizualnych i akustycznych), które na samym końcu łączyłyby swoje predykcje w ramach tzw. *late fusion*. Każdy z tych czujników z osobna jest przeciętny, ale każdy zawodzi w innych warunkach - i właśnie na tym polega sens fuzji.

Kolejnym potężnym krokiem byłoby włączenie cech z systemu AIS (typ statku, długość, prędkość, kurs) jako dodatkowej modalności uczącej. Nawet jeśli statek wyłączyłby nadajnik tuż przed wpłynięciem w kontrolowaną strefę, model zasilony taką "historyczną" wiedzą wciąż potrafiłby zawęzić poszukiwania i podjąć trafną decyzję.

Na sam koniec warto spojrzeć szerzej. Zaprojektowanie podobnego, wielomodalnego systemu fuzji danych - opartego o relatywnie tanie, pasywne i trudne do zakłócenia sensory - mogłoby stanowić świetne wsparcie w ochronie infrastruktury przed obiektami, które celowo wymykają się tradycyjnym radarom. Ten projekt dotyczył statków w duńskiej cieśninie, ale sama zasada przenosi się poza domenę morską bez zmian: **kilka niedoskonałych czujników, zawodzących w różnych momentach, razem daje coś znacznie lepszego niż każdy z nich osobno.**