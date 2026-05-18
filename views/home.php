<?php
// ============================================================
// VIEW: Home — Grid di tutti i tutorial
// ============================================================
$catNames = [
    'js'  => 'JavaScript', 'html' => 'HTML',   'css'  => 'CSS',
    'db'  => 'Database',   'git'  => 'Git',    'net'  => 'Networking',
    'networking' => 'Networking', 'java' => 'Java',
];
$levelNames = [
    'easy'   => 'facile',  'medium' => 'medio',  'hard' => 'difficile',
];
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ITIS Zuccante — Tutorial</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Mono:wght@400;700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --js-yellow: #f7df1e; --js-yellow-glow: #f7df1e33;
            --bg-dark: #0d1117; --bg-card: #161b22; --border: #30363d;
            --text: #e6edf3; --text-muted: #8b949e;
            --c-blue: #58a6ff; --c-green: #3fb950; --c-purple: #bc8cff;
            --c-orange: #ffa657; --c-red: #f85149; --c-pink: #ff7b72;
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
            font-family: 'DM Sans', sans-serif; background: var(--bg-dark);
            color: var(--text); line-height: 1.7; overflow-x: hidden; min-height: 100vh;
        }
        body::before {
            content: ''; position: fixed; inset: 0;
            background: radial-gradient(ellipse 80% 50% at 50% -20%, #f7df1e0a, transparent),
                        radial-gradient(ellipse 60% 40% at 80% 60%, #bc8cff08, transparent),
                        radial-gradient(ellipse 50% 30% at 10% 90%, #f7df1e06, transparent);
            pointer-events: none; z-index: 0;
        }
        body > * { position: relative; z-index: 1; }
        .nav {
            position: fixed; top: 0; left: 0; right: 0; z-index: 100;
            background: #0d1117dd; backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--border); padding: 0.75rem 0;
        }
        .nav-inner {
            max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;
            display: flex; align-items: center; gap: 1.5rem;
        }
        .nav-logo {
            font-family: 'Space Mono', monospace; font-weight: 700;
            font-size: 1.1rem; color: var(--js-yellow); text-decoration: none; white-space: nowrap;
        }
        .nav-badge {
            font-family: 'JetBrains Mono', monospace; font-size: 0.68rem;
            color: var(--bg-dark); background: var(--js-yellow);
            padding: 0.15rem 0.6rem; border-radius: 999px; font-weight: 700; letter-spacing: 0.05em;
        }
        .hero {
            padding: 7rem 0 2rem; text-align: center;
            max-width: 800px; margin: 0 auto; padding-left: 1.5rem; padding-right: 1.5rem;
        }
        .hero h1 {
            font-family: 'Space Mono', monospace;
            font-size: clamp(1.6rem, 4vw, 2.8rem); font-weight: 700; line-height: 1.2; color: var(--text);
        }
        .hero h1 .hl { color: var(--js-yellow); position: relative; }
        .hero h1 .hl::after {
            content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
            height: 3px; background: var(--js-yellow); border-radius: 2px; opacity: .5;
        }
        .hero-sub {
            margin-top: 1rem; font-size: 1.05rem; color: var(--text-muted);
            max-width: 560px; margin-left: auto; margin-right: auto;
        }
        .filters {
            max-width: 1200px; margin: 2rem auto 1.5rem; padding: 0 1.5rem;
            display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center;
        }
        .filter-btn {
            font-family: 'JetBrains Mono', monospace; font-size: 0.72rem;
            padding: 0.35rem 0.85rem; border-radius: 999px;
            border: 1px solid var(--border); background: var(--bg-card);
            color: var(--text-muted); cursor: pointer; transition: all .2s;
        }
        .filter-btn:hover { border-color: var(--js-yellow); color: var(--js-yellow); }
        .filter-btn.active { border-color: var(--js-yellow); background: var(--js-yellow-glow); color: var(--js-yellow); font-weight: 600; }
        .grid {
            max-width: 1200px; margin: 0 auto; padding: 0 1.5rem 4rem;
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem;
        }
        .card {
            background: var(--bg-card); border: 1px solid var(--border);
            border-radius: 14px; overflow: hidden;
            text-decoration: none; color: var(--text);
            transition: transform .2s, border-color .2s, box-shadow .2s;
            display: flex; flex-direction: column;
            animation: cardIn .3s ease both;
        }
        .card:hover {
            transform: translateY(-4px);
            border-color: var(--js-yellow);
            box-shadow: 0 8px 32px #00000044;
        }
        .card-header { padding: 1.25rem 1.25rem .75rem; }
        .card-category {
            font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
            text-transform: uppercase; letter-spacing: .1em; font-weight: 600;
            display: inline-block; padding: 0.15rem 0.5rem; border-radius: 4px;
            margin-bottom: 0.65rem;
        }
        .card-category.js    { color: var(--js-yellow);  background: #f7df1e18; }
        .card-category.html  { color: var(--c-orange);   background: #ffa65718; }
        .card-category.css   { color: var(--c-blue);     background: #58a6ff18; }
        .card-category.db    { color: var(--c-purple);   background: #bc8cff18; }
        .card-category.git   { color: var(--c-green);    background: #3fb95018; }
        .card-category.net   { color: var(--c-pink);     background: #ff7b7218; }
        .card-category.networking { color: var(--c-pink); background: #ff7b7218; }
        .card-category.java  { color: var(--c-blue);     background: #58a6ff18; }
        .card-title {
            font-family: 'Space Mono', monospace; font-size: 1rem;
            font-weight: 700; line-height: 1.35; margin-bottom: 0.4rem;
        }
        .card-desc {
            font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; padding: 0 1.25rem;
        }
        .card-meta {
            margin-top: auto; padding: 1rem 1.25rem;
            border-top: 1px solid var(--border);
            display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
        }
        .meta-tag {
            font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
            padding: 0.15rem 0.45rem; border-radius: 4px;
            border: 1px solid var(--border); color: var(--text-muted);
        }
        .meta-level {
            font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
            font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 999px;
        }
        .meta-level.easy   { color: #3fb950; border-color: #3fb95044; background: #3fb95012; }
        .meta-level.medium { color: var(--js-yellow); border-color: #f7df1e44; background: #f7df1e12; }
        .meta-level.hard   { color: var(--c-red); border-color: #f8514944; background: #f8514912; }
        .meta-pages {
            margin-left: auto; font-family: 'JetBrains Mono', monospace;
            font-size: 0.62rem; color: var(--text-muted);
        }
        .card.locked { opacity: .45; cursor: default; pointer-events: none; }
        .card.locked .card-title::after { content: ' \1F512'; font-size: 0.8rem; }
        @keyframes cardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        @media (max-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <nav class="nav">
        <div class="nav-inner">
            <a href="/" class="nav-logo">&lt;/&gt; Tutorial</a>
            <span class="nav-badge">ITIS ZUCCANTE — 4IB</span>
        </div>
    </nav>

    <div class="hero">
        <h1>Tutorial <span class="hl">ITIS Zuccante</span></h1>
        <p class="hero-sub">
            Raccolta di tutorial interattive per il corso di informatica.<br>
            Ogni tutorial è una single page con spiegazioni, demo live e quiz finale.
        </p>
    </div>

    <div class="filters" id="filters">
        <button class="filter-btn active" data-filter="all">Tutti</button>
        <button class="filter-btn" data-filter="js">JavaScript</button>
        <button class="filter-btn" data-filter="html">HTML</button>
        <button class="filter-btn" data-filter="css">CSS</button>
        <button class="filter-btn" data-filter="db">Database</button>
        <button class="filter-btn" data-filter="git">Git</button>
        <button class="filter-btn" data-filter="net">Networking</button>
        <button class="filter-btn" data-filter="networking">Packet Tracer</button>
        <button class="filter-btn" data-filter="java">Java</button>
        <button class="filter-btn" data-filter="easy">Facile</button>
        <button class="filter-btn" data-filter="medium">Medio</button>
        <button class="filter-btn" data-filter="hard">Difficile</button>
    </div>

    <div class="grid" id="grid">
<?php foreach ($tutorials as $t):
    $ready = !empty($t['file']);
    $href  = $ready ? '/id/' . $t['id'] : '#';
?>
        <a href="<?= $href ?>" class="card<?= $ready ? '' : ' locked' ?>"
           data-category="<?= $t['category'] ?>" data-level="<?= $t['level'] ?>">
            <div class="card-header">
                <span class="card-category <?= $t['category'] ?>">
                    <?= htmlspecialchars($catNames[$t['category']] ?? $t['category']) ?>
                </span>
                <div class="card-title"><?= htmlspecialchars($t['title']) ?></div>
            </div>
            <p class="card-desc"><?= htmlspecialchars($t['desc']) ?></p>
            <div class="card-meta">
<?php foreach ($t['tags'] as $tag): ?>
                <span class="meta-tag"><?= htmlspecialchars($tag) ?></span>
<?php endforeach; ?>
                <span class="meta-level <?= $t['level'] ?>">
                    <?= htmlspecialchars($levelNames[$t['level']] ?? $t['level']) ?>
                </span>
                <span class="meta-pages"><?= htmlspecialchars($t['pages']) ?></span>
            </div>
        </a>
<?php endforeach; ?>
    </div>

    <footer style="text-align:center;padding:2rem 0 1rem;color:var(--text-muted);font-size:.8rem;">
        <p>ITIS C. Zuccante — Mestre &middot; 4IB &middot; 2026</p>
    </footer>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const filterBtns = document.querySelectorAll('.filter-btn');
            const cards = document.querySelectorAll('.card');
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const filter = btn.dataset.filter;
                    cards.forEach((card, i) => {
                        const cat = card.dataset.category;
                        const lvl = card.dataset.level;
                        const show = (filter === 'all' || filter === cat || filter === lvl);
                        card.style.display = show ? '' : 'none';
                        if (show) card.style.animationDelay = (i * 0.05) + 's';
                    });
                });
            });
        });
    </script>
</body>
</html>
