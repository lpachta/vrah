# Vrah App

## Účel

Hráči dostanou přiřazeného právě jednoho jiného hráče (oběť). Losování je náhodné. Každý hráč se svou oběť dozví tajně. Každý zná jen svou oběť. V moment, kdy oběť zemře, stává se její oběť obětí vraha. Každý hráč zná pouze svou nynější oběť a předchozí. Nezná celý řetěz. Každá postava zemře jen jednou.

Hra trvá den, až dva. Přihlášení je pouze přes kód. Více zařízení.

Aplikace slouží k rozlosování obětí v rámci táborové hry. Zabíjení probíhá IRL. Aplikace slouží pouze k přehladu jednotlivých hráčů o jejich momentálním cíli a změně tohoto cíle, když má splněno.

## UI

### Panel vložení

Jeden uživatel zadá všechny uživatele. Seznam se dá importovat ze souboru, nebo z dříve hrané hry. On sám se nesmí dozvědět žádné vztahy mimo svou oběť, kterou se dozví stejným způsobem, jako ostatní. Dostane kód "herní místnosti", který nasdílí ostatním hráčům. Admin hraje taky. To je hlavní účel této aplikace.

S katždou hrou získá admin template. Jak soubor, tak cache.

Vizuálně seznam. 

### Panel zadání kódu 

Každý uživatel musí zadat kód hry, aby se mohl dozvědět svou oběť. QR kód funguje taky.

Vizuálně jako v Kahootu.

### Panel výběru postavy

Každý uživatel si na seznamu hráčů zvolí sám sebe. Poté dostane varování, aby zkontroloval, zda opravdu klikl na sebe, aby se omylem nedověděl, oběť někoho jiného. Pokud se tak stane, musí to říct adminovi, který udělá novou hru a relos.

### Panel zobrazení oběti 

Uživatel se po zvolení své postavy dozví svou oběť. Po zavraždění oběti může hráč odkliknolut tlačítko, že byla jeho oběť zavražděna. Zavražděné oběti přijde upozornění, že byla zavražděna a musí odkliknout, to že byla zavražděna. Po označení své postavy za mrtvou, získá vrah svou další oběť. Aby se člověk mohl označit za mrtvou, nemusí dostat notifikaci o své smrti. 

Vizuálně velký obdélník s jménem mrtvoly a dvě tlačítka vespod - Potvrdit smrt a Potvrdit vraždu.

### Panel výhry

Poté, co ve hře zbývá pouze jeden hráč, dostane vědět, že vyhrál.

### Panel prohry

Poté, co hráč zemře, dostane death screen. 
