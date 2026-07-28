---
title: "GPS Różnicowy - czyli co pomoga pilotowi myśliwca F-35 bezpiecznie wylądować?"
date: 2026-07-28
draft: false
description: "Standardowy GPS to za mało, by bezpiecznie posadzić myśliwiec na pokładzie lotniskowca. W tym wpisie przedstawiam swoją realizację jednego z wariantów algorytmu DGPS
---

## Cel Projektu 

Kiedy pilot myśliwca F-35 Lightning II (tak samo jak każdej mega-drogiej maszyny) zbliża się do lądowania w trudnych warunkach atmosferycznych, nie może polegać wyłącznie na standardowym sygnale GPS. Typowy błąd pozycjonowania wynoszący kilka metrów to w lotnictwie - a zwłaszcza przy lądowaniu na poruszającym się lotniskowcu - różnica między udanym manewrem, a w najlepszym wypadku poważnym incydentem. 

Rozwiązaniem tego problemu są wojskowe systemy wspomagania oparte na koncepcji **DGPS (Differential GPS)**, takie jak amerykański JPALS (Joint Precision Approach and Landing System)[cite: 1]. W pobliżu pasa (lub na pokładzie okrętu) znajduje się stacja referencyjna, która odbiera sygnał z dokładnie tych samych satelitów co myśliwiec. Stacja na bieżąco oblicza, jak bardzo sygnał jest zniekształcany przez warunki atmosferyczne czy błędy zegarów, a następnie wysyła poprawnie przefiltrowany sygnał prosto do komputera pokładowego lądującej maszyny.

W tym projekcie postanowiłem odtworzyć ten mechanizm od zera, pisząc w Pythonie autorski algorytm DGPS, który analizuje dane satelitarne i oblicza jak najdokładniejszą pozycję na mapie.

## Kluczowe Elementy Implementacji 

Mój skrypt przetwarza dane w kilku etapach, symulując współpracę stacji referencyjnej z odbiornikiem:

* **Podwójne różnice:** Zamiast opierać się na pojedynczych pomiarach GPS, algorytm porównuje sygnały odbierane jednocześnie przez stację bazową, a także drugi odbiornik (np. taki, jaki może znajdować się w samolocie). Dzięki temu większość błędów wynikających z niedokładności zegarów satelitów i odbiorników zostaje automatycznie wyeliminowana, co znacząco zwiększa dokładność wyznaczanej pozycji.

* **Metoda najmniejszych kwadratów:** Na podstawie zebranych pomiarów program oblicza, o ile należy skorygować początkowo przyjętą pozycję odbiornika. Proces ten pozwala krok po kroku wyznaczyć współrzędne, które najlepiej odpowiadają rzeczywistym obserwacjom.

* **Iteracyjne wyznaczanie orbit:** Jest to dodatkowy moduł, który uwzględnia fakt, że sygnał GPS potrzebuje ułamka sekundy, aby dotrzeć z satelity na Ziemię. Program wielokrotnie przelicza położenie satelity dla dokładnego momentu wysłania sygnału, dzięki czemu końcowe wyznaczenie pozycji jest jeszcze bardziej precyzyjne.

## Kod i Wizualizacja 

Cały kod źródłowy, pokazujący krok po kroku formowanie macierzy wag i przeliczanie orbit, udostępniłem w [moim repozytorium na GitHubie](https://github.com/szymon-derlecki/DGPS_GNSS/blob/main/Assignment_5_DGPS.ipynb), gdzie można dokładnie prześledzić wszystkie etapy przetwarzania danych.

Do wizualizacji wyników użyłem biblioteki `folium`, która generuje interaktywną mapę w formacie HTML (`dgps_map.html`). Takie zobrazowanie perfekcyjnie oddaje to, dlaczego lotnictwo czy marynarka wojenna przez długi czas krozystało wyłąćznie z takich systemów, a aktualnie tworzone systemy są nadal w dużej mierze jako ich rozwinięcie. Rozstrzał zwykłego SPP zniknął, a kropka określająca pozycję praktycznie "przykleiła się" do właściwego punktu referencyjnego.

1.  **Prawdziwa Pozycja / RINEX True Position (Czarna gwiazdka)** - Cel, w który chcemy trafić.
2.  **Klasyczne rozwiązanie SPP (Różowe punkty)** - Zbyt daleko, by bezpiecznie wylądować.
3.  **Rozwiązanie DGPS po korektach (Zielone znaczniki)** - Bardzo dokładna pozycja (wlaśnie w psotaci tej przyklejonej  pinezki do wymaganego punktu referencyjnego)

<iframe src="/maps/dgps_map.html" width="100%" height="500px" frameborder="0" style="border: 1px solid #ddd; border-radius: 8px;"></iframe>
