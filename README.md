# Eesti vaatamisväärsuste kaart

## Failid
- `index.html` – veebileht, kaart, vorm ja tabel
- `app.js` – Leaflet, kaugused, TXT laadimine ja Firebase salvestamine
- `asukoht.txt` – näidisandmed; veerud `nimi;kirjeldus;lat;lng`
- `firebase-config.js` – Firebase projekti seaded
- `database.rules.json` – õppimiseks mõeldud piiratud Firebase Realtime Database reeglid

## 1. Laadi GitHubi
1. Loo repositoorium või uus alamkaust olemasolevas GitHub Pages repositooriumis.
2. Laadi viis faili samasse kausta. Kui kasutad alamkausta, on lehe aadress `https://KASUTAJA.github.io/REPO/KAUST/` (projekti tegeliku Pages seadistuse järgi).
3. Ava GitHub > Settings > Pages, määra Deploy from a branch, `main`, `/root` (või sinu projektile sobiv avaldamiskoht).
4. Ära ava HTML-faili otse `file://` aadressilt: `fetch` vajab veebiserverit. Oota Pages avaldamist.

## 2. Loo Firebase
1. Ava https://console.firebase.google.com/ ja loo uus projekt.
2. Vali Build > Realtime Database > Create Database; vali võimalusel Euroopa piirkond ning lukustatud reeglid (Locked mode).
3. Ava Project settings > Your apps > Web (`</>`), registreeri veebirakendus ja kopeeri konfiguratsioon `firebase-config.js` faili. Lisa kindlasti Realtime Database `databaseURL`, kui see pole genereeritud konfiguratsioonis.
4. Realtime Database > Rules: kopeeri `database.rules.json` sisu ja vajuta Publish.
5. Ava avaldatud veebileht, sisesta testkoht, vajuta „Salvesta tabelisse“ ja kontrolli Firebase > Realtime Database > Data all haru `vaatamisvaarsused`. Värskenda veebilehte: lisatud koht peab säilima.

**NB!** Reeglid lubavad avalikul veebilehel kõigil uusi kirjeid lisada. Need piiravad kirjete välju, tüüpe ja pikkusi ning keelavad olemasolevate kirjete muutmise/kustutamise, kuid ei takista spämmimist. Kasuta seda õppeprojektina; päris avaliku teenuse puhul lisa autentimine, App Check ja serveripoolne kontroll / modereerimine. Ära avalda isiklikke andmeid. Firebase'i veebikonfiguratsioon ei ole salajane võti; turvalisus sõltub reeglitest.

## 3. Testi ülesannet
1. Veendu, et TXT näidiskohad on kaardil ja tabelis.
2. Klõpsa kaardil oma asukoht: tabelisse ilmuvad kaugused linnulennult ja kohad järjestatakse lähimast kaugeimani.
3. Lohista sinist asukohapunkti: kaugused uuenevad.
4. Vajuta „Vali lisatava koha punkt“, klõpsa kaardil, täida nimi/kirjeldus ja salvesta.
5. Kontrolli Firebase'i Data vaates uut kirjet ning värskenda lehte, et veenduda püsivas salvestuses.

## 4. Google Forms -> Google Sheets
1. Ava https://forms.google.com ja loo vorm väljadega `Koha nimi`, `Kirjeldus`, `Laiuskraad`, `Pikkuskraad`.
2. Sea koordinaadiväljad kohustuslikuks; vajadusel kasuta vastuse valideerimist.
3. Ava Forms > Responses (Vastused) > Link to Sheets (roheline Sheetsi ikoon) ja loo seotud Google Sheets.
4. Esita testvastus ja kontrolli, et uus rida ilmus tabelisse.

**Oluline:** Google Formsi vastused lähevad selles näites *eraldi Google Sheetsi tabelisse*, mitte automaatselt Firebase'i ega kaardile. Põhirakendus kasutab `asukoht.txt` ja Firebase'i. Kui õpetaja nõuab just Formsist lisatud ridade automaatset kuvamist kaardil, tuleb juurde teha eraldi Sheets/Apps Scripti ühendus (nt turvaliselt avaldatud ainult lugemiseks mõeldud JSON-endpoint) või Forms -> Firebase sünkroonimine.

