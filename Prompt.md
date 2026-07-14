# Vrah App

## Účel

Hráči dostanou přiřazeného právě jednoho jiného hráče (oběť). Losování je náhodné. Každý hráč se svou oběť dozví tajně. Každý zná jen svou oběť. V moment, kdy oběť zemře, stává se její oběť obětí vraha. Každý hráč zná pouze svou nynější oběť a předchozí. Nezná celý řetěz. Každá postava zemře jen jednou.

Hra trvá den, až dva. Přihlášení je pouze přes kód. Více zařízení.

Aplikace slouží k rozlosování obětí v rámci táborové hry. Zabíjení probíhá IRL. Aplikace slouží pouze k přehladu jednotlivých hráčů o jejich momentálním cíli a změně tohoto cíle, když má splněno.

RLS zapnuto s permissive politikami — aplikace je jednoduchá táborová hra, bez auth. Bezpečnostní riziko minimální.

## UI

### Panel zadání kódu 

Toto je default page. Na tomto panelu je tlačítko, kterým se uživatel dostane na panel vložení.

Každý uživatel musí zadat kód hry, aby se mohl dozvědět svou oběť. 

Vizuálně jako v Kahootu.

### Panel vložení

Jeden uživatel zadá všechny uživatele. Seznam se dá importovat ze souboru, nebo z dříve hrané hry. On sám se nesmí dozvědět žádné vztahy mimo svou oběť, kterou se dozví stejným způsobem, jako ostatní. 

S katždou hrou získá admin template. Jak soubor, tak cache. Soubor je ve formátu JSON.

Vizuálně seznam. 

Admin není zvlášť označen v DB. prostě je to hráč který vytvořil hru. Nemá žádné speciální oprávnění kromě možnosti vytvořit novou hru (přes API).

Session se řeší přes localStorage — game_code + player_id se uloží. Při každém načtení stránky se ověří zda je session stále platná.

### Panel zobrazení kódu

Poté, co uživatel začne novou hru, objeví se mu qr kód s linkem na Panel výběru postavy. Také pod ním je odkaz a tlačítko na clipboard. 

Dostane kód "herní místnosti", který nasdílí ostatním hráčům. Admin hraje taky. To je hlavní účel této aplikace.

### Panel výběru postavy

Každý uživatel si na seznamu hráčů zvolí sám sebe. Poté dostane varování, aby zkontroloval, zda opravdu klikl na sebe, aby se omylem nedověděl, oběť někoho jiného. Pokud se tak stane, musí to říct adminovi, který udělá novou hru a relos. Admin má tlačítko "Nová hra" které smaže aktuální hru a vytvoří novou se stejným seznamem hráčů. 

Postavy jsou seřazeny abecedně.

### Panel zobrazení oběti 

Uživatel se po zvolení své postavy dozví svou oběť. Po zavraždění oběti může hráč odkliknolut tlačítko, že byla jeho oběť zavražděna. Zavražděné oběti přijde upozornění, že byla zavražděna a musí odkliknout, to že byla zavražděna. Po označení své postavy za mrtvou, získá vrah svou další oběť. Aby se člověk mohl označit za mrtvou, nemusí dostat notifikaci o své smrti. 

Vizuálně velký obdélník s jménem mrtvoly a dvě tlačítka vespod - Potvrdit smrt a Potvrdit vraždu.

Když vrah potvrdí vraždu, oběť to uvidí až se příště připojí/obnoví stránku. Žádné push notifikace — aplikace je jednoduchá, vše se řeší přes poll/refetch.

### Panel výhry

Poté, co ve hře zbývá pouze jeden hráč, dostane vědět, že vyhrál. Je zde tlačítko na navrácení do Panelu zadání kódu

### Panel prohry

Poté, co hráč zemře, dostane death screen. Je zde tlačítko na navrácení do Panelu zadání kódu
