# ProwiseGO — Docentportaal v2

Een uitgebreide, statische docentomgeving geïnspireerd op de workflow van Prowise GO. De webapp draait zonder buildstap en is geschikt voor GitHub Pages.

## Modules

- Mijn applicaties
- Groepsapplicaties
- Applicatiebibliotheek
- Taken: open, toekomstig en afgerond
- Klassenmanagement met visuele device-simulatie
- Meldingen
- Instellingen
- Help & informatie
- Locatie- en groepswisselaar
- Command/search palette

## Bestandsstructuur

```text
index.html
style.css
script.js
styles/
  tokens.css
  shell.css
  components.css
  apps.css
  tasks.css
  classroom.css
  responsive.css
modules/
  data.js
  store.js
  icons.js
  ui.js
  pages.js
```

## Werking

De demo gebruikt `localStorage` voor persistente lokale data. Applicaties, taken, instellingen en klassenmanagementstatussen blijven daardoor in dezelfde browser bewaard na een refresh.

Klassenmanagement is momenteel een interactieve simulatie. Een productieversie voor echte leerlingdevices vereist authenticatie, een backend en een beheerde browserextensie/device-agent.

## GitHub Pages

Gebruik de repository-root als Pages-bron. Er is geen npm-, Node- of buildstap nodig; `index.html` laadt ES modules rechtstreeks vanuit de repository.
