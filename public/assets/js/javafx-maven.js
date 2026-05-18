document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll('.page');
    const totalPages = pages.length;
    let currentPage = sessionStorage.getItem('javafx-maven-page')
        ? Number(sessionStorage.getItem('javafx-maven-page'))
        : 1;

    const navLinks = document.querySelectorAll('.nav-link');
    const pageDots = document.getElementById('page-dots');
    const pageInput = document.getElementById('page-input');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    for (let i = 1; i <= totalPages; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot' + (i === currentPage ? ' active' : '');
        dot.dataset.page = i;
        dot.title = 'Vai a pagina ' + i;
        dot.addEventListener('click', () => goTo(i));
        pageDots.appendChild(dot);
    }

    function updateUI() {
        pages.forEach(page => {
            page.classList.toggle('hidden', Number(page.dataset.index) !== currentPage);
        });

        navLinks.forEach(link => {
            const target = link.dataset.page;
            const page = target === 'quiz'
                ? pages[pages.length - 1]
                : document.getElementById('page-' + target);
            link.classList.toggle('active', page && Number(page.dataset.index) === currentPage);
        });

        pageDots.querySelectorAll('.dot').forEach(dot => {
            dot.classList.toggle('active', Number(dot.dataset.page) === currentPage);
        });

        pageInput.value = currentPage;
        pageInput.max = totalPages;
        btnPrev.classList.toggle('disabled', currentPage === 1);
        btnNext.classList.toggle('disabled', currentPage === totalPages);
    }

    function goTo(index) {
        if (index < 1 || index > totalPages) return;
        currentPage = index;
        sessionStorage.setItem('javafx-maven-page', currentPage);
        updateUI();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    btnPrev.addEventListener('click', () => goTo(currentPage - 1));
    btnNext.addEventListener('click', () => goTo(currentPage + 1));
    navLinks.forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            const target = link.dataset.page;
            const page = target === 'quiz'
                ? pages[pages.length - 1]
                : document.getElementById('page-' + target);
            if (page) goTo(Number(page.dataset.index));
        });
    });

    pageInput.addEventListener('change', () => {
        const value = Number(pageInput.value);
        Number.isInteger(value) ? goTo(value) : updateUI();
    });

    document.querySelectorAll('.ide-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.ide;
            document.querySelectorAll('.ide-tab').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.ide-panel').forEach(panel => panel.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('ide-' + target).classList.add('active');
        });
    });

    const pomInput = document.getElementById('pom-check-input');
    const pomChecklist = document.getElementById('pom-checklist');
    const checks = [
        { id: 'group', label: 'Coordinate Maven: groupId, artifactId, version', test: text => /<groupId>[\s\S]*?<\/groupId>/.test(text) && /<artifactId>[\s\S]*?<\/artifactId>/.test(text) && /<version>[\s\S]*?<\/version>/.test(text) },
        { id: 'controls', label: 'Dipendenza org.openjfx:javafx-controls', test: text => /org\.openjfx[\s\S]*javafx-controls/.test(text) },
        { id: 'compiler', label: 'maven-compiler-plugin con release 17 o superiore', test: text => /maven-compiler-plugin/.test(text) && /<(release|source)> *(1[7-9]|[2-9][0-9]) *<\/(release|source)>/.test(text) },
        { id: 'javafx', label: 'javafx-maven-plugin', test: text => /javafx-maven-plugin/.test(text) },
        { id: 'main', label: 'mainClass verso la classe che estende Application', test: text => /<mainClass>[\s\S]+?<\/mainClass>/.test(text) }
    ];

    function renderPomCheck() {
        const text = pomInput.value;
        pomChecklist.innerHTML = checks.map(check => {
            const ok = check.test(text);
            return '<li class="' + (ok ? 'ok' : 'missing') + '"><span>' + (ok ? 'OK' : '--') + '</span>' + check.label + '</li>';
        }).join('');
    }

    if (pomInput) {
        pomInput.addEventListener('input', renderPomCheck);
        renderPomCheck();
    }

    const commandSelect = document.getElementById('command-select');
    const commandOutput = document.getElementById('command-output');
    const commandMap = {
        run: {
            cmd: 'mvn clean javafx:run',
            out: '[INFO] Compiling 2 source files\n[INFO] --- javafx-maven-plugin:run ---\nJavaFX application started.'
        },
        test: {
            cmd: 'mvn test',
            out: '[INFO] Running it.zuc.gni.AppTest\n[INFO] Tests run: 3, Failures: 0, Errors: 0'
        },
        package: {
            cmd: 'mvn clean package',
            out: '[INFO] Building jar: target/gni-javafx-1.0.0.jar\nNota: il jar non include automaticamente il runtime JavaFX.'
        }
    };

    function renderCommand() {
        const selected = commandMap[commandSelect.value];
        commandOutput.textContent = '$ ' + selected.cmd + '\n\n' + selected.out;
    }

    if (commandSelect) {
        commandSelect.addEventListener('change', renderCommand);
        renderCommand();
    }

    document.querySelectorAll('.file-node').forEach(node => {
        node.addEventListener('click', () => {
            document.querySelectorAll('.file-node').forEach(item => item.classList.remove('selected'));
            node.classList.add('selected');
            document.getElementById('file-explain').textContent = node.dataset.explain;
        });
    });

    document.querySelectorAll('.quiz-option-mini input[type="radio"]').forEach(input => {
        input.addEventListener('change', () => {
            const wrapper = input.closest('.mini-quiz');
            const question = wrapper.querySelector('.quiz-question');
            const feedback = wrapper.querySelector('.mini-quiz-feedback');
            const correct = question.dataset.correct;
            const selected = input.value;

            wrapper.querySelectorAll('.quiz-option-mini').forEach(opt => {
                opt.classList.remove('selected', 'correct', 'wrong');
                opt.classList.add('disabled');
                if (opt.dataset.value === correct) opt.classList.add('correct');
            });

            const option = input.closest('.quiz-option-mini');
            option.classList.add('selected');
            if (selected !== correct) option.classList.add('wrong');

            feedback.className = 'mini-quiz-feedback show ' + (selected === correct ? 'ok' : 'fail');
            feedback.textContent = selected === correct
                ? 'Corretto.'
                : 'Non ancora: guarda la risposta evidenziata in verde.';
        });
    });

    document.querySelectorAll('.quiz-option input[type="radio"]').forEach(input => {
        input.addEventListener('change', () => {
            const q = input.closest('.quiz-question');
            q.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            input.closest('.quiz-option').classList.add('selected');
        });
    });

    document.getElementById('btn-submit-quiz').addEventListener('click', () => {
        const questions = document.querySelectorAll('#page-quiz .quiz-question');
        let score = 0;

        questions.forEach(q => {
            const correct = q.dataset.correct;
            const selected = q.querySelector('input[type="radio"]:checked');
            q.querySelectorAll('.quiz-option').forEach(opt => {
                const input = opt.querySelector('input');
                opt.classList.add('disabled');
                if (input.value === correct) opt.classList.add('correct');
                if (selected && input.checked && input.value !== correct) opt.classList.add('wrong');
            });
            if (selected && selected.value === correct) score++;
        });

        document.getElementById('score-val').textContent = score + ' / ' + questions.length;
        document.getElementById('score-label').textContent = score >= 5
            ? 'Pronto per una traccia GNI di difficolta media.'
            : 'Ripassa setup, pom.xml e ciclo run/debug prima della gara.';
        document.getElementById('quiz-score').classList.add('visible');
    });

    updateUI();
});
