---
title: "Śledzenie statków bez AIS: Jak podwodny światłowód i zwykłe kamery pomagają zwalczać flotę cieni?"
date: 2026-08-16
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
W tej części projektu zdeterminowana została architektura, a tak naprawdę to dwie, które były użyte w celu utworzenia naszego rozwiązania. Jako, że podjąłem się identyfikacji metodą wykorzystującą 'supervised contrastive loss' (która de facto jest wersją algorytmu należącą do paradygmatu uczenia nadzorowanego) pierwszym krokiem było przetworzenie danych AIS (które jest systemem pokroju FR24, tyle, że dla statków) w taki sposób, aby prawidłową rejestrację statku przypisać do klatek z kamery, na których tenże statek się znajdował. Dane treningowe wpuszczane do modelu były tworzone z przetworzonych zdjęć z jednej kamery w taki sposób, aby utworzyć 2 nowe wersje każdego ze zdjęć, a także an tym etpaie były już dane z cross-camera, tworzone tak, by powstała para należąca do tego samego statku, natomiast te zdjęćia również były augmentowane. Po treningu 80 epok, z takimi i takimi wartościami osiągnięto takie wyniki jak w tabeli. A na dole przedstawiam porównanie zdjęć statków oraz macierzy obrazujących ich prawdopodobieństwo.