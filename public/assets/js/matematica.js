(function () {
    'use strict';

    const SVGNS = 'http://www.w3.org/2000/svg';
    function svg(tag, attrs) {
        const el = document.createElementNS(SVGNS, tag);
        if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }

    /* ====== PAGE NAVIGATION ====== */
    const pages = document.querySelectorAll('.section.page');
    const navLinks = document.querySelectorAll('.nav-link');
    const pageInput = document.getElementById('page-input');
    const pageDots = document.getElementById('page-dots');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    let current = 1;

    function showPage(n) {
        if (n < 1 || n > pages.length) return;
        current = n;
        pages.forEach(p => p.classList.toggle('hidden', parseInt(p.dataset.index) !== n));
        navLinks.forEach(l => l.classList.toggle('active', parseInt(l.dataset.page) === n));
        pageInput.value = n;
        pageDots.innerHTML = '';
        for (let i = 1; i <= pages.length; i++) {
            const d = document.createElement('span');
            d.className = 'dot' + (i === n ? ' active' : '');
            d.addEventListener('click', () => showPage(i));
            pageDots.appendChild(d);
        }
        btnPrev.classList.toggle('disabled', n === 1);
        btnNext.classList.toggle('disabled', n === pages.length);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise();
        plotters.forEach(p => p.draw());
    }

    navLinks.forEach(l => l.addEventListener('click', () => showPage(parseInt(l.dataset.page))));
    btnPrev.addEventListener('click', () => showPage(current - 1));
    btnNext.addEventListener('click', () => showPage(current + 1));
    pageInput.addEventListener('change', () => showPage(parseInt(pageInput.value)));
    pageInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); showPage(parseInt(pageInput.value)); } });

    /* ====== QUIZ ====== */
    document.querySelectorAll('.mini-quiz').forEach(quiz => {
        let answered = false;
        const question = quiz.querySelector('.quiz-question');
        const feedback = quiz.querySelector('.mini-quiz-feedback');
        const correct = question.dataset.correct;
        quiz.querySelectorAll('.quiz-option-mini').forEach(opt => {
            opt.addEventListener('click', () => {
                if (answered) return;
                quiz.querySelectorAll('.quiz-option-mini').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                if (opt.dataset.value === correct) {
                    opt.classList.add('correct');
                    feedback.textContent = 'Corretto!';
                    feedback.className = 'mini-quiz-feedback show ok';
                } else {
                    opt.classList.add('wrong');
                    const c = quiz.querySelector('[data-value="' + correct + '"]');
                    if (c) c.classList.add('correct');
                    feedback.textContent = 'Sbagliato — la risposta corretta è in verde.';
                    feedback.className = 'mini-quiz-feedback show fail';
                }
                answered = true;
                quiz.querySelectorAll('.quiz-option-mini').forEach(o => o.classList.add('disabled'));
            });
        });
    });

    const quizBox = document.getElementById('quiz-box');
    if (quizBox) {
        quizBox.querySelectorAll('.quiz-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const q = opt.closest('.quiz-question');
                q.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                const inp = opt.querySelector('input'); if (inp) inp.checked = true;
            });
        });
        document.getElementById('btn-submit-quiz').addEventListener('click', () => {
            let score = 0;
            quizBox.querySelectorAll('.quiz-question').forEach(q => {
                const correct = q.dataset.correct;
                let selected = null;
                q.querySelectorAll('.quiz-option').forEach(o => {
                    o.classList.add('disabled');
                    const inp = o.querySelector('input');
                    if (inp && inp.checked) selected = inp.value;
                });
                q.querySelectorAll('.quiz-option').forEach(o => {
                    const v = o.querySelector('input').value;
                    if (v === correct) o.classList.add('correct');
                    else if (v === selected) o.classList.add('wrong');
                });
                if (selected === correct) score++;
            });
            const total = quizBox.querySelectorAll('.quiz-question').length;
            document.getElementById('score-val').textContent = score + '/' + total;
            document.getElementById('score-label').textContent =
                score === total ? 'Perfetto! Sei pronto per la verifica.' :
                score >= 4 ? 'Buon livello, ripassa qualche dettaglio.' : 'Rivedi gli argomenti e riprova.';
            document.getElementById('quiz-score').classList.add('visible');
        });
    }

    /* =========================================================
       SVG ANIMATIONS
       ========================================================= */

    /* ---------- HERO: curve + sliding tangent ---------- */
    function initHero() {
        const root = document.getElementById('hero-anim');
        if (!root) return;
        const W = 720, H = 200;
        const padL = 40, padR = 40, padT = 20, padB = 30;
        const pW = W - padL - padR, pH = H - padT - padB;
        const xMin = -2.3, xMax = 2.3, yMin = -3, yMax = 3;
        const sx = x => padL + (x - xMin) / (xMax - xMin) * pW;
        const sy = y => padT + (yMax - y) / (yMax - yMin) * pH;
        const f = x => x*x*x - 2*x;
        const df = x => 3*x*x - 2;

        // axes
        root.appendChild(svg('line', { x1: padL, y1: sy(0), x2: padL+pW, y2: sy(0), stroke:'#2a2f44', 'stroke-width':1 }));
        root.appendChild(svg('line', { x1: sx(0), y1: padT, x2: sx(0), y2: padT+pH, stroke:'#2a2f44', 'stroke-width':1 }));

        // curve
        let d = '';
        for (let i = 0; i <= 200; i++) {
            const x = xMin + (xMax - xMin) * i / 200;
            const px = sx(x), py = sy(f(x));
            d += (i ? ' L ' : 'M ') + px.toFixed(2) + ' ' + py.toFixed(2);
        }
        root.appendChild(svg('path', { d, fill:'none', stroke:'#a78bfa', 'stroke-width':2.5 }));

        // tangent + dot
        const tan = svg('line', { stroke:'#34d399', 'stroke-width':2, 'stroke-linecap':'round' });
        const dot = svg('circle', { r:6, fill:'#f472b6', stroke:'#0a0d12', 'stroke-width':2 });
        root.appendChild(tan); root.appendChild(dot);

        let t = 0;
        function loop() {
            t += 0.012;
            const x = xMin + (Math.sin(t)*0.5 + 0.5) * (xMax - xMin);
            const y = f(x), m = df(x);
            const px = sx(x), py = sy(y);
            const dx = 0.7;
            const x1 = x - dx, x2 = x + dx;
            const y1 = y - m*dx, y2 = y + m*dx;
            tan.setAttribute('x1', sx(x1)); tan.setAttribute('y1', sy(y1));
            tan.setAttribute('x2', sx(x2)); tan.setAttribute('y2', sy(y2));
            dot.setAttribute('cx', px); dot.setAttribute('cy', py);
            requestAnimationFrame(loop);
        }
        loop();
    }

    /* ---------- Helper: build a generic graph w/ axes ---------- */
    function buildAxes(root, W, H, xMin, xMax, yMin, yMax, pad) {
        const padL = pad.l, padR = pad.r, padT = pad.t, padB = pad.b;
        const pW = W - padL - padR, pH = H - padT - padB;
        const sx = x => padL + (x - xMin) / (xMax - xMin) * pW;
        const sy = y => padT + (yMax - y) / (yMax - yMin) * pH;

        // grid
        for (let gx = Math.ceil(xMin); gx <= Math.floor(xMax); gx++) {
            root.appendChild(svg('line', { x1:sx(gx), y1:padT, x2:sx(gx), y2:padT+pH, stroke:'#181c2a', 'stroke-width':1 }));
        }
        for (let gy = Math.ceil(yMin); gy <= Math.floor(yMax); gy++) {
            root.appendChild(svg('line', { x1:padL, y1:sy(gy), x2:padL+pW, y2:sy(gy), stroke:'#181c2a', 'stroke-width':1 }));
        }
        // axes
        root.appendChild(svg('line', { x1:padL, y1:sy(0), x2:padL+pW, y2:sy(0), stroke:'#3a414f', 'stroke-width':1.4 }));
        root.appendChild(svg('line', { x1:sx(0), y1:padT, x2:sx(0), y2:padT+pH, stroke:'#3a414f', 'stroke-width':1.4 }));
        return { sx, sy, pW, pH };
    }

    function buildCurve(sx, sy, f, xMin, xMax, color, w) {
        let d = '';
        const N = 300;
        for (let i = 0; i <= N; i++) {
            const x = xMin + (xMax - xMin) * i / N;
            let y; try { y = f(x); } catch (e) { continue; }
            if (!isFinite(y)) continue;
            d += (d ? ' L ' : 'M ') + sx(x).toFixed(2) + ' ' + sy(y).toFixed(2);
        }
        return svg('path', { d, fill:'none', stroke:color || '#a78bfa', 'stroke-width': w || 2.5 });
    }

    /* ---------- ROLLE animation ---------- */
    function initRolle() {
        const root = document.getElementById('anim-rolle');
        if (!root) return;
        const W = 720, H = 320;
        const { sx, sy } = buildAxes(root, W, H, -0.5, 4.5, -1.5, 2.8, { l:40, r:30, t:20, b:30 });

        // f(x) = -(x-1)(x-3) — has f(1)=f(3)=0, max in x=2
        const a = 1, b = 3;
        const f = x => -(x - 1) * (x - 3);
        const df = x => -(2*x - 4);

        root.appendChild(buildCurve(sx, sy, f, 0.5, 3.5, '#a78bfa', 2.8));

        // a, b markers
        [{x:a,c:'#fbbf24',label:'a'},{x:b,c:'#fbbf24',label:'b'}].forEach(p => {
            root.appendChild(svg('line', { x1:sx(p.x), y1:sy(0), x2:sx(p.x), y2:sy(f(p.x)), stroke:p.c, 'stroke-width':1.5, 'stroke-dasharray':'3 3' }));
            const c = svg('circle', { cx:sx(p.x), cy:sy(f(p.x)), r:5, fill:p.c, stroke:'#0a0d12', 'stroke-width':2 });
            root.appendChild(c);
            const t = svg('text', { x:sx(p.x), y:sy(0)+18, fill:p.c, 'font-size':14, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
            t.textContent = p.label; root.appendChild(t);
        });

        // horizontal level line f(a)=f(b)=0
        root.appendChild(svg('line', { x1:sx(a), y1:sy(0), x2:sx(b), y2:sy(0), stroke:'#fbbf24', 'stroke-width':1.4, 'stroke-dasharray':'4 4', opacity:0.6 }));

        // tangent and moving dot
        const tan = svg('line', { stroke:'#34d399', 'stroke-width':2.5, 'stroke-linecap':'round' });
        const dot = svg('circle', { r:7, fill:'#f472b6', stroke:'#0a0d12', 'stroke-width':2 });
        const slopeText = svg('text', { fill:'#34d399', 'font-size':14, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
        root.appendChild(tan); root.appendChild(dot); root.appendChild(slopeText);

        let t = 0, dir = 1;
        let raf = null;
        function loop() {
            t += 0.006 * dir;
            if (t >= 1) { t = 1; dir = -1; }
            else if (t <= 0) { t = 0; dir = 1; }
            const x = a + (b - a) * t;
            const y = f(x), m = df(x);
            const dx = 0.7;
            tan.setAttribute('x1', sx(x - dx)); tan.setAttribute('y1', sy(y - m*dx));
            tan.setAttribute('x2', sx(x + dx)); tan.setAttribute('y2', sy(y + m*dx));
            dot.setAttribute('cx', sx(x)); dot.setAttribute('cy', sy(y));
            slopeText.setAttribute('x', sx(x));
            slopeText.setAttribute('y', sy(y) - 16);
            slopeText.textContent = "f'(c) = " + m.toFixed(2);
            if (Math.abs(m) < 0.04) slopeText.setAttribute('fill', '#f472b6');
            else slopeText.setAttribute('fill', '#34d399');
            raf = requestAnimationFrame(loop);
        }
        loop();

        const btn = document.querySelector('[data-action="rolle-play"]');
        if (btn) btn.addEventListener('click', () => { t = 0; dir = 1; });
    }

    /* ---------- LAGRANGE animation ---------- */
    function initLagrange() {
        const root = document.getElementById('anim-lagrange');
        if (!root) return;
        const W = 720, H = 320;
        const { sx, sy } = buildAxes(root, W, H, -0.5, 4.5, -1.5, 4, { l:40, r:30, t:20, b:30 });

        const a = 1, b = 3;
        const f = x => 0.4 * x * x;       // simple parabola
        const df = x => 0.8 * x;
        const fa = f(a), fb = f(b);
        const mAvg = (fb - fa) / (b - a);
        // f'(c) = mAvg ⇒ 0.8c = mAvg ⇒ c = mAvg/0.8 = 2 (intero)
        const c = mAvg / 0.8;

        root.appendChild(buildCurve(sx, sy, f, 0, 4.3, '#a78bfa', 2.8));

        // chord
        root.appendChild(svg('line', { x1:sx(a), y1:sy(fa), x2:sx(b), y2:sy(fb), stroke:'#fbbf24', 'stroke-width':2, 'stroke-dasharray':'5 4' }));
        // endpoint dots
        root.appendChild(svg('circle', { cx:sx(a), cy:sy(fa), r:5, fill:'#fbbf24' }));
        root.appendChild(svg('circle', { cx:sx(b), cy:sy(fb), r:5, fill:'#fbbf24' }));
        const lab = svg('text', { x:(sx(a)+sx(b))/2, y:(sy(fa)+sy(fb))/2 - 8, fill:'#fbbf24', 'font-size':13, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
        lab.textContent = 'corda';
        root.appendChild(lab);

        const tan = svg('line', { stroke:'#34d399', 'stroke-width':2.5, 'stroke-linecap':'round' });
        const dot = svg('circle', { r:7, fill:'#f472b6', stroke:'#0a0d12', 'stroke-width':2 });
        const info = svg('text', { fill:'#34d399', 'font-size':13, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
        root.appendChild(tan); root.appendChild(dot); root.appendChild(info);

        let t = 0, dir = 1;
        function loop() {
            t += 0.005 * dir;
            if (t >= 1) { t = 1; dir = -1; }
            else if (t <= 0) { t = 0; dir = 1; }
            const x = a + (b - a) * t;
            const y = f(x), m = df(x);
            const dx = 0.9;
            tan.setAttribute('x1', sx(x - dx)); tan.setAttribute('y1', sy(y - m*dx));
            tan.setAttribute('x2', sx(x + dx)); tan.setAttribute('y2', sy(y + m*dx));
            dot.setAttribute('cx', sx(x)); dot.setAttribute('cy', sy(y));
            info.setAttribute('x', sx(x)); info.setAttribute('y', sy(y) - 16);
            const diff = Math.abs(m - mAvg);
            if (diff < 0.05) {
                info.setAttribute('fill', '#f472b6');
                info.textContent = "f'(c) = " + m.toFixed(2) + " = pendenza corda ✓";
            } else {
                info.setAttribute('fill', '#34d399');
                info.textContent = "f'(x) = " + m.toFixed(2) + "  (corda = " + mAvg.toFixed(2) + ")";
            }
            requestAnimationFrame(loop);
        }
        loop();

        const btn = document.querySelector('[data-action="lagrange-play"]');
        if (btn) btn.addEventListener('click', () => { t = 0; dir = 1; });
    }

    /* ---------- CONCAVITY animation (page 3) ---------- */
    function initConcav() {
        const root = document.getElementById('anim-concav');
        if (!root) return;
        const W = 720, H = 280;
        const { sx, sy } = buildAxes(root, W, H, -2.5, 2.5, -3, 3, { l:40, r:30, t:20, b:30 });

        // f(x) = x^3 - 2x : flesso in x=0
        const f = x => x*x*x - 2*x;
        const df = x => 3*x*x - 2;
        const d2f = x => 6*x;

        root.appendChild(buildCurve(sx, sy, f, -2.3, 2.3, '#a78bfa', 2.8));

        // Smiley / frowny arcs that show concavity
        const concBox = svg('g'); root.appendChild(concBox);

        const tan = svg('line', { stroke:'#34d399', 'stroke-width':2.5, 'stroke-linecap':'round' });
        const dot = svg('circle', { r:7, fill:'#f472b6', stroke:'#0a0d12', 'stroke-width':2 });
        const lab = svg('text', { fill:'#fbbf24', 'font-size':14, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
        root.appendChild(tan); root.appendChild(dot); root.appendChild(lab);

        // small mood arc next to the dot
        const arc = svg('path', { fill:'none', stroke:'#fbbf24', 'stroke-width':2.5, 'stroke-linecap':'round' });
        root.appendChild(arc);

        let t = 0, dir = 1;
        function loop() {
            t += 0.005 * dir;
            if (t >= 1) { t = 1; dir = -1; }
            else if (t <= 0) { t = 0; dir = 1; }
            const x = -2 + 4 * t;
            const y = f(x), m = df(x), c2 = d2f(x);
            const dx = 0.7;
            tan.setAttribute('x1', sx(x - dx)); tan.setAttribute('y1', sy(y - m*dx));
            tan.setAttribute('x2', sx(x + dx)); tan.setAttribute('y2', sy(y + m*dx));
            dot.setAttribute('cx', sx(x)); dot.setAttribute('cy', sy(y));

            // arc above the dot mimicking concavity
            const cx = sx(x), cy = sy(y) - 36;
            if (Math.abs(c2) < 0.4) {
                arc.setAttribute('d', 'M ' + (cx-14) + ' ' + cy + ' L ' + (cx+14) + ' ' + cy);
                arc.setAttribute('stroke', '#f472b6');
                lab.setAttribute('fill', '#f472b6');
                lab.textContent = 'FLESSO — concavità cambia';
            } else if (c2 > 0) {
                // concave up (smile)
                arc.setAttribute('d', 'M ' + (cx-14) + ' ' + (cy-4) + ' Q ' + cx + ' ' + (cy+14) + ' ' + (cx+14) + ' ' + (cy-4));
                arc.setAttribute('stroke', '#34d399');
                lab.setAttribute('fill', '#34d399');
                lab.textContent = "f''(x) > 0 — concavità in alto";
            } else {
                // concave down (frown)
                arc.setAttribute('d', 'M ' + (cx-14) + ' ' + (cy+4) + ' Q ' + cx + ' ' + (cy-14) + ' ' + (cx+14) + ' ' + (cy+4));
                arc.setAttribute('stroke', '#fbbf24');
                lab.setAttribute('fill', '#fbbf24');
                lab.textContent = "f''(x) < 0 — concavità in basso";
            }
            lab.setAttribute('x', cx);
            lab.setAttribute('y', cy - 14);

            requestAnimationFrame(loop);
        }
        loop();
    }

    /* ---------- MAX/MIN animation (page 4) ---------- */
    function initMaxMinAnim() {
        const root = document.getElementById('anim-maxmin');
        if (!root) return;
        const W = 720, H = 320;
        const { sx, sy } = buildAxes(root, W, H, -2.5, 2.5, -5, 4.5, { l:40, r:30, t:20, b:30 });

        const f = x => Math.pow(x,4) - 4*x*x;
        const df = x => 4*x*x*x - 8*x;

        root.appendChild(buildCurve(sx, sy, f, -2.3, 2.3, '#a78bfa', 2.8));

        // critical points
        const crit = [
            { x: -Math.sqrt(2), y: -4, type:'min', color:'#34d399' },
            { x: 0,              y:  0, type:'MAX', color:'#f472b6' },
            { x:  Math.sqrt(2), y: -4, type:'min', color:'#34d399' }
        ];
        crit.forEach(c => {
            root.appendChild(svg('circle', { cx:sx(c.x), cy:sy(c.y), r:6, fill:c.color, stroke:'#0a0d12', 'stroke-width':2 }));
            const t = svg('text', { x:sx(c.x), y:sy(c.y) + (c.type==='MAX'?-12:22), fill:c.color, 'font-size':12, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
            t.textContent = c.type; root.appendChild(t);
        });

        const tan = svg('line', { stroke:'#34d399', 'stroke-width':2.5, 'stroke-linecap':'round' });
        const dot = svg('circle', { r:6, fill:'#fbbf24', stroke:'#0a0d12', 'stroke-width':2 });
        const slopeBar = svg('rect', { x: 540, y: 30, width: 140, height: 16, fill:'#181c2a', stroke:'#3a414f', 'stroke-width':1, rx:3 });
        const slopeFill = svg('rect', { y: 30, height: 16, fill:'#34d399', rx:3 });
        const slopeLbl = svg('text', { x: 610, y: 22, fill:'#9aa3c7', 'font-size':11, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
        slopeLbl.textContent = "f'(x)";
        root.appendChild(tan); root.appendChild(dot);
        root.appendChild(slopeBar); root.appendChild(slopeFill); root.appendChild(slopeLbl);

        let t = 0, dir = 1;
        function loop() {
            t += 0.004 * dir;
            if (t >= 1) { t = 1; dir = -1; }
            else if (t <= 0) { t = 0; dir = 1; }
            const x = -2 + 4 * t;
            const y = f(x), m = df(x);
            const dx = 0.6;
            tan.setAttribute('x1', sx(x - dx)); tan.setAttribute('y1', sy(y - m*dx));
            tan.setAttribute('x2', sx(x + dx)); tan.setAttribute('y2', sy(y + m*dx));
            dot.setAttribute('cx', sx(x)); dot.setAttribute('cy', sy(y));
            // slope bar: 0 at center, length proportional to m
            const mClamp = Math.max(-10, Math.min(10, m));
            const halfW = 70;
            const len = Math.abs(mClamp) / 10 * halfW;
            if (mClamp >= 0) {
                slopeFill.setAttribute('x', 540 + halfW);
                slopeFill.setAttribute('width', len);
                slopeFill.setAttribute('fill', '#34d399');
            } else {
                slopeFill.setAttribute('x', 540 + halfW - len);
                slopeFill.setAttribute('width', len);
                slopeFill.setAttribute('fill', '#f472b6');
            }
            requestAnimationFrame(loop);
        }
        loop();
    }

    /* ---------- RECTANGLE area animation (page 5) ---------- */
    function initRect() {
        const root = document.getElementById('anim-rect');
        const slider = document.getElementById('rect-slider');
        if (!root || !slider) return;
        const W = 720, H = 280;
        const p = 100; // half-perimeter

        function draw() {
            while (root.firstChild) root.removeChild(root.firstChild);
            const x = parseFloat(slider.value); // base, 5..95
            const y = p - x;
            // scale factor so the rect fits
            const maxDim = 100;
            const k = 2.0;
            // left side: the rectangle
            const cx = 180, cy = 140;
            const rw = x * k * 0.9, rh = y * k * 0.9;
            const rx = cx - rw/2, ry = cy - rh/2;
            root.appendChild(svg('rect', { x:rx, y:ry, width:rw, height:rh, fill:'#a78bfa22', stroke:'#a78bfa', 'stroke-width':2.5, rx:4 }));
            // labels
            const lb = svg('text', { x:cx, y:ry+rh+22, fill:'#a78bfa', 'font-size':13, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
            lb.textContent = 'x = ' + x.toFixed(0);
            root.appendChild(lb);
            const lh = svg('text', { x:rx-12, y:cy+5, fill:'#34d399', 'font-size':13, 'font-family':'JetBrains Mono', 'text-anchor':'end' });
            lh.textContent = 'y = ' + y.toFixed(0);
            root.appendChild(lh);

            // perimeter info
            const pinfo = svg('text', { x:cx, y:30, fill:'#fbbf24', 'font-size':14, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
            pinfo.textContent = 'Perimetro 2(x+y) = ' + (2 * (x + y));
            root.appendChild(pinfo);

            // right side: area bar chart
            const barX0 = 430, barY0 = 240;
            const barMaxH = 200;
            const A = x * y;
            const Amax = (p/2) * (p/2); // 2500
            const hBar = Math.max(2, A / Amax * barMaxH);
            const wBar = 70;
            // axis
            root.appendChild(svg('line', { x1:barX0, y1:barY0, x2:barX0 + 220, y2:barY0, stroke:'#3a414f', 'stroke-width':1.5 }));
            // bar
            const color = A >= Amax * 0.98 ? '#f472b6' : '#a78bfa';
            root.appendChild(svg('rect', { x:barX0 + 20, y:barY0 - hBar, width:wBar, height:hBar, fill:color, rx:3 }));
            // max indicator
            root.appendChild(svg('line', { x1:barX0, y1:barY0 - barMaxH, x2:barX0 + 220, y2:barY0 - barMaxH, stroke:'#f472b6', 'stroke-width':1.2, 'stroke-dasharray':'4 3' }));
            const lmax = svg('text', { x:barX0 + 222, y:barY0 - barMaxH + 4, fill:'#f472b6', 'font-size':11, 'font-family':'JetBrains Mono' });
            lmax.textContent = 'A_max = ' + Amax;
            root.appendChild(lmax);
            // label A
            const lA = svg('text', { x:barX0 + 55, y:barY0 - hBar - 8, fill:color, 'font-size':14, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
            lA.textContent = 'A = ' + A;
            root.appendChild(lA);
            const lTitle = svg('text', { x:barX0 + 110, y:35, fill:'#9aa3c7', 'font-size':12, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
            lTitle.textContent = "Area in funzione di x";
            root.appendChild(lTitle);
            // small curve A(x) = x(p-x) overlay
            const curveX0 = barX0 + 110, curveY0 = barY0;
            const cW = 100, cH = barMaxH;
            let d = '';
            for (let i = 0; i <= 100; i++) {
                const xx = i;
                const AA = xx * (p - xx);
                const px = curveX0 + (xx / 100) * cW;
                const py = curveY0 - (AA / Amax) * cH;
                d += (i ? ' L ' : 'M ') + px.toFixed(1) + ' ' + py.toFixed(1);
            }
            root.appendChild(svg('path', { d, fill:'none', stroke:'#9aa3c7', 'stroke-width':1.2, opacity:0.4 }));
            // current x marker on curve
            const cxP = curveX0 + (x / 100) * cW;
            const cyP = curveY0 - (A / Amax) * cH;
            root.appendChild(svg('circle', { cx:cxP, cy:cyP, r:4, fill:color }));
        }
        slider.addEventListener('input', draw);
        draw();
    }

    /* ---------- BOX folding animation (page 5) ---------- */
    function initBox() {
        const root = document.getElementById('anim-box');
        const slider = document.getElementById('box-slider');
        if (!root || !slider) return;
        const L = 60; // logical side
        const W = 720, H = 320;

        function draw() {
            while (root.firstChild) root.removeChild(root.firstChild);
            const x = parseFloat(slider.value); // 2..48 ~ fraction of L*100
            const xF = x / 100 * L; // actual taglio
            const k = 2.4;
            // LEFT: square with corners cut
            const cx = 160, cy = 160;
            const sLen = L * k;
            const half = sLen / 2;
            const cut = xF * k;
            // outer square (dashed)
            root.appendChild(svg('rect', { x:cx-half, y:cy-half, width:sLen, height:sLen, fill:'none', stroke:'#3a414f', 'stroke-width':1.5, 'stroke-dasharray':'4 3' }));
            // four cut squares
            const corners = [[cx-half, cy-half], [cx+half-cut, cy-half], [cx-half, cy+half-cut], [cx+half-cut, cy+half-cut]];
            corners.forEach(c => {
                root.appendChild(svg('rect', { x:c[0], y:c[1], width:cut, height:cut, fill:'#f47280', opacity:0.25, stroke:'#f47280', 'stroke-width':1 }));
            });
            // base of box (central square)
            root.appendChild(svg('rect', { x:cx-half+cut, y:cy-half+cut, width:sLen-2*cut, height:sLen-2*cut, fill:'#a78bfa22', stroke:'#a78bfa', 'stroke-width':2 }));
            // labels for taglio x
            const lx = svg('text', { x:cx-half + cut/2, y:cy-half - 6, fill:'#f47280', 'font-size':12, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
            lx.textContent = 'x = ' + xF.toFixed(1);
            root.appendChild(lx);
            const lL = svg('text', { x:cx, y:cy+half+22, fill:'#9aa3c7', 'font-size':12, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
            lL.textContent = 'L = ' + L;
            root.appendChild(lL);

            // RIGHT: 3D box (isometric-ish)
            const ox = 480, oy = 220;
            const base = (L - 2*xF) * k * 0.5;  // base side in screen units
            const ht = xF * k * 0.55;            // height
            const tilt = 0.35;
            // back face
            const x0 = ox - base, y0 = oy - tilt*base;
            const x1 = ox + base, y1 = oy - tilt*base - 2*tilt*base + 2*tilt*base;
            // We'll draw the box as polygons. Simpler approach with 3 faces:
            const p1 = [ox - base, oy];
            const p2 = [ox + base, oy];
            const p3 = [ox + base + tilt*base*0.6, oy - tilt*base];
            const p4 = [ox - base + tilt*base*0.6, oy - tilt*base];
            const p1t = [p1[0], p1[1] - ht];
            const p2t = [p2[0], p2[1] - ht];
            const p3t = [p3[0], p3[1] - ht];
            const p4t = [p4[0], p4[1] - ht];
            // bottom (base) - front face (slightly lighter)
            root.appendChild(svg('polygon', { points:[p1,p2,p2t,p1t].map(p=>p.join(',')).join(' '), fill:'#a78bfa33', stroke:'#a78bfa', 'stroke-width':1.6 }));
            // right side
            root.appendChild(svg('polygon', { points:[p2,p3,p3t,p2t].map(p=>p.join(',')).join(' '), fill:'#7c6bd444', stroke:'#a78bfa', 'stroke-width':1.6 }));
            // back / top
            root.appendChild(svg('polygon', { points:[p1t,p2t,p3t,p4t].map(p=>p.join(',')).join(' '), fill:'#5b4d99', stroke:'#a78bfa', 'stroke-width':1.6, opacity:0.55 }));
            // left
            root.appendChild(svg('polygon', { points:[p1,p1t,p4t,[p1[0]+tilt*base*0.6,p1[1]-tilt*base]].map(p=>p.join(',')).join(' '), fill:'#7c6bd433', stroke:'#a78bfa', 'stroke-width':1.6 }));

            // V(x) computation
            const V = xF * Math.pow(L - 2*xF, 2);
            const Vmax = 2 * Math.pow(L, 3) / 27;
            const isMax = Math.abs(xF - L/6) < 0.6;
            const color = isMax ? '#f472b6' : '#a78bfa';
            // Volume bar
            const bx0 = 580, by0 = 280, bh = 200;
            root.appendChild(svg('line', { x1:bx0, y1:by0, x2:bx0+80, y2:by0, stroke:'#3a414f', 'stroke-width':1.5 }));
            const hh = Math.max(2, V / Vmax * bh);
            root.appendChild(svg('rect', { x:bx0+10, y:by0-hh, width:30, height:hh, fill:color, rx:3 }));
            root.appendChild(svg('line', { x1:bx0, y1:by0-bh, x2:bx0+80, y2:by0-bh, stroke:'#f472b6', 'stroke-width':1.2, 'stroke-dasharray':'4 3' }));
            const lV = svg('text', { x:bx0+50, y:by0-hh-6, fill:color, 'font-size':12, 'font-family':'JetBrains Mono' });
            lV.textContent = 'V = ' + V.toFixed(0);
            root.appendChild(lV);
            const lVm = svg('text', { x:bx0+82, y:by0-bh+4, fill:'#f472b6', 'font-size':10, 'font-family':'JetBrains Mono' });
            lVm.textContent = 'V_max';
            root.appendChild(lVm);
            const ttl = svg('text', { x:bx0+25, y:30, fill:'#9aa3c7', 'font-size':12, 'font-family':'JetBrains Mono' });
            ttl.textContent = isMax ? 'x ≈ L/6  → MAX ✓' : 'volume';
            root.appendChild(ttl);
        }
        slider.addEventListener('input', draw);
        draw();
    }

    /* ---------- DISTANCE animation (page 5) ---------- */
    function initDist() {
        const root = document.getElementById('anim-dist');
        const slider = document.getElementById('dist-slider');
        if (!root || !slider) return;
        const W = 720, H = 320;
        const { sx, sy } = buildAxes(root, W, H, -2.5, 2.5, -0.5, 4.2, { l:40, r:30, t:20, b:30 });

        // parabola y = x^2
        const f = x => x*x;
        root.appendChild(buildCurve(sx, sy, f, -2.2, 2.2, '#a78bfa', 2.8));
        // point P(0,2)
        const Px = 0, Py = 2;
        root.appendChild(svg('circle', { cx:sx(Px), cy:sy(Py), r:7, fill:'#fbbf24', stroke:'#0a0d12', 'stroke-width':2 }));
        const lP = svg('text', { x:sx(Px)+12, y:sy(Py)-8, fill:'#fbbf24', 'font-size':13, 'font-family':'JetBrains Mono' });
        lP.textContent = 'P(0, 2)';
        root.appendChild(lP);

        // min markers
        const xm = Math.sqrt(1.5);
        [xm, -xm].forEach(x => {
            root.appendChild(svg('circle', { cx:sx(x), cy:sy(f(x)), r:5, fill:'#34d399', opacity:0.5 }));
        });

        // moving Q
        const line = svg('line', { stroke:'#f472b6', 'stroke-width':2 });
        const Q = svg('circle', { r:7, fill:'#f472b6', stroke:'#0a0d12', 'stroke-width':2 });
        const info = svg('text', { fill:'#f472b6', 'font-size':13, 'font-family':'JetBrains Mono', 'text-anchor':'middle' });
        root.appendChild(line); root.appendChild(Q); root.appendChild(info);

        function draw() {
            const x = parseFloat(slider.value) / 100; // -1.8..1.8
            const y = f(x);
            const d = Math.sqrt(x*x + (y - Py)*(y - Py));
            line.setAttribute('x1', sx(Px)); line.setAttribute('y1', sy(Py));
            line.setAttribute('x2', sx(x));  line.setAttribute('y2', sy(y));
            Q.setAttribute('cx', sx(x)); Q.setAttribute('cy', sy(y));
            const dmin = Math.sqrt(7)/2;
            const isMin = Math.abs(d - dmin) < 0.02;
            info.setAttribute('fill', isMin ? '#34d399' : '#f472b6');
            info.setAttribute('x', (sx(Px) + sx(x))/2);
            info.setAttribute('y', (sy(Py) + sy(y))/2 - 10);
            info.textContent = 'd = ' + d.toFixed(3) + (isMin ? ' MIN ✓' : '');
        }
        slider.addEventListener('input', draw);
        draw();
    }

    /* ====== PLOTTERS (canvas) ====== */
    const FNS = {
        'x3-3x': {
            label: 'f(x) = x³ − 3x',
            f:  x => x*x*x - 3*x, d1: x => 3*x*x - 3, d2: x => 6*x,
            xRange: [-2.6, 2.6], yRange: [-4, 4],
            criticals: [{ x:-1, type:'max', y: 2 }, { x: 1, type:'min', y:-2 }],
            inflections: [{ x: 0, y: 0 }],
            note: 'Punti critici in <span class="hl-pink">x = −1 (max)</span> e <span class="hl-green">x = +1 (min)</span>. Flesso a tangente <span class="hl">obliqua</span> in x = 0.'
        },
        'x4-4x2': {
            label: 'f(x) = x⁴ − 4x²',
            f:  x => Math.pow(x,4) - 4*x*x, d1: x => 4*x*x*x - 8*x, d2: x => 12*x*x - 8,
            xRange: [-2.6, 2.6], yRange: [-5, 5],
            criticals: [{ x:-Math.sqrt(2), type:'min', y:-4 }, { x: 0, type:'max', y: 0 }, { x: Math.sqrt(2), type:'min', y:-4 }],
            inflections: [{ x:-Math.sqrt(2/3), y:-20/9 }, { x: Math.sqrt(2/3), y:-20/9 }],
            note: 'Massimo in <span class="hl-pink">x = 0</span>, due minimi simmetrici in <span class="hl-green">x = ±√2</span>. Due flessi in x = ±√(2/3).'
        },
        'x-1plusx2': {
            label: 'f(x) = x / (1 + x²)',
            f:  x => x / (1 + x*x),
            d1: x => (1 - x*x) / Math.pow(1+x*x, 2),
            d2: x => (2*x*(x*x - 3)) / Math.pow(1+x*x, 3),
            xRange: [-4, 4], yRange: [-0.7, 0.7],
            criticals: [{ x:-1, type:'min', y:-0.5 }, { x: 1, type:'max', y: 0.5 }],
            inflections: [{ x:-Math.sqrt(3), y:-Math.sqrt(3)/4 }, { x: 0, y: 0 }, { x: Math.sqrt(3), y: Math.sqrt(3)/4 }],
            note: 'Massimo in <span class="hl-pink">x = 1</span>, minimo in <span class="hl-green">x = −1</span>. Tre flessi in x = 0, ±√3.'
        },
        'x3': {
            label: 'f(x) = x³',
            f:  x => x*x*x, d1: x => 3*x*x, d2: x => 6*x,
            xRange: [-2, 2], yRange: [-4, 4],
            criticals: [],
            inflections: [{ x: 0, y: 0 }],
            note: '<span class="hl">x = 0</span> è un flesso a tangente <strong>orizzontale</strong>: f′(0)=0 e f″ cambia segno.'
        }
    };

    const plotters = [];

    function makePlotter(canvasId, infoId, defaultFn) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        const wrap = canvas.closest('.plot-wrap');
        const info = document.getElementById(infoId);
        const ctx = canvas.getContext('2d');
        let currentFnKey = defaultFn;

        function fitCanvas() {
            const dpr = window.devicePixelRatio || 1;
            const cssW = canvas.clientWidth, cssH = canvas.clientHeight;
            if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
                canvas.width = cssW * dpr;
                canvas.height = cssH * dpr;
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function draw() {
            const fn = FNS[currentFnKey];
            if (!fn) return;
            fitCanvas();
            const W = canvas.clientWidth, H = canvas.clientHeight;
            ctx.clearRect(0, 0, W, H);
            const [xMin, xMax] = fn.xRange, [yMin, yMax] = fn.yRange;
            const padL=32, padR=16, padT=16, padB=24;
            const pW=W-padL-padR, pH=H-padT-padB;
            const sx = x => padL + (x-xMin)/(xMax-xMin)*pW;
            const sy = y => padT + (yMax-y)/(yMax-yMin)*pH;

            ctx.strokeStyle='#1c2128'; ctx.lineWidth=1; ctx.beginPath();
            for (let gx=Math.ceil(xMin); gx<=Math.floor(xMax); gx++) { ctx.moveTo(sx(gx),padT); ctx.lineTo(sx(gx),padT+pH); }
            const yStep = (yMax-yMin)>6?2:1;
            for (let gy=Math.ceil(yMin/yStep)*yStep; gy<=yMax; gy+=yStep) { ctx.moveTo(padL,sy(gy)); ctx.lineTo(padL+pW,sy(gy)); }
            ctx.stroke();

            ctx.strokeStyle='#3a414f'; ctx.lineWidth=1.5; ctx.beginPath();
            const yZero=sy(0), xZero=sx(0);
            if (yZero>=padT && yZero<=padT+pH) { ctx.moveTo(padL,yZero); ctx.lineTo(padL+pW,yZero); }
            if (xZero>=padL && xZero<=padL+pW) { ctx.moveTo(xZero,padT); ctx.lineTo(xZero,padT+pH); }
            ctx.stroke();

            ctx.fillStyle='#6e7681'; ctx.font='10px JetBrains Mono, monospace'; ctx.textAlign='center';
            for (let gx=Math.ceil(xMin); gx<=Math.floor(xMax); gx++) if (gx!==0) ctx.fillText(gx, sx(gx), Math.min(yZero+12, padT+pH-2));
            ctx.textAlign='right';
            for (let gy=Math.ceil(yMin/yStep)*yStep; gy<=yMax; gy+=yStep) if (gy!==0) ctx.fillText(gy, Math.max(xZero-4, padL-4), sy(gy)+3);

            function plot(func, color, w, dash) {
                ctx.strokeStyle=color; ctx.lineWidth=w; ctx.setLineDash(dash||[]); ctx.beginPath();
                let started=false; const N=600;
                for (let i=0; i<=N; i++) {
                    const x = xMin + (xMax-xMin)*i/N;
                    let y; try { y = func(x); } catch(e){ started=false; continue; }
                    if (!isFinite(y)) { started=false; continue; }
                    const yc = Math.max(yMin-5, Math.min(yMax+5, y));
                    const px=sx(x), py=sy(yc);
                    if (!started) { ctx.moveTo(px,py); started=true; } else ctx.lineTo(px,py);
                }
                ctx.stroke(); ctx.setLineDash([]);
            }
            plot(fn.d2, '#fbbf24', 1.6, [4,4]);
            plot(fn.d1, '#34d399', 1.8, [2,3]);
            plot(fn.f,  '#a78bfa', 2.6);

            (fn.criticals||[]).forEach(c => {
                const color = c.type==='max'?'#f472b6':'#34d399';
                ctx.fillStyle=color; ctx.strokeStyle='#0d1117'; ctx.lineWidth=2;
                ctx.beginPath(); ctx.arc(sx(c.x), sy(c.y), 6, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                ctx.fillStyle=color; ctx.font='11px JetBrains Mono'; ctx.textAlign='center';
                ctx.fillText(c.type.toUpperCase(), sx(c.x), sy(c.y)-11);
            });
            (fn.inflections||[]).forEach(p => {
                ctx.fillStyle='#f472b6'; ctx.strokeStyle='#0d1117'; ctx.lineWidth=2;
                ctx.beginPath(); ctx.arc(sx(p.x), sy(p.y), 5, 0, Math.PI*2); ctx.fill(); ctx.stroke();
                ctx.fillStyle='#f472b6'; ctx.font='10px JetBrains Mono'; ctx.textAlign='center';
                ctx.fillText('flesso', sx(p.x), sy(p.y)+16);
            });

            if (info) info.innerHTML = '<strong>' + fn.label + '</strong> &middot; ' + fn.note;
        }

        if (wrap) wrap.querySelectorAll('.plot-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                wrap.querySelectorAll('.plot-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFnKey = btn.dataset.fn; draw();
            });
        });

        return { draw };
    }

    function setCanvasCss() {
        document.querySelectorAll('.plot-canvas-wrap canvas').forEach(c => {
            const w = Math.min(c.parentElement.clientWidth, 780);
            c.style.width = w + 'px';
            c.style.height = Math.round(w * 380/780) + 'px';
        });
    }

    function init() {
        setCanvasCss();
        const p1 = makePlotter('canvas-flessi', 'plot-info-flessi', 'x3-3x');
        const p2 = makePlotter('canvas-maxmin', 'plot-info-maxmin', 'x4-4x2');
        if (p1) plotters.push(p1);
        if (p2) plotters.push(p2);
        plotters.forEach(p => p.draw());

        initHero();
        initRolle();
        initLagrange();
        initConcav();
        initMaxMinAnim();
        initRect();
        initBox();
        initDist();

        showPage(1);
    }

    window.addEventListener('resize', () => { setCanvasCss(); plotters.forEach(p => p.draw()); });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
