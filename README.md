# Z-Tutorial

Hub di tutorial interattive per studenti **4IB** dell'ITIS C. Zuccante di Mestre.

## 📚 Contenuto

- **JavaScript** — tutorial introduttivo con esempi pratici
- **Packet Tracer** — guide per configurazioni di rete (in arrivo)

## 🏗️ Architettura

- Router PHP personalizzato (ispirato a actv-live)
- Front controller in `public/index.php`
- Routing definito in `public/routes.php`
- Template in `views/`
- Docker Compose con Nginx + PHP-FPM

## 🚀 Setup locale

```bash
docker compose up -d
```

URL: http://z-tutorial/

## 📁 Struttura

```
├── data.php                  # Dati dei tutorial
├── src/Router.php           # Classe router
├── public/
│   ├── index.php           # Front controller
│   └── routes.php          # Definizione rotte
├── views/                  # Template PHP
│   ├── home.php
│   ├── tutorial.php
│   └── 404.php
├── js-tutorial.html       # Tutorial JavaScript
├── tutorial.js            # Logica tutorial JS
└── styles.css             # Stili CSS
```

## 🎨 Design

- Dark theme (#0d1117)
- Font: Space Mono (heading), JetBrains Mono (code), DM Sans (body)
- Accenti diretti (è, à, ù, ì, é)
- Badge: "ITIS ZUCCANTE — 4IB"
