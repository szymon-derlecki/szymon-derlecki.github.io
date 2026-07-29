---
title: "Jak przewidzieć awarię turbiny wiatrowej za pomocą sieci typu TCN?"
date: 2026-07-29
draft: false
description: "Przestoje wielkich turbin wiatrowych to gigantyczne koszty. W tym wpisie pokazuję, jak wykorzystaliśmy Temporal Convolutional Networks (TCN) do przewidywania obciążeń łopat wirnika."
---

### Cel Projektu

Przestoje turbin wiatrowych znacząco uderzają w ogólną wydajność odnawialnych źródeł energii. Kiedy gigantyczne łopaty wiatraków przestają się kręcić z powodu awarii, oczywiste jest, że wystąpią istotne straty, a w skrajnym przypadku może nawet dojść do blackoutów. Zamiast czekać na usterkę, o wiele lepszym podejściem jest przewidywanie obciążeń działających na łopaty turbiny. Pozwala to zaplanować konserwację z wyprzedzeniem, a w konsekwencji doprowadzić do znacznego zmniejszenia liczby awarii.

W tym projekcie naszym głównym celem było przewidzenie obciążeń wiatrem (konkretnie momentów zginających: Mz1, Mz2, Mz3) działających na łopaty turbiny.

## Kluczowe Elementy Implementacji

Zaprojektowane przez nas rozwiązanie przetwarza dane w kilku głównych etapach, od odsiania zbędnego szumu po zaawansowaną predykcję za pomocą splotowej sieci neuronowej:

*   **Wybór danych:** Na wejściu mieliśmy do dyspozycji 17 symulowanych cech turbiny, w tym m.in. kąty pochylenia łopat oraz parametry wirnika przy różnych prędkościach wiatru. Zastosowaliśmy progowanie wariancji, aby usunąć cechy o niskiej zmienności. Następnie obliczyliśmy średnią bezwzględną korelację z naszymi celami (Mz1, Mz2, Mz3), żeby "nakarmić" model tylko najważniejszymi zmiennymi.
*   **Architektura Temporal Convolutional Network (TCN):** Wykorzystaliśmy sieć TCN, ponieważ jest to niezwykle potężne narzędzie do analizowania danych w postaci szeregów czasowych. Dzięki zastosowaniu rozszerzonych splotów oraz warstw łączących, sieć potrafi wydajnie przetwarzać informacje z przeszłości i dostarczać bardzo dokładne przewidywane wartości tych niezwykle istotnych obciążeń. Architektura opierała się na trzech blokach czasowych (zwiększających liczbę kanałów: 16-32, 32-64, 64-64), połączonych z klasyczną warstwą w pełni połączoną (Fully Connected 64-3) na samym końcu.
*   **Parametry Treningu:** Model był uczony z użyciem optymalizatora Adam, a jako funkcję straty wybraliśmy Mean Square Error. Parametr learning rate ustawiliśmy na $0.0001$, a cały proces zaplanowaliśmy na 100 epok. Dodatkowo wprowadziliśmy zabezpieczenie w postaci wczesnego zatrzymania treningu (Early Stopping), z parametrem granicznym wynoszącym 5 epok w przypadku braku poprawy metryk na zbiorze walidacyjnym.

## Kod i Wizualizacja

Ostateczne wyniki udowadniają, że tego typu sieć to świetna architektura do pracy z takimi danymi. Najlepszy model wykręcił rewelacyjny wynik $R^2$ na poziomie $0.9784$, przy błędzie średniokwadratowym (MSE) wynoszącym jedynie $33.1251$. Z kolei przy teście na wszystkich dostępnych danych bez wcześniejszej ostrej selekcji, $R^2$ spadło do $0.8223$.

Poniżej wrzucam nasz plakat projektowy z dokładniejszym podglądem na wykresy selekcji cech oraz schemat blokowy samej sieci TCN:

![Plakat Projektowy - Lowering the downtime of wind turbines](/images/turbine_dt.jpg)

Cały kod źródłowy tego projektu udostępniłem w moim repozytorium na GitHubie, gdzie można dokładnie prześledzić architekturę modelu i proces przetwarzania danych.
[Repozytorium GitHub: Wind Turbines Project - Deep Learning](https://github.com/szymon-derlecki/Deep_Learning_Project_Wind_Turbines/blob/main/Wind_Turbines_Project_Deep_Learning.ipynb)