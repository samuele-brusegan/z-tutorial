document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       PAGINATION / PAGE NAVIGATION
       ============================================================ */
    const pages     = document.querySelectorAll('.page');
    const totalPages = pages.length;
    let   currentPage = sessionStorage.getItem('js-tutorial-page')
        ? Number(sessionStorage.getItem('js-tutorial-page'))
        : 1;

    const navLinks   = document.querySelectorAll('.nav-link');
    const pageDots   = document.getElementById('page-dots');
    const pageInput  = document.getElementById('page-input');
    const btnPrev    = document.getElementById('btn-prev');
    const btnNext    = document.getElementById('btn-next');

    // Build dots
    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === 1 ? ' active' : '');
        dot.dataset.page = i;
        dot.style.cursor = 'pointer';
        dot.title = 'Vai a ' + i;
        dot.addEventListener('click', () => goTo(i));
        pageDots.appendChild(dot);
    }

    function updateUI() {
        // Show / hide pages
        pages.forEach(p => {
            const idx = Number(p.dataset.index);
            p.classList.toggle('hidden', idx !== currentPage);
        });

        // Nav links active
        navLinks.forEach(link => {
            const target = link.dataset.page;
            let targetIdx;
            if (target === 'quiz') {
                targetIdx = totalPages;
            } else {
                const pageEl = document.getElementById('page-' + target);
                targetIdx = pageEl ? Number(pageEl.dataset.index) : null;
            }
            link.classList.toggle('active', targetIdx === currentPage);
        });

        // Dots
        pageDots.querySelectorAll('.dot').forEach(d => {
            d.classList.toggle('active', Number(d.dataset.page) === currentPage);
        });

        // Input
        pageInput.value = currentPage;
        pageInput.max = totalPages;

        // Prev / Next buttons
        btnPrev.classList.toggle('disabled', currentPage === 1);
        btnNext.classList.toggle('disabled', currentPage === totalPages);
    }

    function goTo(index) {
        if (index < 1 || index > totalPages) return;
        currentPage = index;
        sessionStorage.setItem('js-tutorial-page', currentPage);
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnPrev.addEventListener('click', () => goTo(currentPage - 1));
    btnNext.addEventListener('click', () => goTo(currentPage + 1));

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.page;
            if (target === 'quiz') {
                goTo(totalPages);
            } else {
                const pageEl = document.getElementById('page-' + target);
                if (pageEl) goTo(Number(pageEl.dataset.index));
            }
        });
    });

    document.getElementById('nav-home').addEventListener('click', (e) => {
        e.preventDefault();
        goTo(1);
    });

    pageInput.addEventListener('change', () => {
        const val = parseInt(pageInput.value, 10);
        if (!isNaN(val) && val >= 1 && val <= totalPages) {
            goTo(val);
        } else {
            pageInput.value = currentPage;
        }
    });

    pageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = parseInt(pageInput.value, 10);
            if (!isNaN(val) && val >= 1 && val <= totalPages) {
                goTo(val);
            } else {
                pageInput.value = currentPage;
            }
        }
    });

    updateUI();

    /* ============================================================
       BUBBLING DEMO
       ============================================================ */
    const logOut = document.getElementById('log-output');
    let logCounter = 0;
    let bubbleRunning = false;

    // Ordine: capturing (document → inner), bubbling (inner → document)
    const capturePath = ['document', 'body', 'outer', 'middle', 'inner'];
    const bubblePath  = ['inner', 'middle', 'outer', 'body', 'document'];

    // Quali nodi hanno stopPropagation attivo (cliccabili multipli)
    const stopTargets = new Set();

    const boxColor = { outer: '#58a6ff', middle: '#f7df1e', inner: '#ff7b72' };

    function resetBubbles() {
        capturePath.forEach(name => {
            const el = document.getElementById('bubble-' + name);
            if (el) el.classList.remove('glow-capture', 'glow-bubble', 'glow-blocked');
        });
    }

    function glowNode(name, phase) {
        const el = document.getElementById('bubble-' + name);
        if (el) {
            el.classList.remove('glow-capture', 'glow-bubble', 'glow-blocked');
            el.classList.add('glow-' + phase);
        }
    }

    function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function logMessage(msg, color) {
        logCounter++;
        logOut.textContent += '\n[' + logCounter + '] ' + msg;
        logOut.style.color = color || '#8b949e';
        await delay(250);
    }

    // Stop propagation: toggle per nodo (cliccabili)
    document.querySelectorAll('.bubble-stop-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            if (stopTargets.has(target)) {
                stopTargets.delete(target);
                btn.classList.remove('active');
            } else {
                stopTargets.add(target);
                btn.classList.add('active');
            }
        });
        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
            }
        });
    });

    // Scoprì dove è stato cliccato guardando l'elemento più interno
    function getClickedBox(e) {
        if (e.target.closest('#box-inner')) return 'inner';
        if (e.target.closest('#box-middle')) return 'middle';
        return 'outer'; // click diretto su outer
    }

    // Handler sui tre box: ognuno ferma il bubbling nativo per evitare duplicati
    ['box-inner', 'box-middle', 'box-outer'].forEach(boxId => {
        document.getElementById(boxId).addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (bubbleRunning) return;

            const target = getClickedBox(e);
            bubbleRunning = true;
            resetBubbles();
            logOut.textContent = '';
            logCounter = 0;
            runCaptureThenBubble(target);
        });
    });

    // Fase capturing: document → target con delay
    async function runCapturePhase(targetName) {
        const targetIdx = capturePath.indexOf(targetName);
        for (let i = 0; i <= targetIdx; i++) {
            const name = capturePath[i];
            glowNode(name, 'capture');
            await logMessage('capturing → ' + name, '#58a6ff');
        }
    }

    // Fase bubbling: target → document con delay, controllando stopPropagation
    async function runBubblePhase(startName) {
        const startIdx = bubblePath.indexOf(startName);
        for (let i = startIdx; i < bubblePath.length; i++) {
            const name = bubblePath[i];

            // Se il nodo precedente aveva stopPropagation, blocchiamo qui
            if (i > startIdx && stopTargets.has(bubblePath[i - 1])) {
                await logMessage('→ stopPropagation() su ' + bubblePath[i - 1] + ' — bubbling bloccato!', '#f85149');
                for (let j = i; j < bubblePath.length; j++) {
                    const blockedEl = document.getElementById('bubble-' + bubblePath[j]);
                    if (blockedEl && !blockedEl.classList.contains('glow-bubble')) {
                        blockedEl.classList.add('glow-blocked');
                    }
                }
                bubbleRunning = false;
                return;
            }

            glowNode(name, 'bubble');
            await logMessage('bubbling → ' + name, boxColor[name] || '#8b949e');
        }
    }

    async function runCaptureThenBubble(targetName) {
        await runCapturePhase(targetName);
        await logMessage('── target raggiunto: ' + targetName + ' ──', '#f7df1e');
        await delay(500);
        await runBubblePhase(targetName);
        bubbleRunning = false;
    }

    document.getElementById('btn-clear-log').addEventListener('click', () => {
        logOut.textContent = '';
        logCounter = 0;
        resetBubbles();
    });

    /* ============================================================
       DOM DEMO
       ============================================================ */
    const domElList = document.getElementById('dom-output');
    let domCount = 0;

    document.getElementById('btn-add').addEventListener('click', () => {
        domCount++;
        if (domCount === 1) domElList.innerHTML = '';
        const el = document.createElement('div');
        el.className = 'added-item';
        el.innerHTML =
            '<span class="tag-badge">div</span> Elemento #' + domCount +
            ' \u2014 creato con <code>.createElement()</code> + <code>.appendChild()</code>';
        domElList.appendChild(el);
    });

    document.getElementById('btn-remove').addEventListener('click', () => {
        const last = domElList.lastElementChild;
        if (last && last.className === 'added-item') {
            last.remove();
        }
        if (!domElList.lastElementChild) {
            domElList.innerHTML = '<em>...niente ancora, clicca un bottone...</em>';
            domCount = 0;
        }
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        domElList.innerHTML = '<em>...svuotato con .innerHTML = ""</em>';
        domCount = 0;
    });

    /* ============================================================
       PROMISE LAB
       ============================================================ */
    const promiseOut   = document.getElementById('promise-result');
    const stPending    = document.getElementById('state-pending');
    const stFulfilled  = document.getElementById('state-fulfilled');
    const stRejected   = document.getElementById('state-rejected');

    function resetStates() {
        stPending.classList.remove('glow-pending');
        stFulfilled.classList.remove('glow-fulfilled');
        stRejected.classList.remove('glow-rejected');
        promiseOut.style.color = '#8b949e';
    }

    function setGlow(el, cls) {
        resetStates();
        el.classList.add(cls);
    }

    document.getElementById('btn-promise-ok').addEventListener('click', async () => {
        resetStates();
        promiseOut.textContent = '1. Creo una Promise...';
        setGlow(stPending, 'glow-pending');

        await new Promise(r => setTimeout(r, 1500));

        setGlow(stFulfilled, 'glow-fulfilled');
        promiseOut.style.color = '#3fb950';
        promiseOut.textContent =
            '2. La callback chiama resolve("Tutto OK!")\n' +
            '3. La Promise passa da "pending" a "fulfilled"\n\n' +
            'Risultato: "Tutto OK!"\n\n' +
            'La Promise \u00E8 stata mantenuta. Ora il codice nel .then() (o dopo il await) pu\u00F2 usare il risultato.';
    });

    document.getElementById('btn-promise-fail').addEventListener('click', async () => {
        resetStates();
        promiseOut.textContent = '1. Creo una Promise...';
        setGlow(stPending, 'glow-pending');

        await new Promise(r => setTimeout(r, 1500));

        setGlow(stRejected, 'glow-rejected');
        promiseOut.style.color = '#f85149';
        promiseOut.textContent =
            '2. La callback chiama reject("Errore di rete")\n' +
            '3. La Promise passa a "rejected"\n\n' +
            'Errore: "Errore di rete"\n\n' +
            'L\'errore \u00E8 catturato dal .catch(). Senza il catch, il programma andrebbe in crash.';
    });

    document.getElementById('btn-promise-chain').addEventListener('click', async () => {
        resetStates();
        promiseOut.textContent = '\u23F3 Catena di Promise avviata...';
        setGlow(stPending, 'glow-pending');

        promiseOut.textContent = '\u2192 Step 1: scarico i dati dal server...';
        await new Promise(r => setTimeout(r, 1000));

        promiseOut.textContent += '\n\u2713 Step 1 completato \u2192 Step 2';
        await new Promise(r => setTimeout(r, 1000));

        promiseOut.textContent += '\n\u2192 Step 2: trasformo i dati (JSON)...';
        await new Promise(r => setTimeout(r, 1000));

        promiseOut.textContent += '\n\u2713 Step 2 completato \u2192 Step 3';
        await new Promise(r => setTimeout(r, 1000));

        promiseOut.textContent += '\n\u2192 Step 3: aggiorno la pagina...';
        await new Promise(r => setTimeout(r, 800));

        setGlow(stFulfilled, 'glow-fulfilled');
        promiseOut.style.color = '#3fb950';
        promiseOut.textContent +=
            '\n\u2713 Step 3 completato\n\n' +
            'Catena completa! Ogni "await" ha aspettato che la Promise precedente finisse.';
    });

    /* ============================================================
       FETCH DEMO
       ============================================================ */
    const fetchOut = document.getElementById('fetch-output');

    document.getElementById('btn-fetch').addEventListener('click', async () => {
        fetchOut.textContent = 'Caricamento in corso...';
        try {
            const resp = await fetch('https://jsonplaceholder.typicode.com/users?_limit=5');
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            const users = await resp.json();
            fetchOut.textContent = 'OK! Ricevuti ' + users.length + ' utenti:\n\n' +
                users.map(u => '  ' + u.name + ' \u2014 ' + u.email).join('\n');
        } catch (err) {
            fetchOut.textContent = 'Errore: ' + err.message;
        }
    });

    /* ============================================================
       MINI QUIZ (per-argomento, auto-grading al click)
       ============================================================ */
    document.querySelectorAll('.quiz-option-mini input[type="radio"]').forEach(input => {
        input.addEventListener('change', () => {
            const wrapper = input.closest('.mini-quiz');
            const question = wrapper.querySelector('.quiz-question');
            const feedback = wrapper.querySelector('.mini-quiz-feedback');
            const correct = question.dataset.correct;
            const selected = input.value;

            // Highlight selected option
            wrapper.querySelectorAll('.quiz-option-mini').forEach(opt => {
                opt.classList.remove('selected', 'correct', 'wrong');
            });
            const chosenOpt = input.closest('.quiz-option-mini');
            chosenOpt.classList.add('selected');

            // Show correct/wrong
            if (selected === correct) {
                chosenOpt.classList.add('correct');
                feedback.className = 'mini-quiz-feedback show ok';
                feedback.textContent = 'Corretto!';
            } else {
                chosenOpt.classList.add('wrong');
                // Show which was correct
                wrapper.querySelectorAll('.quiz-option-mini').forEach(opt => {
                    if (opt.dataset.value === correct) {
                        opt.classList.add('correct');
                    }
                });
                feedback.className = 'mini-quiz-feedback show fail';
                feedback.textContent = 'Sbagliato. La risposta corretta è evidenziata in verde.';
            }

            // Disable further interaction
            wrapper.querySelectorAll('.quiz-option-mini').forEach(opt => {
                opt.classList.add('disabled');
            });
        });
    });

    /* ============================================================
       QUIZ FINALE
       ============================================================ */
    document.getElementById('btn-submit-quiz').addEventListener('click', () => {
        const questions = document.querySelectorAll('.quiz-question');
        let score = 0;

        questions.forEach(q => {
            const correct = q.dataset.correct;
            const selected = q.querySelector('input[type="radio"]:checked');
            const options = q.querySelectorAll('.quiz-option');

            options.forEach(opt => {
                opt.classList.add('disabled');
                const input = opt.querySelector('input');

                // highlight the correct answer
                if (input.value === correct) {
                    opt.classList.add('correct');
                }
                // highlight wrong selection
                if (selected && opt.classList.contains('selected') && input.value !== correct) {
                    opt.classList.add('wrong');
                }
            });

            if (selected && selected.value === correct) {
                score++;
            }
        });

        const total = questions.length;
        const scoreBox = document.getElementById('quiz-score');
        const scoreVal = document.getElementById('score-val');
        const scoreLabel = document.getElementById('score-label');

        scoreVal.textContent = score + ' / ' + total;

        if (score === total) {
            scoreLabel.textContent = 'Perfetto! Hai capito tutto alla grande!';
        } else if (score >= total * 0.7) {
            scoreLabel.textContent = 'Buon lavoro! Rivedi solo qualche concetto.';
        } else if (score >= total * 0.4) {
            scoreLabel.textContent = 'Non male, ma ripassa alcuni argomenti.';
        } else {
            scoreLabel.textContent = 'Conviene rileggere le spiegazioni e riprovare.';
        }

        scoreBox.classList.add('visible');
    });

    // Track selected option visually
    document.querySelectorAll('.quiz-option input[type="radio"]').forEach(input => {
        input.addEventListener('change', () => {
            const q = input.closest('.quiz-question');
            q.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            input.closest('.quiz-option').classList.add('selected');
        });
    });

});
