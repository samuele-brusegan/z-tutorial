<?php
// ============================================================
// VIEW: 404 Not Found
// ============================================================
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 — Non trovato</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Mono:wght@400;700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --js-yellow: #f7df1e; --bg-dark: #0d1117; --bg-card: #161b22;
            --border: #30363d; --text: #e6edf3; --text-muted: #8b949e;
            --c-red: #f85149;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'DM Sans', sans-serif; background: var(--bg-dark);
            color: var(--text); min-height: 100vh;
        }
        .not-found {
            max-width: 600px; margin: 8rem auto; text-align: center; padding: 0 1.5rem;
        }
        .not-found h2 {
            font-family: 'Space Mono', monospace; font-size: 2rem;
            color: var(--c-red); margin-bottom: 0.5rem;
        }
        .not-found p { color: var(--text-muted); margin-bottom: 1.5rem; }
        .back-btn {
            display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;
            padding: 0.6rem 1.5rem; border-radius: 8px; border: 1px solid var(--border);
            background: var(--bg-card); color: var(--text); text-decoration: none; transition: all .2s;
        }
        .back-btn:hover { border-color: var(--js-yellow); color: var(--js-yellow); }
    </style>
</head>
<body>
    <div class="not-found">
        <h2>404</h2>
        <p>Il tutorial richiesto non esiste.</p>
        <a href="/" class="back-btn">&larr; Torna alla home</a>
    </div>
</body>
</html>
