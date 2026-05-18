(function () {
    'use strict';

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
    }

    navLinks.forEach(l => l.addEventListener('click', () => showPage(parseInt(l.dataset.page))));
    btnPrev.addEventListener('click', () => showPage(current - 1));
    btnNext.addEventListener('click', () => showPage(current + 1));
    pageInput.addEventListener('change', () => showPage(parseInt(pageInput.value)));
    pageInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); showPage(parseInt(pageInput.value)); } });
    showPage(1);

    /* ====== MINI QUIZ SYSTEM ====== */
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
                const val = opt.dataset.value;
                if (val === correct) {
                    opt.classList.add('correct');
                    feedback.textContent = 'Corretto!';
                    feedback.className = 'mini-quiz-feedback show ok';
                } else {
                    opt.classList.add('wrong');
                    const c = quiz.querySelector('[data-value="' + correct + '"]');
                    if (c) c.classList.add('correct');
                    feedback.textContent = 'Sbagliato — la risposta corretta &egrave; in verde.';
                    feedback.className = 'mini-quiz-feedback show fail';
                }
                answered = true;
                quiz.querySelectorAll('.quiz-option-mini').forEach(o => o.classList.add('disabled'));
            });
        });
    });

    /* ====== FINAL QUIZ ====== */
    const quizBox = document.getElementById('quiz-box');
    if (quizBox) {
        document.querySelectorAll('#quiz-box .quiz-option').forEach(opt => {
            opt.addEventListener('click', () => {
                const q = opt.closest('.quiz-question');
                q.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                opt.querySelector('input').checked = true;
            });
        });
        document.getElementById('btn-submit-quiz').addEventListener('click', () => {
            let score = 0;
            quizBox.querySelectorAll('.quiz-question').forEach(q => {
                const correct = q.dataset.correct;
                let selected = null;
                q.querySelectorAll('.quiz-option').forEach(o => {
                    o.classList.add('disabled');
                    if (o.querySelector('input').checked) selected = o.querySelector('input').value;
                });
                q.querySelectorAll('.quiz-option').forEach(o => {
                    if (o.querySelector('input').value === correct) o.classList.add('correct');
                    else if (o.querySelector('input').value === selected) o.classList.add('wrong');
                });
                if (selected === correct) score++;
            });
            const total = quizBox.querySelectorAll('.quiz-question').length;
            const sv = document.getElementById('score-val');
            const sl = document.getElementById('score-label');
            sv.textContent = score + '/' + total;
            sl.textContent = score === total ? 'Perfetto! Sei pronto per il CCNA!' : score >= 4 ? 'Ottimo lavoro! Ripassa qualche dettaglio.' : 'Rileggi il tutorial e riprova.';
            document.getElementById('quiz-score').classList.add('visible');
        });
    }

    /* ====== CLI MODE DIAGRAM ====== */
    const modeUser = document.getElementById('mode-user');
    const modePriv = document.getElementById('mode-priv');
    const modeGlobal = document.getElementById('mode-global');
    const arrow1 = document.getElementById('arrow-1');
    const arrow2 = document.getElementById('arrow-2');
    if (modeUser) {
        function showCliMode(mode) {
            [modeUser, modePriv, modeGlobal].forEach(n => n && n.classList.remove('active'));
            if (arrow1) arrow1.classList.remove('active');
            if (arrow2) arrow2.classList.remove('active');
            if (mode === 'user') modeUser.classList.add('active');
            else if (mode === 'priv') { modePriv.classList.add('active'); arrow1.classList.add('active'); }
            else if (mode === 'global') { modeGlobal.classList.add('active'); arrow1.classList.add('active'); arrow2.classList.add('active'); }
        }
        showCliMode('user');
        window.showCliMode = showCliMode;
    }

    /* ====== GENERIC TERMINAL ENGINE ====== */
    function createTerminal(cfg) {
        const outputEl = document.getElementById(cfg.outputId);
        const inputEl = document.getElementById(cfg.inputId);
        const promptEl = document.getElementById(cfg.promptId);
        const resetBtn = document.getElementById(cfg.resetBtnId);
        if (!inputEl || !outputEl) return null;

        let hostname = cfg.hostname || 'Router';
        let mode = 'user'; // user, priv, config
        let currentInterface = null;
        const interfaces = {};
        const vlans = {};
        let hostnameHistory = hostname;

        function promptText() {
            if (mode === 'user') return hostname + '>';
            if (mode === 'priv') return hostname + '#';
            if (currentInterface) return hostname + '(config-if)#';
            return hostname + '(config)#';
        }

        function refreshPrompt() {
            promptEl.textContent = promptText();
        }

        function print(text, cls) {
            const line = document.createElement('div');
            line.className = 't-' + (cls || 'out');
            line.textContent = text;
            outputEl.appendChild(line);
        }

        function printRaw(html) {
            const line = document.createElement('div');
            line.innerHTML = html;
            line.style.whiteSpace = 'pre-wrap';
            line.style.fontFamily = "'JetBrains Mono', monospace";
            line.style.fontSize = '0.82rem';
            line.style.lineHeight = '1.55';
            line.style.color = 'var(--text-muted)';
            outputEl.appendChild(line);
        }

        function processCommand(raw) {
            const input = raw.trim();
            if (!input) return;
            const parts = input.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const rest = input.substring(cmd.length).trim();

            print(promptText() + ' ' + input, 'cmd');

            const needsPriv = cmd !== 'enable' && cmd !== 'exit' && cmd !== 'end' && cmd !== 'help';

            // Auto-complete commands
            const aliases = {
                'conf': 'configure', 'config': 'configure', 'term': 'terminal',
                'show': 'show', 'do': 'do',
            };

            switch (mode) {
                case 'user':
                    if (cmd === 'enable') {
                        mode = 'priv';
                        cfg.onModeChange && cfg.onModeChange('priv');
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'help') {
                        print('Available commands in User Exec mode:');
                        print('  enable         Enter privileged EXEC mode');
                        print('  help           Show available commands');
                        return;
                    }
                    print('% Invalid input at ">" prompt. Type "enable" first.', 'err');
                    break;

                case 'priv':
                    if (cmd === 'configure' || cmd === 'config') {
                        if (rest.toLowerCase() === 'terminal' || rest.toLowerCase() === 't') {
                            mode = 'config';
                            cfg.onModeChange && cfg.onModeChange('config');
                            refreshPrompt();
                            return;
                        }
                        print('% Invalid input. Use "configure terminal"', 'err');
                        return;
                    }
                    if (cmd === 'show') {
                        if (rest.toLowerCase() === 'running-config' || rest.toLowerCase() === 'run') {
                            print('Building configuration...', 'info');
                            const lines = ['Current configuration:'];
                            lines.push('hostname ' + hostname);
                            Object.keys(interfaces).forEach(iface => {
                                lines.push('interface ' + iface);
                                if (interfaces[iface].desc) lines.push(' description ' + interfaces[iface].desc);
                                if (interfaces[iface].ip) lines.push(' ip address ' + interfaces[iface].ip + ' ' + interfaces[iface].mask);
                                if (interfaces[iface].shutdown === false) lines.push(' no shutdown');
                                if (interfaces[iface].switchport) {
                                    if (interfaces[iface].mode === 'trunk') lines.push(' switchport mode trunk');
                                    else if (interfaces[iface].vlan) lines.push(' switchport access vlan ' + interfaces[iface].vlan);
                                }
                                lines.push(' exit');
                            });
                            lines.forEach(l => print(l, 'out'));
                            return;
                        }
                        if (rest.toLowerCase() === 'ip interface brief' || rest.toLowerCase() === 'ip int br') {
                            print('Interface              IP-Address      OK? Method Status                Protocol', 'info');
                            for (const [name, cfg2] of Object.entries(interfaces)) {
                                const ip = cfg2.ip || 'unassigned';
                                const mask = cfg2.mask || '';
                                const status = cfg2.shutdown === false ? 'up' : 'administratively down';
                                const protocol = cfg2.shutdown === false ? 'up' : 'down';
                                print('  ' + name.padEnd(22) + (ip + (mask ? ' ' + mask : '')).padEnd(16) + 'YES ' + (cfg2.manual ? 'manual' : 'unset  ') + status.padEnd(24) + protocol, 'out');
                            }
                            if (Object.keys(interfaces).length === 0) {
                                print('  No interfaces configured yet.', 'out');
                            }
                            return;
                        }
                        if (cfg.extraShow) {
                            const result = cfg.extraShow(rest);
                            if (result) { result.forEach(l => print(l, 'out')); return; }
                        }
                        print('% Incomplete command: show <running-config|ip interface brief' + (cfg.extraShowHint ? '|' + cfg.extraShowHint : '') + '>', 'err');
                        return;
                    }
                    if (cmd === 'exit') {
                        cfg.onModeChange && cfg.onModeChange('user');
                        mode = 'user';
                        hostname = hostnameHistory;
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'help') {
                        print('Available commands in Privileged EXEC mode:');
                        print('  configure terminal    Enter global configuration mode');
                        print('  show running-config   Show current configuration');
                        print('  show ip interface brief  Show interface summary');
                        if (cfg.privHelpExtra) cfg.privHelpExtra();
                        print('  help                  Show available commands');
                        print('  exit                  Return to User EXEC mode');
                        return;
                    }
                    print('% Invalid input at "#" prompt. Type "configure terminal" to configure.', 'err');
                    break;
                case 'config':
                    if (cmd === 'exit') {
                        mode = 'priv';
                        cfg.onModeChange && cfg.onModeChange('priv');
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'end') {
                        mode = 'priv';
                        currentInterface = null;
                        cfg.onModeChange && cfg.onModeChange('priv');
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'hostname') {
                        if (!rest) { print('% Incomplete command: hostname <NAME>', 'err'); return; }
                        hostnameHistory = rest;
                        hostname = rest;
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'interface' || cmd === 'int') {
                        if (!rest) { print('% Interface name required', 'err'); return; }
                        currentInterface = rest;
                        if (!interfaces[currentInterface]) {
                            interfaces[currentInterface] = {};
                        }
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'do') {
                        // Execute a show command from config mode
                        const doRest = rest;
                        if (doRest.startsWith('show ')) {
                            processCommand(doRest);
                            return;
                        }
                        print('% Invalid "do" command. Try: do show ...', 'err');
                        return;
                    }
                    if (cmd === 'help') {
                        print('Global config commands:');
                        print('  hostname <name>       Change the device hostname');
                        print('  interface <name>      Enter interface configuration');
                        print('  exit                  Go back to privileged mode');
                        print('  end                   Exit to privileged mode');
                        if (cfg.configHelpExtra) cfg.configHelpExtra();
                        print('  do show ...           Run show command from config mode');
                        return;
                    }
                    print('% Invalid input at "(config)#" prompt.', 'err');
                    break;
                case 'interface':
                    // handled above in config mode
                    break;
            }
        }

        // The config interface submode needs special handling
        // We handle it in config mode: when in config mode and we have currentInterface,
        // we process interface-level commands
        var processCommand;
        processCommand = function (raw) {
            const input = raw.trim();
            if (!input) return;
            const parts = input.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const rest = input.substring(cmd.length).trim();

            print(promptText() + ' ' + input, 'cmd');

            if (mode === 'config' && currentInterface) {
                // In interface config mode
                if (cmd === 'exit') {
                    currentInterface = null;
                    refreshPrompt();
                    return;
                }
                if (cmd === 'end') {
                    currentInterface = null;
                    mode = 'priv';
                    cfg.onModeChange && cfg.onModeChange('priv');
                    refreshPrompt();
                    return;
                }
                if (cmd === 'ip' && rest.startsWith('address')) {
                    const addrParts = rest.substring(8).trim().split(/\s+/);
                    if (addrParts.length < 2) { print('% Incomplete: ip address <IP> <MASK>', 'err'); return; }
                    interfaces[currentInterface].ip = addrParts[0];
                    interfaces[currentInterface].mask = addrParts[1];
                    return;
                }
                if (cmd === 'no' && rest.startsWith('shutdown')) {
                    interfaces[currentInterface].shutdown = false;
                    return;
                }
                if (cmd === 'shutdown') {
                    interfaces[currentInterface].shutdown = true;
                    return;
                }
                if (cmd === 'description') {
                    interfaces[currentInterface].desc = rest;
                    return;
                }
                if (cmd === 'switchport') {
                    if (rest.startsWith('mode')) {
                        const m = rest.substring(5).trim();
                        interfaces[currentInterface].mode = m;
                        interfaces[currentInterface].switchport = true;
                        return;
                    }
                    if (rest.startsWith('access')) {
                        const vlanParts = rest.split(/\s+/);
                        const vlanIdx = vlanParts.lastIndexOf('vlan');
                        if (vlanIdx >= 0 && vlanParts[vlanIdx + 1]) {
                            interfaces[currentInterface].vlan = parseInt(vlanParts[vlanIdx + 1]);
                        }
                        interfaces[currentInterface].switchport = true;
                        return;
                    }
                }
                if (cmd === 'enable' && rest.startsWith('secret')) {
                    interfaces[currentInterface].password = rest.substring(7).trim() || 'SET';
                    return;
                }
                if (cmd === 'help') {
                    print('Interface config commands:');
                    print('  ip address <IP> <MASK>    Set interface IP address');
                    print('  no shutdown              Activate the interface');
                    print('  shutdown                 Disable the interface');
                    print('  description <text>       Add description');
                    if (cfg.ifaceHelpExtra) cfg.ifaceHelpExtra();
                    print('  exit                     Exit interface config');
                    print('  end                      Exit to privileged mode');
                    return;
                }
                print('% Invalid command in interface config mode.', 'err');
                return;
            }

            // Not in interface submode, process normally
            switch (mode) {
                case 'user':
                    if (cmd === 'enable') {
                        mode = 'priv';
                        cfg.onModeChange && cfg.onModeChange('priv');
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'help') {
                        print('Available: enable, help');
                        return;
                    }
                    print('% Invalid input at ">" prompt. Type "enable" first.', 'err');
                    break;
                case 'priv':
                    if (cmd === 'configure' || cmd === 'config') {
                        if (rest.toLowerCase() === 'terminal' || rest.toLowerCase() === 't') {
                            mode = 'config';
                            cfg.onModeChange && cfg.onModeChange('config');
                            refreshPrompt();
                            return;
                        }
                        print('% Invalid input. Use "configure terminal"', 'err');
                        return;
                    }
                    if (cmd === 'show') {
                        if (rest.toLowerCase() === 'running-config' || rest.toLowerCase() === 'run') {
                            print('Building configuration...', 'info');
                            const lines = ['Current configuration:'];
                            lines.push('hostname ' + hostname);
                            for (const [name, ic] of Object.entries(interfaces)) {
                                lines.push('interface ' + name);
                                if (ic.desc) lines.push(' description ' + ic.desc);
                                if (ic.ip) lines.push(' ip address ' + ic.ip + ' ' + ic.mask);
                                if (ic.shutdown === false) lines.push(' no shutdown');
                                if (ic.switchport) {
                                    if (ic.mode === 'trunk') lines.push(' switchport mode trunk');
                                    else if (ic.vlan) lines.push(' switchport access vlan ' + ic.vlan);
                                }
                                lines.push(' exit');
                            }
                            if (Object.keys(interfaces).length === 0) lines.push('! No interfaces configured.');
                            lines.forEach(l => print(l, 'out'));
                            return;
                        }
                        if (rest.toLowerCase() === 'ip interface brief' || rest.toLowerCase() === 'ip int br' || rest.toLowerCase().startsWith('ip')) {
                            print('Interface              IP-Address      Status                Protocol', 'info');
                            for (const [name, ic] of Object.entries(interfaces)) {
                                const ip = ic.ip || 'unassigned';
                                const status = ic.shutdown === false ? 'up' : 'administratively down';
                                const protocol = ic.shutdown === false ? 'up' : 'down';
                                print('  ' + name.padEnd(22) + ip.padEnd(16) + status.padEnd(24) + protocol, 'out');
                            }
                            if (Object.keys(interfaces).length === 0) print('  No interfaces configured yet.', 'out');
                            return;
                        }
                        if (cfg.extraShow) {
                            const result = cfg.extraShow(rest);
                            if (result) { result.forEach(l => print(l, 'out')); return; }
                        }
                        print('% Incomplete command: show <running-config|ip interface brief>', 'err');
                        return;
                    }
                    if (cmd === 'exit') {
                        mode = 'user';
                        cfg.onModeChange && cfg.onModeChange('user');
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'help') {
                        print('Available: configure terminal, show running-config, show ip interface brief, exit, help'); return;
                    }
                    print('% Invalid input at "#" prompt.', 'err');
                    break;
                case 'config':
                    if (cmd === 'end') {
                        currentInterface = null;
                        mode = 'priv';
                        cfg.onModeChange && cfg.onModeChange('priv');
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'exit') {
                        mode = 'priv';
                        cfg.onModeChange && cfg.onModeChange('priv');
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'hostname') {
                        if (!rest) { print('% Incomplete: hostname <NAME>', 'err'); return; }
                        hostnameHistory = rest;
                        hostname = rest;
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'interface' || cmd === 'int') {
                        if (!rest) { print('% Interface name required', 'err'); return; }
                        currentInterface = rest;
                        if (!interfaces[currentInterface]) interfaces[currentInterface] = {};
                        refreshPrompt();
                        return;
                    }
                    if (cmd === 'do') {
                        const doRest = rest;
                        if (doRest.startsWith('show ')) {
                            // Temporarily use priv for show
                            const saveMode = mode;
                            mode = 'priv';
                            processCommand(doRest);
                            mode = saveMode;
                            return;
                        }
                        print('% Invalid "do" command.', 'err');
                        return;
                    }
                    if (cmd === 'enable' && rest.startsWith('secret')) {
                        interfaces['__enable_secret__'] = { password: rest.substring(7).trim() };
                        return;
                    }
                    if (cmd === 'service' && rest.startsWith('password-encryption')) { return; }
                    if (cmd === 'banner' && rest.startsWith('motd')) { return; }
                    if (cmd === 'help') {
                        print('Global config: hostname, interface, enable secret, do show, exit, end, help');
                        return;
                    }
                    print('% Invalid command in global config mode.', 'err');
                    break;
            }
        };

        inputEl.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                processCommand(inputEl.value);
                inputEl.value = '';
                outputEl.scrollTop = outputEl.scrollHeight;
            }
        });

        const resetFn = () => {
            hostname = cfg.hostname || 'Router';
            mode = 'user';
            currentInterface = null;
            Object.keys(interfaces).forEach(k => { if (!k.startsWith('__')) delete interfaces[k]; });
            outputEl.innerHTML = '';
            print('Terminal reset. Type "enable" to begin.', 'info');
            refreshPrompt();
            cfg.onModeChange && cfg.onModeChange('user');
        };

        if (resetBtn) resetBtn.addEventListener('click', resetFn);

        print('Type "' + (cfg.hostname || 'Router') + ' enable" to begin.', 'info');
        refreshPrompt();
        inputEl.focus();

        return { reset: resetFn };
    }

    /* ====== ROUTER TERMINAL ====== */
    const routerTerm = createTerminal({
        outputId: 'terminal-router-output',
        inputId: 'terminal-router-input',
        promptId: 'terminal-router-prompt',
        hostname: 'Router'
    });
    document.querySelector('[data-terminal="router"]')?.addEventListener('click', () => routerTerm && routerTerm.reset());

    /* ====== SWITCH TERMINAL ====== */
    const switchTerm = createTerminal({
        outputId: 'terminal-switch-output',
        inputId: 'terminal-switch-input',
        promptId: 'terminal-switch-prompt',
        hostname: 'SW1',
        privHelpExtra: function () {
            print('  show vlan brief    Show VLAN table');
            print('  show interfaces   Show interface status');
        },
        extraShow: function (rest) {
            if (rest.toLowerCase() === 'vlan brief' || rest.toLowerCase() === 'vlan') {
                return [
                    'VLAN  Name             Status    Ports',
                    '----  ---------------  -------   ----',
                    '1     default          active',
                    '10    DIPARTIMENTO_A   active',
                    '20    DIPARTIMENTO_B   active',
                ];
            }
            return null;
        }
    });
    document.querySelector('[data-terminal="switch"]')?.addEventListener('click', () => switchTerm && switchTerm.reset());

    if (window.showCliMode) window.showCliMode('user');

    /* ====== SWITCH PORT GRID ====== */
    const grid = document.getElementById('switch-port-grid');
    if (grid) {
        const portVlans = {};
        const vlanColors = { 10: 'vlan-10', 20: 'vlan-20', 99: 'vlan-99', trunk: 'vlan-trunk' };
        const names = [];
        for (let i = 1; i <= 24; i++) names.push('Fa0/' + i);
        names.push('Gi0/1', 'Gi0/2');

        function renderGrid() {
            grid.innerHTML = '';
            names.forEach(name => {
                const cell = document.createElement('div');
                const vlan = portVlans[name];
                cell.className = 'port-cell' + (vlan ? ' vlan-' + vlan : '');
                cell.innerHTML = '<span class="port-num">' + name + '</span>' +
                    '<span class="port-vlan">' + (vlan === 'trunk' ? 'trunk' : vlan ? 'VLAN ' + vlan : '—') + '</span>';
                cell.addEventListener('click', () => {
                    const current = portVlans[name];
                    if (!current) { portVlans[name] = 10; }
                    else if (current === 10) { portVlans[name] = 20; }
                    else if (current === 20) { portVlans[name] = 99; }
                    else if (current === 99) { portVlans[name] = 'trunk'; }
                    else if (current === 'trunk') { delete portVlans[name]; }
                    renderGrid();
                    updateVlanDetail(name);
                });
                grid.appendChild(cell);
            });
        }
        renderGrid();

        function updateVlanDetail(name) {
            const detail = document.getElementById('vlan-detail');
            if (detail && name) {
                const v = portVlans[name] || '—';
                detail.style.display = 'block';
                detail.textContent = name + ': ' + (v === 'trunk' ? 'Trunk' : 'VLAN ' + v);
            }
        }
    }

    /* ====== RIP ANIMATION ====== */
    const btnRipActivate = document.getElementById('btn-rip-activate');
    const btnRipShow = document.getElementById('btn-rip-show-table');
    const ripResult = document.getElementById('rip-result');
    let ripActive = false;

    if (btnRipActivate) {
        btnRipActivate.addEventListener('click', () => {
            if (ripActive) return;
            ripActive = true;
            ripResult.textContent = 'Inizializzazione RIP...';
            const pkts = document.getElementById('rip-packets');
            if (pkts) pkts.classList.add('active');

            setTimeout(() => {
                ripResult.textContent = 'T+0s  — R1: invio tabella di routing a R2 (multicast 224.0.0.9)';
            }, 500);
            setTimeout(() => {
                ripResult.textContent = 'T+0s  — R1 → invio: 192.168.1.0/24\nT+0s  — R1 → invio: 10.0.0.0/30';
            }, 1500);
            setTimeout(() => {
                ripResult.textContent = 'T+5s  — R2 riceve aggiornamenti da R1\nT+5s  — R2: aggiungo R 192.168.1.0/24 [120/1] via 10.0.0.1';
            }, 3000);
            setTimeout(() => {
                ripResult.textContent = 'T+5s  — R2 → invia la propria tabella: 172.16.0.0/24\nT+10s — R1 riceve aggiornamenti da R2\nT+10s — R1: aggiungo R 172.16.0.0/24 [120/1] via 10.0.0.2';
                // Add RIP routes to both routers
                const r1Routes = document.getElementById('rip-r1-routes');
                const r2Routes = document.getElementById('rip-r2-routes');
                if (r1Routes) r1Routes.innerHTML += '\n<span class="rip-route-item rip">R 172.16.0.0/24 [120/1]</span>';
                if (r2Routes) r2Routes.innerHTML += '\n<span class="rip-route-item rip">R 192.168.1.0/24 [120/1]</span>';
                document.getElementById('rip-r1')?.classList.add('active');
                document.getElementById('rip-r2')?.classList.add('active');
            }, 5000);
            setTimeout(() => {
                ripResult.textContent = 'RIPv2 attivo! Entrambi i router hanno imparato le rotte dell\'altro.\nClicca "show ip route" per vedere la tabella completa.';
            }, 7000);
        });
    }

    if (btnRipShow) {
        btnRipShow.addEventListener('click', () => {
            let text = '';
            if (ripActive) {
                text = 'R1# show ip route\n\n' +
                    'Codes: C - connected, S - static, R - RIP\n\n' +
                    'C 192.168.1.0/24        GigabitEthernet0/0\n' +
                    'C 10.0.0.0/30           GigabitEthernet0/1\n' +
                    'R 172.16.0.0/24 [120/1] via 10.0.0.2, Gi0/1\n' +
                    '\n' +
                    'R2# show ip route\n\n' +
                    'Codes: C - connected, S - static, R - RIP\n\n' +
                    'C 172.16.0.0/24         GigabitEthernet0/1\n' +
                    'C 10.0.0.0/30           GigabitEthernet0/0\n' +
                    'R 192.168.1.0/24 [120/1] via 10.0.0.1, Gi0/0';
            } else {
                text = 'R1# show ip route\n\n' +
                    'Codes: C - connected\n\n' +
                    'C 192.168.1.0/24         GigabitEthernet0/0\n' +
                    'C 10.0.0.0/30           GigabitEthernet0/1\n' +
                    '\nNessuna rotta dinamica. Attiva RIPv2 prima!';
            }
            if (ripResult) ripResult.textContent = text;
        });
    }

    /* ====== DHCP ANIMATION ====== */
    const btnDhcpStart = document.getElementById('btn-dhcp-start');
    const btnDhcpReset = document.getElementById('btn-dhcp-reset');
    const stepText = document.getElementById('dhcp-step-text');
    let dhcpRunning = false;

    const doraSteps = [
        {
            label: '1. DISCOVER',
            desc: 'PC1: DHCP Discover (broadcast 255.255.255.255)\n"I am PC1, looking for a DHCP server on my network!"',
            pkt: 1,
        },
        {
            label: '2. OFFER',
            desc: 'Server: DHCP Offer (unicast via R1 ip-helper)\n"Hi PC1! I can offer you 192.168.10.10, mask 255.255.255.0, GW 192.168.10.1"',
            pkt: 2,
        },
        {
            label: '3. REQUEST',
            desc: 'PC1: DHCP Request (broadcast via R1 ip-helper)\n"I accept the offer for 192.168.10.10!"',
            pkt: 3,
        },
        {
            label: '4. ACK',
            desc: 'Server: DHCP ACK (unicast via R1 ip-helper)\n"Confirmed! 192.168.10.10 is yours for 24 hours."',
            pkt: 4,
        },
    ];

    function resetDhcp() {
        dhcpRunning = false;
        stepText && (stepText.textContent = 'In attesa...');
        document.getElementById('pc1-ip') && (document.getElementById('pc1-ip').textContent = '—');
        for (let i = 1; i <= 4; i++) {
            const fill = document.getElementById('pkt-fill-' + i);
            if (fill) fill.classList.remove('filled');
            const pkt = document.getElementById('dhcp-pkt-' + i);
            if (pkt) pkt.classList.remove('done');
        }
        ['dhcp-pc1', 'dhcp-router', 'dhcp-server'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('active');
        });
    }

    function runStep(idx) {
        if (idx >= doraSteps.length) {
            // All done
            document.getElementById('pc1-ip') && (document.getElementById('pc1-ip').textContent = '192.168.10.10\n255.255.255.0');
            dhcpRunning = false;
            return;
        }
        const step = doraSteps[idx];
        stepText && (stepText.textContent = step.label);
        // Highlight device
        const devices = ['dhcp-pc1', 'dhcp-router', 'dhcp-server'];
        devices.forEach(id => { document.getElementById(id)?.classList.remove('active'); });
        if (idx % 2 === 0) document.getElementById('dhcp-pc1')?.classList.add('active');
        else if ((idx - 1) % 2 === 0) document.getElementById('dhcp-server')?.classList.add('active');

        // Fill progress bar
        const fill = document.getElementById('pkt-fill-' + step.pkt);
        if (fill) fill.classList.add('filled');
        const pkt = document.getElementById('dhcp-pkt-' + step.pkt);
        if (pkt) pkt.classList.add('done');

        setTimeout(() => runStep(idx + 1), 1200);
    }

    if (btnDhcpStart) {
        btnDhcpStart.addEventListener('click', () => {
            if (dhcpRunning) return;
            dhcpRunning = true;
            resetDhcp();
            setTimeout(() => runStep(0), 300);
        });
    }
    if (btnDhcpReset) btnDhcpReset.addEventListener('click', resetDhcp);

})();