---
title: "Implementacja w Pythonie: SPP, Interpolacja SP3 i oraz Filtrowanie Hatcha"
date: 2026-07-28
draft: false
description: "Algorytm Single Point Positioning napisany przy użyciu Pythona oraz biblioteki georinex, obejmujący przetwarzanie surowych plików RINEX, interpolację orbit satelitów oraz wygładzanie pomiarów."
---

## Cel Projektu

Poniższy projekt stanowi realizację jednego z podstawowych podejść systemów GNSS (Global Navigational Satellite System). Przygotowany program przetwarza surowe obserwacje w formacie RINEX (za pomocą biblioteki `georinex`) i łączy je z precyzyjnymi danymi o orbitach (zapisanymi w formacie SP3), aby samodzielnie obliczyć pozycję odbiornika - dokładnie tak jak ma to miejsce w Twoim samochodzie, telefonie czy smartwatchu. 

## Kluczowe Elementy Implementacji

Skrypt został podzielony na kilka istotnych etapów:

*   **Śledzenie satelitów (SP3):** Skrypt jest napisany tak, aby z dużą dokładnością policzyć, gdzie dokładnie w kosmosie znajdował się satelita, gdy wysyłał sygnał. Uwzględnia także fakt, że Ziemia zdążyła się obrócić przez ten ułamek sekundy, zanim sygnał do nas dotarł.
*   **Obliczanie naszej pozycji (Algorytm SPP):** Jest to główny, a zarazem najistotniejszy fragment. Bazując na wzorach, które dla wielu osób pewnie wyglądają nieco jak czarna magia, pozwala znaleźć nasze współrzędne geograficzne na Ziemi (X, Y, Z) i przy okazji naprawić błędy taniego zegarka wbudowanego w odbiornik.
*   **Ocena dokładności (PDOP):** Program sprawdza, czy konstelacja satelitów dobrze "ułożyła się" na niebie. W mojej próbie geometria była niemal idealna (wskaźnik PDOP wynosił 1.379), co oznacza, że wyliczyliśmy naszą pozycję z dokładnością do około 1.38 metra.
*   **Wygładzanie pseudoodległości (Filtr Hatcha):** Pomiary GPS potrafią mocno "wariować" z powodu zakłóceń, które pojawiają się na trasie ich przesyłu do konkretnego odbiornika. Wspomniany filtr sprytnie łączy dwa różne typy sygnałów z satelity, tak, aby odsiać szum. W efekcie nasza kropka na mapie przestaje wariować i jest bardzo stabilna.

## Kod i Wizualizacja

Cały kod źródłowy tego projektu udostępniłem w [moim repozytorium na GitHubie](https://github.com/szymon-derlecki/Single_Point_Positioning/blob/main/Final_version.ipynb), gdzie można dokładnie prześledzić wszystkie etapy przetwarzania danych. 

Do wizualizacji wyników użyłem biblioteki `folium`, która generuje interaktywną mapę w formacie HTML (`spp_comparison.html`). Poniżej wrzucam rzut oka na ostateczną mapkę, która w fajny sposób obrazuje porównanie trzech kluczowych punktów:

1.  **Pozycja Referencyjna (Niebieski znacznik)**
2.  **Rozwiązanie SPP bazujące na pseudoodległościach bez filtrowania (Czerwony znacznik)**
3.  **Rozwiązanie SPP bazujące na pseudoodległościach po zastosowaniu filtra Hatcha (Zielony znacznik)**

<iframe src="/maps/spp_comparison.html" width="100%" height="500px" frameborder="0" style="border: 1px solid #ddd; border-radius: 8px;"></iframe>