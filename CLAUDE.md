# Z-Tutorial — ITIS Zuccante

Hub di tutorial interattive per studenti 4IB dell'ITIS C. Zuccante di Mestre.

## Struttura file
- `data.php` — dati dei tutorial (array PHP, aggiungine di nuovi qui)
- `src/Router.php` — classe router minimale
- `public/index.php` — front controller PHP
- `public/routes.php` — definizione delle rotte
- `views/` — template PHP (home.php, tutorial.php, 404.php)
- `js-tutorial.html` — primo tutorial (JavaScript)
- `styles.css` — stili CSS del tutorial JS
- `tutorial.js` — logica JS del tutorial

## Routing (PHP, come actv-live)
- `/` → home page con griglia di tutti i tutorial
- `/id/0` → apre il tutorial con id 0 (definito in `data.php`)
- Se il tutorial ha un file → redirect al file HTML
- Se non è pronto → pagina "in arrivo"
- Route non trovata → 404

## Servito via
Docker compose nginx con server_name `z-tutorial`:
URL locale: http://z-tutorial/
`nginx/conf.d/z-tutorial.conf` → nginx con root su `/var/www/html/z-tutorial/public`, try_files verso `/index.php`

## Stack
- PHP router personalizzato (ispirato a actv-live)
- Single page per tutorial, no framework
- CSS custom properties (giallo #f7df1e tema JS per il primo tutorial)
- Nginx + PHP-FPM via Docker Compose

## Design
- Dark theme (#0d1117)
- Font: Space Mono (heading), JetBrains Mono (code), DM Sans (body)
- Accenti diretti (è, à, ù, ì, é — non HTML entities)
- Badge: "ITIS ZUCCANTE — 4IB" (NON 4A)

When editing the HTML, always use real accented characters (è, à, ù, ì, é) NOT apostrophe (not e', a', u', i'). Use HTML entities only for structural HTML needs (&lt;script&gt;, etc.) inside code blocks.

Do not change the class to anything other than 4IB.
