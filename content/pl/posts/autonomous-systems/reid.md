---
title: "Śledzenie statków bez AIS: Jak podwodny światłowód i zwykłe kamery pomagają zwalczać flotę cieni?"
date: 2026-07-31
draft: false
description: "Moja praca magisterska z DTU. Pokazuję w niej, jak wykorzystywać dane z podwodnych kabli światłowodowych (DAS), kamer umieszczonych w okolicy mostu oraz systemu AIS, aby skutecznie śledzić statki, nawet gdy znikną z radarów."
---

Ze względu na to, że projekt ten był bardzo złożony, zdecydowałem się podzielić jego opis na trzy kolejne etapy. Każdy z nich stanowi osobny krok w budowie zaawansowanego systemu śledzenia jednostek morskich:

1. **Etap 1: Re-identyfikacja wizualna w obrębie jednej kamery (Single-Camera Re-ID)**
Pierwsza część skupia się na śledzeniu tego samego statku wyłącznie na kadrach pochodzących z jednego, konkretnego źródła wideo. Algorytm ma za zadanie jak najbardziej prawdiłowo rozpoznawać konkretną jednostkę, skutecznie ignorując zakłócenia z zewnątrz, takie jak chociażby zmienne warunki atmosferyczne. Na tym etapie weryfikujemy, czy stworzenie takiego mechanizmu jest w ogóle wykonalne, a także czy wybrane rozwiązanie faktycznie potrafi prawidłowo dopasowywać do siebie obrazy statków - analizując dane zbierane przez każdą z kamer z osobna.

2. **Etap 2: Re-identyfikacja akustyczna z użyciem kabla DAS (Distributed Acoustic Sensing)**
Druga część to zwrot w zupełnie inną stronę i jednocześnie dość mocno eksperymentalny, prototypowy etap projektu. Prezentuję w niej podejście do identyfikacji statków bazujące na danych wibracyjnych i akustycznych (generowanych m.in. przez pracę silnika czy śruby napędowej statku). Sygnały te są rejestrowane przez podwodny kabel światłowodowy biegnący po dnie cieśniny, który w naturalny sposób pełni tutaj funkcję gigantycznego czujnika.

3. **Etap 3: Re-identyfikacja krzyżowa (Cross-Camera Re-ID)**
Finałowa część prezentuje architekturę, która ma poradzić sobie ze wzajemną identyfikacją statków na kadrach pochodzących z różnych źródeł - tym razem działając "na krzyż". Oceniamy tutaj, czy model potrafi prawidłowo sparować tę samą jednostkę widoczną z dwóch drastycznie różnych perspektyw: ujęcia łapanego niemal z poziomu morza z wyspy Sprogø z widokiem rejestrowanym przez drugą z kamer, umieszczoną wysoko na pylonie mostu.

## Etap 1. Re-identyfikacja wizualna w obrębie jednej kamery

W tej części projektu główną uwagę skupiłem na zdefiniowaniu docelowej architektury sieci neuronowej. Ostatecznie, chcąc sprawdzić, czy wybór podejścia robi w tym zadaniu istotną różnicę, zdecydowałem się na przetestowanie i zestawienie ze sobą dwóch zupełnie różnych rozwiązań. 

Pierwszym z nich jest ResNet34 - klasyczna, konwolucyjna sieć neuronowa (CNN). Działa ona na zasadzie "prześlizgiwania się" po obrazie oknem filtra (np. w rozmiarze 64x64 px) od lewej do prawej i z góry na dół, skanując w ten sposób płynnie całą klatkę i zbierając najważniejsze informacje dot. obrazu. Drugim wariantem jest DINOv2, czyli nieco nowsza architektura typu Vision Transformer (ViT). W jej przypadku filtr to tak naprawdę *patch* (wycinek), który nie przesuwa się płynnie, ale przeskakuje po obrazie niczym owad z miejsca na miejsce, zbierając w ten sposób najcenniejsze informacje. 

Ze względu na to, że proces identyfikacji bazowałem na metodzie wykorzystującej *supervised contrastive loss* (która wpisuje się w paradygmat uczenia nadzorowanego), algorytm potrzebował precyzyjnych informacji o tym, na co właściwie patrzy. Tutaj do gry wszedł system AIS, o którym można myśleć jak o morskim odpowiedniku popularnego serwisu Flightradar24. Przetworzyłem surowe dane z logów AIS w taki sposób, aby bezbłędnie przypisać unikalną rejestrację statku do konkretnego wycinka statku, na którym ta jednostka faktycznie się znajdowała. 

Mając przygotowaną w ten sposób bazę rzetelnie utworzonych i prawidłowo opisanych danych (*ground truth*), przeszedłem do budowy zbioru treningowego. W tym etapie testowałem wyłącznie wariant, który wykorzystywał dane z każdej z kamer z osobna (*Single-Camera Re-ID*), a co za tym idzie proces dobierania w pary ograniczał się ściśle do kadrów pochodzących z jednego źródła wideo. 

Jak to wyglądało w praktyce? Każde bazowe zdjęcie statku poddałem zróżnicowanym augmentacjom (wykorzystałem tutaj losowe odbicia lustrzane w poziomie, modyfikacje jasności, kontrastu i nasycenia za pomocą *Color Jitter* oraz drobne transformacje afiniczne, takie jak rotacje czy skalowanie), generując na jego podstawie dwie nowe, wizualnie zmodyfikowane wersje. W ten sposób z jednego oryginalnego ujęcia uzyskiwałem parę kadrów reprezentującą tę samą jednostkę. Jest to absolutnie kluczowe podejście, aby sieć mogła skutecznie uczyć się podobieństw z wykorzystaniem *supervised contrastive loss*. 

By łatwiej było to sobie wyobrazić i żebyśmy się w tym wszystkim nie pogubili, poniżej wrzucam schemat prosto z mojej pracy magisterskiej. Obrazuje on dokładnie to, jak krok po kroku przebiegał proces tworzenia takich uczących par.

### Przykłady par treningowych (Single-Camera Re-ID)

Poniżej znajduje się wizualizacja procesu tworzenia par bazujących na zdefiniowanych modyfikacjach zdjęć użytych w pierwszym etapie. Z każdego bazowego ujęcia wygenerowano sztuczną parę poprzez odbicie lustrzane w poziomie (horizontal flip), co pozwoliło sieci uczyć się podobieństw z wykorzystaniem *supervised contrastive loss* niezależnie od kierunku, w którym płynie jednostka.

**Widok 1: Wysepka Sprogø**

<table>
<tr>
<th>Ujęcie oryginalne</th>
<th>Augmentacja (Horizontal Flip)</th>
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
<th>Augmentacja (Horizontal Flip)</th>
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


Po treningu trwającym 80 epok i ustaleniu najbardziej sensownych hiperparametrów, osiągnąłem w miarę satysfakcjonujące wyniki, które zestawiłem w poniższej tabeli. Z kolei na samym dole sekcji wrzuciłem wizualne porównanie kadrów ze statkami oraz wygenerowane dla nich macierze, obrazujące prawdopodobieństwo ich poprawnego dopasowania.

### Wyniki ewaluacji: Single-Camera Re-Identification

Poniższe tabele prezentują bazowe możliwości modeli, gdy były one trenowane i ewaluowane wyłącznie na parach z tej samej kamery (intra-camera), z wykorzystaniem trzech różnych strategii próbkowania (V1, V2, V3).

**Tabela 1: Wyniki dla architektury ResNet34**

| Training Strategy | Evaluation Set | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :--- | :--- | :---: | :---: | :---: |
| **V1:** Sprogø Only | Sprogø Internally | 72.85 | 91.86 | 41.44 |
| **V2:** Storebælt East Only | Storebælt East Internally | 87.76 | 96.94 | 47.13 |
| **V3:** Joint Single | Sprogø Internally | 68.78 | 90.05 | 33.01 |
| **V3:** Joint Single | Storebælt East Internally | 80.10 | 92.86 | 50.43 |

<br>

**Tabela 2: Wyniki dla architektury DINOv2**

| Training Strategy | Evaluation Set | Top-1 Acc (%) | Top-5 Acc (%) | mAP (%) |
| :--- | :--- | :---: | :---: | :---: |
| **V1:** Sprogø Only | Sprogø Internally | 75.57 | 93.21 | 44.81 |
| **V2:** Storebælt East Only | Storebælt East Internally | 86.73 | 96.43 | 53.46 |
| **V3:** Joint Single | Sprogø Internally | 71.95 | 92.76 | 43.75 |
| **V3:** Joint Single | Storebælt East Internally | 82.65 | 93.88 | 51.14 |

### Wizualne porównanie kadrów i macierze dopasowań

Poniżej przedstawiono dwa zdjęcia jednakowej jednostki oraz dodatkowo jeden kadr znacznie różniącego się statku, aby sprawdzić czy model faktycznie się sprawdza.

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

*Zdjęcia docelowej jednostki oraz dystraktora wykorzystane do porównania trzech statków.*

<br>

**Macierz podobieństwa kosinusowego (Trzy jednostki)**

<div style="text-align: center;">

<img src="/images/similarity_matrix_same_and_different.png"
     alt="Macierz podobieństwa kosinusowego dla trzech jednostek"
     width="900"/>

</div>

Diagram podobieństwa dla docelowej jednostki w przedstawionej z nieznacznym odstępem czasowym w porównaniu z kompletnie innym statkiem.

---

#### Porównanie dwóch różnych statków z dwóch różnych dni

Aby ocenić odporność modelu zarówno na różnice międzyklasowe, jak i zróżnicowane warunki środowiskowe, porównano dwie odrębne jednostki zarejestrowane w zupełnie różnych dniach. W przeciwieństwie do scenariusza z tego samego dnia, oświetlenie, warunki atmosferyczne i elementy tła naturalnie różnią się w zależności od doby.

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
     alt="Macierz podobieństwa kosinusowego dla różnych dni"
     width="900"/>

</div>

Wykres przedstawiający podobieństwo dwóch różnych statków zarejestrowanych w różnych dniach. Niski wynik podobieństwa potwierdza, że model potrafi skutecznie rozróżniać jednostki pomimo zmian warunków środowiskowych.

---

## Etap 2. Re-identyfikacja akustyczna z użyciem kabla DAS (Distributed Acoustic Sensing)

Druga część tego projektu skupiła się na bardzo podobnym podejściu w kwestii konstrukcji oprogramowania, aczkolwiek warto tu wyszczególnić jedną, dość istotną różnicę, jaką są dane zbierane przez podwodny kabel światłowodowy, co w efekcie pozwoliło na przeprowadzenie dość mocno eksperymentalnego, wręcz prototypowego etapu projektu. Konkretniej w tym wypadku - podejście do identyfikacji statków bazuje na danych wibracyjnych i akustycznych (generowanych m.in. przez pracę silnika czy śruby napędowej statku). Sygnały te są rejestrowane przez podwodny kabel światłowodowy biegnący po dnie cieśniny, który w naturalny sposób pełni tutaj funkcję gigantycznego czujnika.

W pracy z sygnałem DAS dzieliłem go na 5 kawałków z offsetem 250 m od środka statku. Trzeba było wykonać w tym celu minimalną korektę, ale generalnie bardzo istotne jest zwrócenie uwagi na fakt, iż taka korekta nigdy nie będzie w stu procentach perfekcyjna. Ze względu na to, że warunki środowiskowe bywają różne - raz są stabilne, raz gorsze, a wiatr może zmieniać się nawet w trakcie dnia - sygnał zawsze będzie się minimalnie przemieszczał. Dlatego zastosowałem szerokie okno 250 m, aby mieć pewność, że zachowam jak najwięcej kluczowych danych akustycznych.

Podczas prób uczenia szybko okazało się, że trenowanie modelu z identycznymi parametrami jak w przypadku zdjęć jest bardzo niestabilne. Konieczne było zastosowanie harmonogramowania *Cosine Annealing* i odpowiednie dostrojenie optymalizatora. Aby wyciągnąć charakterystykę sygnału i dać modelowi pole do nauki, przetestowałem spektrogramy STFT, dzieląc je na identyczne kafelki (*patches*). Podobnie jak przy kamerach, zbiory danych (przechowywane jako macierze w formacie `.npy`) poddawałem licznym augmentacjom. Wdrożyłem dedykowany system, który mógł nakładać filtry kaskadowo na cały zbiór (*stack*) lub dzielić dane na porcje otrzymujące pojedyncze modyfikacje (*split*). System ten aplikował m.in. *dropout* i *cutout* (wycinanie fragmentów sygnału), odbicia w osiach poziomej i pionowej, losowe przycinanie (*random crop*) oraz dodawanie szumu Gaussa skalowanego do odchylenia standardowego samego sygnału. 

Koniec końców okazało się, że przy poszukiwaniu konkretnych jednostek, surowy sygnał to za mało i trzeba z nim nieco więcej podziałać - mocniej pofiltrować albo dodać inne transformacje czasowo-częstotliwościowe. Zauważyłem, że świetne rezultaty dawało złożenie wykresu *waterfall* z bazowym sygnałem prezentowanym na *spektrogramie STFT*. Co ciekawe, nawet jeśli suche wartości w zbiorczej tabelce metryk nie wydawały się rewelacyjne, to przy testach przeprowadzanych na osobnych przykładach takie podejście sprawdzało się najlepiej i pozwalało w najskuteczniejszy sposób różnicować jednostki.

> **[TUTAJ MIEJSCE NA SPEKTROGRAMY / WYKRESY WATERFALL]**

> **[TUTAJ MIEJSCE NA TABELĘ Z WYNIKAMI AKUSTYCZNYMI]**

## Etap 3. Re-identyfikacja krzyżowa (Cross-Camera Re-ID)

Dotarliśmy do ostatniego etapu, który stanowi swoistą formę wczesnej fuzji danych, ponieważ łączy ze sobą obrazy pochodzące z różnych kamer. Nie ma tu żadnej fizyki kwantowej — pod kątem architektury jest to w zasadzie kopia modelu z pierwszej sekcji. Główna różnica polega na zupełnie innym podejściu do próbkowania danych (*data sampling*) oraz na testowaniu sieci pod kątem zdolności do re-identyfikacji tych samych jednostek pomiędzy odrębnymi źródłami wideo.

W ramach tego etapu przetestowałem kilka różnych strategii budowania zbiorów:
*   **Podstawowe Cross-Camera:** Pary uczące składały się ze zdjęcia statku z pierwszej kamery oraz zdjęcia tej samej jednostki z drugiej. Niestety, to podejście sprawdziło się w praktyce mocno średnio.
*   **Podejście hybrydowe (Cross-Camera + Single-Camera):** Widząc przeciętne rezultaty pierwszej metody, spróbowałem wzbogacić zbiór, dorzucając do niego wcześniej stworzone pary z jednej kamery (Single-Camera). Wyniki uległy pewnej poprawie, ale wciąż dalekie były od ideału.
*   **Zbalansowane próbkowanie:** Ostatnim wdrożonym przeze mnie konceptem, na który pozwoliły ramy czasowe projektu, było ścisłe zbalansowanie proporcji. W tym wariancie na np. 2 pary z wariantu Cross-Camera przypadały 2 pary danej jednostki z wybranej kamery (co przetestowałem dla obu widoków). 
*   **Pełna fuzja (plany na przyszłość):** Na sam koniec, podczas burzy mózgów z promotorem, wpadliśmy na pomysł przetrenowania całości na parach Cross-Camera z jednoczesnym uwzględnieniem par Single-Camera z obu kamer jednocześnie. Ze względu na brak czasu pozostaje to w sferze przyszłych eksperymentów, które być może kiedyś zrealizuję z czystej ciekawości.

Dla ułatwienia i wizualizacji tego procesu, poniżej zamieszczam schematy obrazujące zrealizowane oraz planowane strategie próbkowania, a także macierze podobieństwa statków.

> **[TUTAJ MIEJSCE NA ZDJĘCIA STRATEGII PRÓBKOWANIA ORAZ MACIERZE PODOBIEŃSTWA]**

### Wnioski z uczenia krzyżowego (między kamerami)

Ten etap dostarczył mi niezwykle ciekawych obserwacji. Okazało się, że o ile re-identyfikacja krzyżowa radzi sobie dość przeciętnie w ciągu dnia, o tyle **w nocy staje się zdecydowanie skuteczniejsza** i potrafi bardzo trafnie dopasować statek na obu widokach. Z czego to wynika? Model świetnie wyłapuje fakt, że jednostki pływające po zmroku mają bardzo zróżnicowane kolory świateł ostrzegawczych oraz unikalny układ oświetlenia burt czy masztów, co stanowi dla sieci doskonały punkt odniesienia.

Z kolei warunki dzienne stanowią znacznie większe wyzwanie. Porównanie ujęcia z wysepki Sprogø (gdzie jednostka jest mocno oddalona, a obraz zniekształcony przez zjawiska atmosferyczne) z widokiem na pylon (czyli lokalizację Camera East), to bardzo skomplikowany problem wizyjny do rozwiązania przez model.

### Co dalej? Koncepcja "Mega-Modelu" i potencjał dla obronności

Gdybym miał rozwijać ten system dalej, idealnym rozwiązaniem byłoby stworzenie potężnego, złożonego "mega-modelu". Mógłby on składać się z kilku mniejszych, wyspecjalizowanych sieci, które na samym końcu łączyłyby swoje predykcje za pomocą odpowiednich wag (w ramach tzw. *late fusion*). Wydaje się, że takie podejście powinno przynieść świetne rezultaty.

Kolejnym krokiem, na który zabrakło już czasu, byłoby wyciąganie wektorów cech (*embeddings*) bezpośrednio z systemu AIS, który przecież niesie ze sobą ogromną dawkę precyzyjnych informacji o statku. Nawet jeśli dane z jednej z kamer lub kabla uległyby zniekształceniu, model wytrenowany na tak bogatym zbiorze informacji wciąż potrafiłby podjąć trafną decyzję. W mojej ocenie takie rozwiązanie miałoby szansę zadziałać wręcz perfekcyjnie.

Na sam koniec – co z mojego punktu widzenia jest niezwykle istotne – warto przenieść te wnioski na nieco szerszy grunt. Obecnie wiele państw boryka się z brakiem skutecznych rozwiązań do zwalczania niewielkich celów, takich jak drony czy pociski. Zaprojektowanie podobnego, wielomodalnego systemu fuzji danych mogłoby stanowić przełomowe wsparcie dla różnego rodzaju wojsk (od marynarki, przez siły lądowe i powietrzne, aż po siły operujące w kosmosie). Byłaby to doskonała odpowiedź na problemy, z którymi wciąż sobie nie radzimy, ponieważ obecne środki reagowania są często zbyt drogie w użyciu lub stwarzają bezpośrednie zagrożenie dla przecietnego obywatela i jego dobytku.