---
title: "Bezradarowe śledzenie statków, czyli jak podwodny światłowód i zwykłe kamery pomagają zwalczać flotę cieni?"
date: 2026-08-02
draft: false
description: "Moja praca magisterska z DTU. Pokazuję w niej, jak wykorzystywać dane z podwodnych kabli światłowodowych (DAS), kamer umieszczonych w okolicy mostu oraz systemu AIS, aby skutecznie śledzić statki bez mrugnięcia okiem, nawet gdy znikną z radaru."
---

Ze względu na to, że projekt ten był bardzo złożony, zdecydowałem się podzielić jego opis na trzy kolejne etapy, gdzie każdy z nich stanowi osobny krok w budowie zaawansowanego systemu śledzenia jednostek morskich:

1. **Etap 1: Re-identyfikacja wizualna w obrębie jednej kamery (Single-Camera Re-ID)**
Pierwsza część skupia się na śledzeniu tego samego statku wyłącznie na kadrach pochodzących z jednego, konkretnego źródła wideo. Algorytm ma za zadanie jak najpoprawniej rozpoznawać konkretną jednostkę, skutecznie ignorując zakłócenia z zewnątrz, takie jak chociażby zmienne warunki atmosferyczne. Na tym etapie weryfikujemy, czy stworzenie takiego mechanizmu jest w ogóle wykonalne, a także, jeśli tak - to czy wybrane rozwiązanie faktycznie potrafi prawidłowo dopasowywać do siebie wycinki statków - analizując dane zebrane przez każdą z kamer z osobna.

2. **Etap 2: Re-identyfikacja akustyczna z użyciem kabla DAS (Distributed Acoustic Sensing)**
Druga część to zwrot w zupełnie inną stronę i jednocześnie dość mocno eksperymentalny, wręcz prototypowy etap projektu. Na tym etapie prezentuję podejście do identyfikacji statków bazujące na danych wibracyjnych i akustycznych (generowanych m.in. przez pracę silnika czy śruby napędowej statku). Sygnały te są rejestrowane przez podwodny kabel światłowodowy biegnący po dnie cieśniny, który w naturalny sposób pełni tutaj funkcję czujnika obejmującego bardzo duży rejon okolicy, przez którą przechodzi największy duński morski korytarz.

3. **Etap 3: Re-identyfikacja krzyżowa (Cross-Camera Re-ID)**
Finałowa część przedstawia architekturę, której zadaniem jest poradzenie sobie ze wzajemną identyfikacją statków na kadrach pochodzących z różnych źródeł - tym razem działając "na krzyż" (między obiema kamerami). Oceniamy tutaj, czy skonstruowany program potrafi prawidłowo sparować tę samą jednostkę widoczną z dwóch drastycznie różnych perspektyw: ujęcia łapanego niemal z poziomu morza z wyspy Sprogø z widokiem rejestrowanym przez drugą z kamer, umieszczoną wysoko na wschodnim pylonie mostu.

## Etap 1. Re-identyfikacja wizualna w obrębie jednej kamery

W tej części projektu główną uwagę skupiłem na zdefiniowaniu docelowej architektury sieci neuronowej. Ostatecznie, chcąc sprawdzić, czy wybór podejścia robi w tym zadaniu istotną różnicę. W związku z tym zdecydowałem się na przetestowanie i zestawienie ze sobą dwóch zupełnie różnych rozwiązań. 

Pierwszym z nich jest ResNet34 - klasyczna, konwolucyjna sieć neuronowa (CNN). Działa ona na zasadzie "prześlizgiwania się" po obrazie oknem filtra (np. w rozmiarze 64x64 px) od lewej do prawej i z góry na dół, skanując w ten sposób płynnie całą klatkę i zbierając najważniejsze informacje dot. obrazu i obiektów na nim się znajdujących. Drugim wariantem jest DINOv2, czyli nieco nowsza architektura typu Vision Transformer (ViT). W jej przypadku filtr to tak naprawdę nieduży wycinek, który nie przesuwa się płynnie, ale przeskakuje po obrazie niczym owad z miejsca na miejsce, zbierając w ten sposób najcenniejsze informacje z klatek video. 

Ze względu na to, że proces identyfikacji bazowałem na metodzie wykorzystującej *supervised contrastive loss* (która wpisuje się w paradygmat uczenia nadzorowanego), algorytm potrzebował precyzyjnych informacji o tym, na co właściwie patrzy. Tutaj do gry wszedł system AIS, o którym można myśleć jak o morskim odpowiedniku popularnego serwisu Flightradar24. Przetworzyłem surowe dane z logów AIS sposób, który umożliwia bezbłędne przypisanie unikalnej rejestracji statku do odpowiadającego mu obrazu.

Mając przygotowaną w ten sposób bazę rzetelnie utworzonych i prawidłowo opisanych danych, płynnie przeszedłem do budowy zbioru treningowego. Na tym etapie testowałem wyłącznie wariant, który wykorzystywał dane z każdej z kamer z osobna (*Single-Camera Re-ID*), a co za tym idzie proces dobierania w pary ograniczał się wyłącznie do kadrów pochodzących z jednego źródła wideo. 

Jak wyglądało to w praktyce? Każde bazowe zdjęcie statku poddałem zróżnicowanym modyfikacjom (wykorzystałem tutaj aplikowane w losowy sposób odbicia lustrzane w poziomie, modyfikacje jasności, kontrastu i nasycenia, a także drobne transformacje geometryczne, takie jak rotacje czy skalowanie), generując na jego podstawie dwie nowe, wizualnie zmodyfikowane wersje. W ten sposób z jednego oryginalnego ujęcia uzyskiwałem parę kadrów reprezentującą tę samą jednostkę. Jest to absolutnie kluczowe podejście, aby sieć mogła skutecznie uczyć się podobieństw z wykorzystaniem *supervised contrastive loss*. 

By łatwiej było to sobie wyobrazić i żebyśmy się w tym wszystkim nie pogubili, poniżej wrzucam schemat prosto z mojej pracy magisterskiej. Obrazuje on dokładnie to, jak krok po kroku przebiegał proces tworzenia wyżej wymienionych par.

### Przykłady par treningowych (Single-Camera Re-ID)

Poniżej znajduje się wizualizacja procesu tworzenia par bazujących na zdefiniowanych modyfikacjach zdjęć użytych w pierwszym etapie. Z każdego bazowego ujęcia wygenerowano sztuczną parę poprzez odbicie lustrzane w poziomie, co pozwoliło sieci uczyć się podobieństw z wykorzystaniem *supervised contrastive loss* niezależnie od kierunku, w którym płynie jednostka.

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


**Widok 2: Wschodni pylon mostu**

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


Po treningu trwającym 80 epok i ustaleniu najbardziej sensownych hiperparametrów, osiągnąłem w miarę satysfakcjonujące wyniki, które zestawiłem w poniższej tabeli. Z kolei na samym dole sekcji wrzuciłem wizualne porównanie kadrów ze statkami oraz wygenerowane dla nich diagramy, obrazujące podobieństwo analizowanych kadrów oraz jednostek na nich się znajdujących.

### Wyniki ewaluacji: Single-Camera Re-Identification

Poniższe tabele prezentują bazowe możliwości modeli, gdy były one trenowane i ewaluowane wyłącznie na parach z tej samej kamery (intra-camera), z wykorzystaniem trzech różnych strategii próbkowania (V1, V2, V3).

**Tabela 1: Wyniki dla architektury ResNet34**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Dane Treningowe | Dane ewaluacyjne | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 72.85 | 91.86 | 41.44 |
| **V2:** Storebælt East | Storebælt East | 87.76 | 96.94 | 47.13 |
| **V3:** Sprogø + Storebælt East| Sprogø | 68.78 | 90.05 | 33.01 |
| **V3:** Sprogø + Storebælt East | Storebælt East | 80.10 | 92.86 | 50.43 |

</div>

<br>

**Tabela 2: Wyniki dla architektury DINOv2**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Dane Treningowe | Dane ewaluacyjne | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| **V1:** Sprogø | Sprogø | 75.57 | 93.21 | 44.81 |
| **V2:** Storebælt East | Storebælt East | 86.73 | 96.43 | 53.46 |
| **V3:** Sprogø + Storebælt East| Sprogø | 71.95 | 92.76 | 43.75 |
| **V3:** Sprogø + Storebælt East | Storebælt East | 82.65 | 93.88 | 51.14 |

</div>

### Wizualne porównanie kadrów i macierze dopasowań

Poniżej przedstawiono dwa zdjęcia jednakowej jednostki oraz dodatkowy kadr znacznie odbiegającego od nich statku, aby sprawdzić czy skonstruowane rozwiązanie faktycznie jest skuteczne.

<div style="display: flex; gap: 20px; justify-content: center;">

<img src="/images/1763804942_220466000.jpg"
     alt="Ujęcie 1 - Cel dla T=0s"
     width="700"/>

<img src="/images/1763804912_220466000.jpg"
     alt="Ujęcie 2 - Cel dla T+70s"
     width="700"/>

</div>

<br>

**Ujęcie 3 (Inna jednostka)**

<div style="text-align: center;">

<img src="/images/1763820365_255806370.jpg"
     alt="Ujęcie 3 - Inna jednostka"
     width="900"/>

</div>

*Zdjęcia docelowej jednostki oraz dodatkowego statku wykorzystane do porównania trzech statków.*

<br>

**Macierz podobieństwa kosinusowego (Trzy jednostki)**

<div style="text-align: center;">

<img src="/images/similarity_matrix_same_and_different.png"
     alt="Schemat podobieństwa dla trzech jednostek"
     width="900"/>

</div>

Diagram podobieństwa dla jednostki docelowej oraz przykładowego statku o odmiennej tożsamości.

---

#### Porównanie dwóch różnych statków z dwóch różnych dni

Aby ocenić odporność modelu zarówno na różnice statkami, jak i zróżnicowane warunki środowiskowe, porównano dwie odrębne jednostki zarejestrowane w zupełnie różnych dniach. W przeciwieństwie do scenariusza z tego samego dnia, oświetlenie, warunki atmosferyczne i elementy tła naturalnie różnią się w zależności od momentu, w którym wykonano zdjęcie.

<div style="display: flex; gap: 20px; justify-content: center;">

<img src="/images/1765715109_305425000.jpg"
     alt="Jednostka 305425000"
     width="700"/>

<img src="/images/1765721252_265079640.jpg"
     alt="Jednostka 265079640"
     width="700"/>

</div>

*Dwa różne statki zarejestrowane w różnych dniach, obrazujące zmiany w warunkach środowiskowych.*

<br>

**Macierz podobieństwa kosinusowego (Różne dni)**

<div style="text-align: center;">

<img src="/images/sim_matrix_different_days.png"
     alt="Schemat podobieństwa dla różnych dni"
     width="900"/>

</div>

Wykres przedstawiający podobieństwo dwóch różnych statków zarejestrowanych w różnych dniach. Niski wynik podobieństwa potwierdza, że model potrafi skutecznie rozróżniać jednostki pomimo zmian warunków środowiskowych.

---

## Etap 2. Re-identyfikacja akustyczna z użyciem podmorskiego kabla światłowodowego DAS (Distributed Acoustic Sensing)

Choć druga część projektu wykorzystuje niemal identyczne rozwiązania na poziomie oprogramowania, to fundamentalnie różni się sprzętem, który został użyty podczas zbierania danych. Wdrożenie podwodnego kabla światłowodowego otworzyło drogę do mocno eksperymentalnego, wręcz prototypowego etapu. W tym podejściu statki identyfikowane są wyłącznie na podstawie danych wibracyjnych i akustycznych (np. szumu silnika i śrub napędowych). Kabel biegnący po dnie cieśniny działa tu w naturalny sposób jako ogromny, bardzo czuły sensor, a co w tym najfajniejsze, nie dość, że warunki atmosferyczne nie wpływają na niego tak mocno jak na kamerę, to do tego bardzo trudno jest go uszkodzić.

Należy jednak pamiętać o pewnym haczyku. Mimo że sam światłowód jest w porównaniu z kamerami znacznie bardziej odporny na warunki pogodowe, nie da się całkowicie zminimalizować wpływu środowiska na docierający do niego dźwięk. Prądy wodne, falowanie czy zmieniający się w ciągu dnia wiatr sprawiają, że rejestrowany sygnał akustyczny zawsze będzie się minimalnie przemieszczał. Z tego względu wspólnie z moimi promotorami podjęliśmy decyzję o podzieleniu sygnału na 5 segmentów, przyjmując margines 250 metrów w obie strony (w lewo i w prawo) od środka statku. W efekcie uzyskaliśmy szerokie okno o całkowitej rozpiętości około 500 metrów. Wymagało to wprawdzie minimalnej korekty, ale mając świadomość, że w zmiennym środowisku morskim nigdy nie będzie ona w stu procentach perfekcyjna, zastosowanie tak obszernego przedziału dało mi pewność, że zachowam jak najwięcej kluczowych danych akustycznych.

Podczas prób uczenia modelu szybko okazało się, że trenowanie sieci z identycznymi parametrami jak w przypadku zdjęć jest bardzo niestabilne. Konieczne było zastosowanie harmonogramowania *Cosine Annealing* i odpowiednie dostrojenie optymalizatora. Aby wyciągnąć charakterystykę sygnału i dać modelowi pole do nauki, przetestowałem spektrogramy STFT, ponownie dzieląc je na 5 kafelków. Podobnie jak przy danych z kamer, zbiory danych (przechowywane jako macierze w formacie `.npy`) poddawałem licznym augmentacjom. Wdrożyłem do tego dedykowany system, który potrafił nakładać filtry kaskadowo na cały zbiór lub dzielić dane na porcje otrzymujące pojedyncze modyfikacje. System aplikował m.in. *dropout*, *cutout* (wycinanie fragmentów sygnału), odbicia w osiach poziomej i pionowej, losowe przycinanie (*random crop*) oraz dodawanie szumu Gaussa skalowanego do odchylenia standardowego samego sygnału.

Koniec końców okazało się, że przy poszukiwaniu i identyfikacji konkretnych jednostek, "surowy" sygnał to za mało. Wymagał on mocniejszego filtrowania i dodatkowych transformacji czasowo-częstotliwościowych. Świetne rezultaty dawało złożenie wykresu *waterfall* z bazowym sygnałem prezentowanym na spektrogramie STFT. Co ciekawe, nawet jeśli dla takiego zestawienia "suche" wartości w zbiorczej tabeli metryk nie wydawały się na pierwszy rzut oka rewelacyjne, to przy testach przeprowadzanych na osobnych przykładach, to właśnie takie podejście sprawdzało się najlepiej i pozwalało w najskuteczniejszy sposób różnicować jednostki na tym etapie projektu.

### Analiza sygnału akustycznego (DAS)

Poniżej przedstawiono zestawienie ukazujące różnicę między surowym sygnałem (prezentowanym za pomocą wykresu typu 'waterfall') a reprezentacją po zastosowaniu transformacji Fouriera (prezentowaną za pomocą spektrogramu).

| Spektrogram STFT | Dane w postaci wykresu typu 'WATERFALL' |
| :---: | :---: |
| ![](/images/Ship_FFT.png) | ![](/images/Ship_NO_FFT.png) |

Zestawienie spektrogramu STFT oraz wykresu typu waterfall, bazujących na sygnale akustycznym zarejestrowanym przez system DAS dla tego samego statku w identycznym przedziale czasu.
W przypadku wykresu waterfall, oś pozioma prezentuje pozycję wzdłuż kabla światłowodowego, natomiast oś pionowa określa czas rejestracji sygnału (widoczna na nim wyraźna, czerwona linia wskazuje bezpośrednią lokalizację i trajektorię statku). Z kolei spektrogram STFT to klasyczna reprezentacja czasowo-częstotliwościowa – ukazuje rozkład częstotliwości (oś pionowa) w czasie (oś pozioma), co pozwala na szczegółową analizę unikalnej sygnatury akustycznej jednostki.

### Wyniki identyfikacji akustycznej (DAS)

Poniższa tabela prezentuje zestawienie wyników dla poszczególnych architektur oraz trybów przetwarzania sygnału.

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura | Rodzaj danych | mAP (%) | Top-1 (%) | Top-5 (%) |
| :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Waterfall | 27.37 | 22.50 | 65.00 |
| ResNet34 | Spektrogram | 29.43 | 35.00 | 70.00 |
| ResNet34 | Waterfall + Spektrogram | 27.55 | 22.50 | 75.00 |
| DINO | Waterfall | 34.03 | 47.50 | 95.00 |
| DINO | Spektrogram | 33.44 | 30.00 | 70.00 |
| DINO | Waterfall + Spektrogram | 34.17 | 30.00 | 85.00 |

</div>

Wyniki powtórnej identyfikacji dla wszystkich konfiguracji treningowych. Modyfikacje przeprowadzone na danych w postaci wykresu waterfall: dropout, gaussian_noise, cutout, random_crop, flip_lr. Augmentacje dla danych przedstawionych w postaci spektrogramu: dropout, gaussian_noise, cutout.

**Macierz podobieństwa dla modelu dwukanałowego (Dual)**
<br>
![](/images/matrix_result_dual_temporal_2.png)

Wykres podobieństwa porównujący te same dwie jednostki w kolejnych oknach czasowych, wygenerowana przez model wytrenowany na danych dwukanałowych (waterfall + spektrogram). Kontrast między statkami jest tu wyraźnie ostrzejszy niż w przypadku użycia wyłącznie surowego sygnału lub samego spektrogramu, co sugeruje, że dodanie kanału STFT skutecznie wzmacnia istotne cechy obecne już w danych przestrzennych.

## Etap 3. Re-identyfikacja krzyżowa (Cross-Camera Re-ID)

No i w końcu dotarliśmy do ostatniego etapu, który stanowi swoistą formę wczesnej fuzji danych, ponieważ łączy ze sobą obrazy pochodzące z różnych kamer. Nie ma tu żadnej fizyki kwantowej, gdyż pod kątem architektury jest to w zasadzie kopia modelu z pierwszej sekcji, gdzie działaliśmy z każdą ze zdjęciami pochodzącymi z każdej z kamer z osobna. Główna różnica polega na zupełnie innym podejściu do próbkowania danych oraz na testowaniu sieci pod kątem zdolności do re-identyfikacji tych samych jednostek na obu źródłamch wideo jednocześnie.

W ramach tego etapu przetestowałem kilka różnych strategii budowania zbiorów:
*   **Podstawowe Cross-Camera:** Pary treningowe składały się ze zdjęcia statku z pierwszej kamery oraz zdjęcia tej samej jednostki z drugiej. Niestety, to podejście sprawdziło się w praktyce nienajlepiej.
*   **Podejście hybrydowe (Cross-Camera + Single-Camera):** Dostrzegając niezbyt satysfakcjonujące rezultaty pierwszej metody, spróbowałem wzbogacić zbiór, dorzucając do niego wcześniej stworzone pary z jednej kamery (Single-Camera). W tym wypadku wyniki osiągnęły pewną poprawę.
*   **Zbalansowane próbkowanie:** Ostatnim wdrożonym przeze mnie konceptem, na który pozwoliły ramy czasowe projektu, było ścisłe zbalansowanie proporcji. W tym wariancie na np. 2 pary z wariantu Cross-Camera przypadały 2 pary danej jednostki z wybranej kamery (co przetestowałem dla obu widoków). 
*   **Pełna fuzja (plany na przyszłość):** Na sam koniec, podczas burzy mózgów z promotorem, wpadliśmy na pomysł przetrenowania całości na parach Cross-Camera z jednoczesnym uwzględnieniem par Single-Camera z obu kamer jednocześnie. Ze względu na brak czasu pozostaje to w sferze przyszłych eksperymentów, które być może kiedyś zrealizuję z czystej ciekawości.

Dla ułatwienia i wizualizacji tego procesu, poniżej zamieszczam schematy obrazujące zrealizowane oraz planowane strategie próbkowania, a także macierze podobieństwa statków.

### Przykładowa para treningowa: Cross-Camera Re-ID

W przypadku re-identyfikacji krzyżowej, model otrzymywał w parze ujęcia tej samej jednostki pochodzące z dwóch różnych źródeł wideo. Poniżej znajduje się przykład takiej pary. Aby zwiększyć uniwersalność modelu, na zdjęcie z kamery Sprogø nałożono dodatkowe augmentacje: odbicie lustrzane w poziomie (symulujące inny kierunek ruchu) oraz modyfikację jasności.

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Widok 1: Sprogø (Odwrócenie + Zmiana jasności) | Widok 2: Camera East (Oryginał) |
| :---: | :---: |
| <img src="/images/single_cam_cam2.jpg" style="transform: scaleX(-1); filter: brightness(0.65);" alt="Sprogø - Augmentacja" width="400"/> | <img src="/images/single_cam_cam1.jpg" alt="Camera East - Oryginał" width="400"/> |

</div>

---

### Wyniki ewaluacji: Cross-Camera Re-ID

Poniższe zestawienia prezentują szczegółowe wyniki dla różnych wariantów treningu krzyżowego (cross-camera). Porównano klasyczną architekturę ResNet34 z modelem DINOv2 w konfiguracji bazowej oraz w scenariuszach hybrydowych.

**Tabela 1: Konfiguracja bazowa (Baseline Cross-Camera)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura Modelu | Metoda Ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Sprogø &rarr; Storebælt East | 14.03 | 33.94 | 18.80 |
| ResNet34 | Storebælt East &rarr; Sprogø | 12.76 | 52.04 | 18.81 |
| DINOv2 | Sprogø &rarr; Storebælt East | 13.12 | 36.20 | 21.18 |
| DINOv2 | Storebælt East &rarr; Sprogø | 21.94 | 45.92 | 24.49 |

</div>

<br>

**Tabela 2: Trening hybrydowy (Imbalanced Data-Sampling)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura Modelu | Sposób próbkowania | Metoda Ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Storebælt East | 32.13 | 48.42 | 26.67 |
| ResNet34 | Cross + Storebælt | Storebælt East &rarr; Sprogø | 14.29 | 47.96 | 21.11 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Storebælt East | 19.46 | 36.65 | 21.42 |
| DINOv2 | Cross + Storebælt | Storebælt East &rarr; Sprogø | 13.27 | 42.86 | 23.08 |

</div>

<br>

**Tabela 3: Trening hybrydowy (Balanced Data-Sampling)**

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Architektura Modelu | Sposób próbkowania | Metoda ewaluacji | Top-1 (%) | Top-5 (%) | mAP (%) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| ResNet34 | Cross + Sprogø | Sprogø &rarr; Storebælt East | 15.84 | 32.58 | 24.55 |
| ResNet34 | Cross + Storebælt | Storebælt East &rarr; Sprogø | 18.37 | 37.24 | 26.48 |
| DINOv2 | Cross + Sprogø | Sprogø &rarr; Storebælt East | 32.58 | 61.09 | 24.39 |
| DINOv2 | Cross + Storebælt | Storebælt East &rarr; Sprogø | 17.35 | 48.47 | 23.24 |

</div>

### Analiza Cross-Camera: Weryfikacja tożsamości statku

Poniżej przedstawiono widok tej samej jednostki zarejestrowanej przez dwie różne kamery (widok z pierwszej i drugiej kamery), wraz z odpowiadającym jej wykresem demonstrującym podobieństwo jednostek.

<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Widok z pierwszej kamery | Widok z drugiej kamery |
| :---: | :---: |
| <img src="/images/1765704238_310816000.jpg" alt="Widok z pierwszej kamery" width="400"/> | <img src="/images/1765704150_310816000.jpg" alt="Widok z drugiej kamery" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <strong>Podobieństwo między dwoma kadrami powyższej jednostki</strong>
    <br>
    <br>
    <img src="/images/Same_vessel_diff_day.png" alt="Macierz Cross-Camera" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>

---

### Re-identyfikacja krzyżowa w warunkach nocnych

Identyfikacja jednostek w nocy stanowi szczególne wyzwanie ze względu na ograniczone oświetlenie. Poniżej zestawiono dwie różne jednostki (MMSI 259222000 oraz 209184000) uchwycone jednocześnie przez sąsiadujące kamery, a także wspólną macierz oceniającą skuteczność dopasowań w warunkach nocnych.

**Jednostka 259222000**
<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Kamera 1 | Kamera 2 |
| :---: | :---: |
| <img src="/images/1763828275_259222000.jpg" alt="Jednostka 259222000 - Kamera 1" width="400"/> | <img src="/images/1763828342_259222000.jpg" alt="Jednostka 259222000 - Kamera 2" width="400"/> |

</div>

<br>

**Jednostka 209184000**
<div align="center" style="max-width: 100%; overflow-x: auto; font-size: 0.9em;">

| Kamera 1 | Kamera 2 |
| :---: | :---: |
| <img src="/images/1763824375_209184000.jpg" alt="Jednostka 209184000 - Kamera 1" width="400"/> | <img src="/images/1763824492_209184000.jpg" alt="Jednostka 209184000 - Kamera 2" width="400"/> |

</div>

<div style="text-align: center; width: 100%;">
    <strong>Diagram podobieństwa dla dwóch jednostek widocznych nocą</strong>
    <br>
    <br>
    <img src="/images/2_vessels_at_night.png" alt="Podobieństwo dla dwóch statków uchwyconych nocą" style="display: block; margin: 0 auto; max-width: 100%; height: auto;"/>
</div>


### Wnioski z uczenia krzyżowego (między kamerami)

Ten etap dostarczył mi niezwykle ciekawych obserwacji. Okazało się, że o ile re-identyfikacja krzyżowa radzi sobie dość przeciętnie w ciągu dnia, o tyle **w nocy staje się zdecydowanie skuteczniejsza** i potrafi bardzo trafnie dopasować statek na obu widokach. Z czego to wynika? Model świetnie wyłapuje fakt, że jednostki pływające po zmroku mają bardzo zróżnicowane kolory świateł ostrzegawczych oraz unikalny układ oświetlenia burt czy masztów, co stanowi dla sieci doskonały punkt odniesienia.
Z kolei warunki dzienne stanowią znacznie większe wyzwanie, ponieważ wiele charakterystycznych elementów wizualnych obecnych w nocy nie jest zazwyczaj wykorzystywanych przez kapitanów jednostek w ciągu dnia. W rezultacie dopasowanie miniatury statku wykonanej z kamery zlokalizowanej na wysepce Sprogø, gdzie jednostka jest znacznie oddalona, a obraz ulega degradacji wskutek zjawisk atmosferycznych, do obrazu statku uchwyconego z kamery skierowanej na pylon (Camera East) nadal należy postrzegać jako bardzo skomplikowany problem re-identyfikacji. Uzyskane wyniki sugerują, że dalsza poprawa skuteczności może wymagać wzbogacenia procesu identyfikacji o dodatkowe źródła informacji, takie jak dane satelitarne, obrazy z bezzałogowych statków powietrznych lub informacje pochodzące z jeszcze innych czujników.

### Co dalej? 

Gdybym miał rozwijać ten system dalej, idealnym rozwiązaniem byłoby stworzenie potężnego, złożonego "mega-modelu". Mógłby on składać się z kilku mniejszych, wyspecjalizowanych sieci, które na samym końcu łączyłyby swoje predykcje za pomocą odpowiednich wag (w ramach tzw. *late fusion*). Wydaje się, że takie podejście wspólnie z dołączeniem dodatkowych danych niesie potencjał by dostarczyć świetne rezultaty.

Kolejnym krokiem, na który zabrakło już czasu, byłoby wyciąganie wektorów cech bezpośrednio z systemu AIS, który przecież niesie ze sobą ogromną dawkę precyzyjnych informacji o statku. Nawet jeśli dane z jednej z kamer lub kabla uległyby zniekształceniu, model wytrenowany na tak bogatym zbiorze informacji wciąż potrafiłby podjąć trafną decyzję. W mojej ocenie takie rozwiązanie miałoby szansę zadziałać wręcz perfekcyjnie.

Na sam koniec, co z mojego punktu widzenia jest niezwykle istotne. warto przenieść te wnioski na nieco szerszy grunt. Obecnie wiele państw boryka się z brakiem skutecznych rozwiązań do zwalczania niewielkich celów, takich jak drony czy pociski. Zaprojektowanie podobnego, wielomodalnego systemu fuzji danych mogłoby stanowić przełomowe wsparcie dla różnego rodzaju wojsk (od marynarki, przez siły lądowe i powietrzne, aż po siły operujące w kosmosie, a nawet dla wszystkich typów uzbrojenia operujących jednocześnie). Byłaby to doskonała odpowiedź na problemy, z którymi wciąż sobie nie radzimy, ponieważ obecne środki reagowania są często zbyt drogie w użyciu lub stwarzają bezpośrednie zagrożenie dla przecietnego obywatela i jego dobytku.