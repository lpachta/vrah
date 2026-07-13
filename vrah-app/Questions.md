# Otázky

## 1. Formát template
JSON nebo CSV? Rozhodl jsem se pro JSON — jednodušší import/export.

## 2. Smazání hry po chybě
Prompt říká "admin udělá novou hru a relos" když někdo klikne špatně. Řešení: admin má na stránce hry tlačítko "Nová hra" které smaže aktuální hru a vytvoří novou se stejným seznamem hráčů.

## 3. Notifikace oběti
Když vrah potvrdí vraždu, oběť to uvidí až se příště připojí/obnoví stránku. Žádné push notifikace — aplikace je jednoduchá, vše se řeší přes poll/refetch.

## 4. RLS
RLS vypnuto — aplikace je jednoduchá táborová hra, bez auth. Bezpečnostní riziko minimální.

## 5. Kdo je admin v DB
Admin není zvlášť označen v DB. prostě je to hráč který vytvořil hru. Nemá žádné speciální oprávnění kromě možnosti vytvořit novou hru (přes API).

## 6. Více zařízení
Session se řeší přes localStorage — game_code + player_id se uloží. Při každém načtení stránky se ověří zda je session stále platná.

## 7. Konec hry
Když zbývá 1 živý hráč, vyhrál. Ostatní mrtví dostanou death screen. Hra se neukončí automaticky — každý vidí svůj stav.
