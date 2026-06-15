# (Inter)play - Animationtool

Welkom bij (Inter) play animationtool, deze tool is designed en ontworpen voor Marjolijn Ruijg, zodat zij binnen haar PD, die het mogelijk maakt om typografische interactieve animaties te genereren voor verschillende begrippen uit de glossary, waarbij alleen gebruik gemaakt wordt van typografie of grafische elementen

## Inhoudsopgave
- [Over dit project](#over-dit-project)
- [Vereisten](#vereisten)
- [Installatie](#eerste-gebruik)
- [Gegevens opslaan en inladen](#gegevens-opslaan-en-inladen)
<!-- - [Configuratie](#configuratie) -->
- [Mappenstructuur](#mappenstructuur)
<!-- - [Veelgestelde vragen & valkuilen](#veelgestelde-vragen--valkuilen)
- [Bijdragen aan dit project](#bijdragen-aan-dit-project)
- [Contactpersonen](#contactpersonen)
- [Overdrachtsnotities](#overdrachtsnotities)
- [Licentie](#licentie) -->

## Over dit project
Het doel van deze tool is om makkelijker animaties te maken bij specifieke termen die uit Marjolijn Ruijg haar PD project (Inter)facing the Hybrid city komen. 

Dit project is ontworpen en gebouwd mei - juni 2026. Door studenten van de opleiding CMD op de hogeschool van Amsterdam. Het project is na juni afgerond, maar mogelijk nog in de toekomst verder ontwikkelen.

Ontwerper/developers:
- Jeppe de Wilde
- Mila Massaro
- Kerr Beeldens
- Senna Hoving
- Sabrina Zuurbier

## Vereisten
Er zijn geen vereiste softwares nodig om gebruik te kunnen maken voor de installatie.

## Installatie
### Voor zelf gebruik
Open de volgende link in je browser:
[https://mwdd-ctrl-city.github.io/animation-tool/](Link naar de tool)


### Voor aanpassingen
Open VisualStudioCode en open binnen de code de terminal.

```bash
# 1. Repository klonen
# Clone de repository door de volgende code in de command line te plakken
git clone https://github.com/mwdd-ctrl-city/animation-tool.git

# 2. Change Directory
# Verander de map waarin je de repository wilt hebben.
cd animation-tool
```

## Eerste gebruik
### Voor zelf gebruik
Stap 1:
Start met het toevoegen van de tekst bij de "T" vul je eigen woors/tekst in en druk op enter.

Stap 2:
Selecteer de geschreven tekst en pas in het linker paneel de vormgeving van de tekst aan.

Stap 3:
Terwijl je de vormgeving aanpast komen er in het onderste paneel ruitjes op een blauwe track te staan. Dit zijn keyframes. Om een animatie te maken moet je er minimaal 2 hebben staan op dezelfde blauwe track. 

Versleep de punten door ze vast te houden en van links naar rechts te slepen. Zo kan je de tijd voor de animatie sneller maken.

Stap 4:
Heb je een track waar keypoints opstaan maar ben je niet tevreden? Klik er dan op en druk vervolgend op het kruisje wat aan de linkerkant van het element komt te staan.

Stap 5:
Alles klaar en tevreden? Geef bovenin het scherm een naam aan je project en sla het vervolgens op, je ontvangt een ZIP-bestand met daarin een json en een html file. Deze code kan je eventueel later weer inladen om aan verder te werken.


### Voor aanpassingen
Open de file in VsCode en druk onderin op "Go Live" om de live versie te zien van de code

## Animatie inladen in eigen website
Benodigdheden:
- ZIP file gekregen uit de animation-tool
- De website via Astro

Stappenplan:
1. Open de code van de eigen website
2. Ga binnen eigen website naar public -> src -> animations
3. Maak een nieuwe file aan met een eigen bestandsnaam.Astro
4. Open de ZIP file
5. Open de .html file 
6. Kopieer de code die in .html staat en voeg dit in het zojuist aangemaakt file in Astro.

## Mappenstructuur
```
├── 📁 assets/                             # Static files (images, fonts)
│   ├── 📁 fonts/                          # Fonts
├── 📁 scripts/                            # JS
│   ├── 📁 animation/                      # Animation logic
│       └── 📄 animation.js                # Domain logic
│       └── 📄 animation-player.js         # GSAP
│   ├── 📁 ui/                             # UI logic
│        └── 📄 timeline.js                # Timeline controller
│        └── 📄 misc.js                    # Miscellaneous
├── 📁 styles/                             # Styling
│   └── 📄 ?.css                           # ?
│   └── 📄 ?.css                           # ?
│   └── 📄 ?.css                           # ?
├── 📄 index.html                          # HTML
├── 📄 .gitignore                          # Git ignore rules
├── 📄 LICENSE                             # Project open-source license
└── 📄 README.md                           # Main project landing page```
⁠```

## Bronnen
### Fonts
- https://fonts.google.com/specimen/Inter?preview.script=Latn 
- https://fonts.google.com/specimen/Courier+Prime?preview.script=Latn


### GSAP
- https://gsap.com/docs/v3/GSAP/Timeline/ 
- https://gsap.com/docs/v3/Installation/?tab=cdn&module=esm&require=false 

### Javascript
- https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
- https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver 
- https://developer.mozilla.org/en-US/docs/Web/API/Node/cloneNode 