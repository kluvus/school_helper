document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('contentArea');
    const aiArea = document.getElementById('aiArea');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const navBtns = document.querySelectorAll('.nav-btn');
    const themeToggle = document.getElementById('themeToggle');
    const aiBtn = document.getElementById('aiBtn');
    const aiInput = document.getElementById('aiInput');

    const PROXY_URL = window.PROXY_URL || "https://workers.dev";
    const SYMBOL_SETS = window.SYMBOL_SETS || {};
    const SUBJECTS_CONFIG = window.SUBJECTS_CONFIG || {};

    let currentSubject = 'russian';
    let lastRequestTime = 0;
    let lastGeneratedExamTask = '';

    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    function buildSymbolBar(inputId, subj) {
        const syms = SYMBOL_SETS[subj] || SYMBOL_SETS.ai || [];
        return syms.map(s => `<button type="button" class="btn btn-outline sym-btn" data-target="${inputId}" data-sym="${esc(s)}" style="padding:0.35rem 0.65rem;font-size:0.9rem;min-width:36px;">${esc(s)}</button>`).join('');
    }

    document.addEventListener('click', (e) => {
        const symBtn = e.target.closest('.sym-btn');
        if (symBtn) {
            const el = document.getElementById(symBtn.dataset.target);
            if (!el) return;
            const ins = symBtn.dataset.sym === 'a/b' ? ' / ' : symBtn.dataset.sym;
            const pos = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
            el.value = el.value.slice(0, pos) + ins + el.value.slice(el.selectionEnd || pos);
            el.focus();
            return;
        }
        const chip = e.target.closest('.topic-chip');
        if (chip) {
            document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('selected-chip'));
            chip.classList.add('selected-chip');
            const inp = document.getElementById(chip.dataset.input || 'themeInput');
            if (inp) { inp.value = chip.dataset.topic; inp.focus(); }
        }
    });

    const aiSymBox = document.getElementById('aiSymbols');
    if (aiSymBox) aiSymBox.innerHTML = buildSymbolBar('aiInput', 'ai');

    if (themeToggle) {
        themeToggle.onclick = () => {
            const dark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
            themeToggle.textContent = dark ? '🌙' : '☀️';
        };
    }

    navBtns.forEach(btn => {
        btn.onclick = () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSubject = btn.dataset.subject;
            contentArea.style.display = currentSubject === 'ai' ? 'none' : 'block';
            aiArea.style.display = currentSubject === 'ai' ? 'block' : 'none';
            if (currentSubject === 'homework') renderHomeworkHelper();
            else if (currentSubject === 'exam') renderExamHelper();
            else if (currentSubject !== 'ai') renderSubject(currentSubject);
        };
    });

    const getGrades = (min = 1, def = 8) => Array.from({ length: 12 - min }, (_, idx) => {
        const g = min + idx;
        return `<option value="${g} класс" ${g === def ? 'selected' : ''}>${g} класс</option>`;
    }).join('');

    const getSubjOpts = (sel = 'algebra') => Object.entries(SUBJECTS_CONFIG)
        .map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v.icon} ${v.title}</option>`).join('');

    function openTool(tool, subjKey) {
        navBtns.forEach(b => b.classList.remove('active'));
        const b = document.querySelector(`[data-subject="${tool}"]`);
        if (b) b.classList.add('active');
        currentSubject = tool;
        contentArea.style.display = 'block';
        aiArea.style.display = 'none';
        if (tool === 'homework') renderHomeworkHelper(subjKey);
        if (tool === 'exam') renderExamHelper(subjKey);
    }
    function renderSubject(subj) {
        if (subj === 'russian') {
            contentArea.innerHTML = `<div class="generator-box"><h3>📖 Русский язык</h3><p>Выберите формат работы, популярную тему или впишите свою.</p><div class="controls"><button class="btn" id="rEs">📝 Сочинение</button><button class="btn btn-outline" id="rDi">✍️ Диктант</button><button class="btn btn-outline" id="rEx">🧩 Задание</button><button class="btn btn-hw" id="rHw">🎒 Помощь с ДЗ</button><button class="btn btn-exam" id="rExm">🎯 ОГЭ / ЕГЭ</button></div></div><div id="russianResult"></div>`;
            document.getElementById('rEs').onclick = () => renderRusGen('essay');
            document.getElementById('rDi').onclick = () => renderRusGen('dictation');
            document.getElementById('rEx').onclick = () => renderRusGen('exercise');
            document.getElementById('rHw').onclick = () => openTool('homework', 'russian');
            document.getElementById('rExm').onclick = () => openTool('exam', 'russian');
            renderRusGen('exercise');
        } else if (SUBJECTS_CONFIG[subj]) {
            const s = SUBJECTS_CONFIG[subj];
            const chips = s.types.map(t => `<button type="button" class="btn btn-outline topic-chip" data-input="themeInput" data-topic="${esc(t)}">${esc(t)}</button>`).join('');
            const syms = SYMBOL_SETS[subj] ? `<div style="display:flex;justify-content:center;gap:0.35rem;flex-wrap:wrap;margin-top:0.8rem;">${buildSymbolBar('themeInput', subj)}</div>` : '';
            contentArea.innerHTML = `<div class="generator-box"><h3>${s.icon} ${s.title}</h3><p>${s.description || 'Выберите класс и тему. ИИ составит задание и распишет подробное решение.'}</p><div class="topics-label">Популярные темы:</div><div class="controls">${chips}</div>${syms}<div class="controls" style="margin-top:0.8rem;"><select id="gradeLevel">${getGrades(s.minGrade, s.defaultGrade)}</select><input type="text" id="themeInput" placeholder="Введите любую свою тему..."><select id="taskComplexity"><option value="лёгкая">Лёгкая</option><option value="средняя" selected>Средняя</option><option value="сложная">Сложная</option></select><button class="btn" id="genBtn">Сгенерировать</button><button class="btn btn-hw" id="sHw">🎒 Помощь с ДЗ</button><button class="btn btn-exam" id="sExm">🎯 ОГЭ / ЕГЭ</button></div><div id="resultBox" style="margin-top:1.5rem;"></div></div>`;
            document.getElementById('genBtn').onclick = () => generateAI(subj);
            document.getElementById('sHw').onclick = () => openTool('homework', subj);
            document.getElementById('sExm').onclick = () => openTool('exam', subj);
        }
    }

    function renderRusGen(type) {
        const chips = SUBJECTS_CONFIG.russian.types.map(t => `<button type="button" class="btn btn-outline topic-chip" data-input="themeInput" data-topic="${esc(t)}">${esc(t)}</button>`).join('');
        const titles = { essay: '📝 Сочинение-рассуждение', dictation: '✍️ Текст для диктанта', exercise: '🧩 Тренировочное упражнение' };
        document.getElementById('russianResult').innerHTML = `<div class="generator-box" style="border-style:solid;text-align:left;"><h3>${titles[type]}</h3><div class="controls" style="justify-content:flex-start;">${chips}</div><div class="controls" style="justify-content:flex-start;"><select id="gradeLevel">${getGrades(1, 8)}</select><input type="text" id="themeInput" placeholder="Введите тему..."><button class="btn" id="genBtn">Сгенерировать</button></div><div id="resultBox" style="margin-top:1.5rem;"></div></div>`;
        document.getElementById('genBtn').onclick = () => generateAI(type);
    }

    function renderHomeworkHelper(sel = 'algebra') {
        contentArea.innerHTML = `<div class="generator-box" style="text-align:left;"><h3>🎒 Умный помощник с домашним заданием</h3><div class="hw-notice"><strong>Принцип честной учёбы:</strong> Мы не даём готовых ответов для списывания — ты получишь разбор правила, похожий пример и подсказку для своего задания.</div><div class="controls" style="justify-content:flex-start;"><select id="hwSubject">${getSubjOpts(sel)}</select><select id="hwGrade">${getGrades(1, 8)}</select><select id="hwMode"><option value="explain">🔍 Объяснить + похожий пример</option><option value="hint">💡 Только подсказка для 1 шага</option><option value="check">✅ Проверить моё решение</option></select></div><div id="hwSymbolsBar" style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-bottom:0.7rem;">${buildSymbolBar('hwTaskInput', sel)}</div><textarea id="hwTaskInput" class="hw-textarea" placeholder="Впишите условие задания..."></textarea><div class="controls" style="justify-content:flex-start;"><button class="btn btn-hw" id="hwGenBtn">Помочь разобраться</button><button class="btn btn-outline" id="hwClr">Очистить</button></div><div id="hwResultBox" style="margin-top:1.5rem;"></div></div>`;
        document.getElementById('hwSubject').onchange = (e) => { document.getElementById('hwSymbolsBar').innerHTML = buildSymbolBar('hwTaskInput', e.target.value); };
        document.getElementById('hwClr').onclick = () => { document.getElementById('hwTaskInput').value = ''; };
        document.getElementById('hwGenBtn').onclick = async () => {
            const sk = document.getElementById('hwSubject').value;
            const sObj = SUBJECTS_CONFIG[sk] || { title: 'Предмет', isMath: false };
            const gr = document.getElementById('hwGrade').value;
            const md = document.getElementById('hwMode').value;
            const txt = document.getElementById('hwTaskInput').value.trim();
            const box = document.getElementById('hwResultBox');
            const btn = document.getElementById('hwGenBtn');
            if (!txt) return alert('Впишите условие задания!');
            const rule = md === 'explain' ? 'НЕ ПИШИ готовый ответ на задачу ученика! Объясни правило, разбери ПОХОЖИЙ пример с другими числами и дай план.' : md === 'hint' ? 'НЕ решай задачу! Дай только наводящую подсказку для первого шага.' : 'Проверь ход решения ученика, укажи на ошибку без готового ответа.';
            await callAI(btn, 'Помочь разобраться', box, `Ты — школьный репетитор по предмету "${sObj.title}" (${gr}). ${rule} Пиши на русском.\n\nЗадание:\n${txt}`, sObj.isMath);
        };
    }
    function renderExamHelper(sel = 'russian') {
        const s = SUBJECTS_CONFIG[sel] || SUBJECTS_CONFIG.russian;
        const chips = (s.examTopics || s.types).map(t => `<button type="button" class="btn btn-outline topic-chip" data-input="examThemeInput" data-topic="${esc(t)}">${esc(t)}</button>`).join('');
        contentArea.innerHTML = `<div class="generator-box" style="text-align:left;"><h3>🎯 Подготовка к ОГЭ и ЕГЭ</h3><div class="exam-notice"><strong>Два режима:</strong> Получите задание без ответа (тренировка с проверкой ИИ) или сразу задание с эталонным разбором и критериями ФИПИ.</div><div class="controls" style="justify-content:flex-start;"><select id="examType"><option value="ОГЭ (9 класс)">📘 ОГЭ (9 класс)</option><option value="ЕГЭ (11 класс)" selected>📕 ЕГЭ (11 класс)</option></select><select id="examSubject">${getSubjOpts(sel)}</select><select id="examPart"><option value="1 часть">1 часть (краткий ответ)</option><option value="2 часть">2 часть (развёрнутый ответ)</option></select></div><div id="examTopicsBox" class="controls" style="justify-content:flex-start;">${chips}</div><div id="examSymbolsBar" style="display:flex;gap:0.35rem;flex-wrap:wrap;margin-bottom:0.7rem;">${buildSymbolBar('examThemeInput', sel)}</div><div class="controls" style="justify-content:flex-start;"><input type="text" id="examThemeInput" placeholder="Номер задания или тема..." style="flex:1;min-width:240px;"><button class="btn btn-exam" id="exTrain">✍️ Тренировка</button><button class="btn" id="exSolve">📖 Задание + разбор</button></div><div id="examResultBox" style="margin-top:1.5rem;"></div></div>`;
        document.getElementById('examSubject').onchange = (e) => {
            const ns = SUBJECTS_CONFIG[e.target.value] || SUBJECTS_CONFIG.russian;
            document.getElementById('examTopicsBox').innerHTML = (ns.examTopics || ns.types).map(t => `<button type="button" class="btn btn-outline topic-chip" data-input="examThemeInput" data-topic="${esc(t)}">${esc(t)}</button>`).join('');
            document.getElementById('examSymbolsBar').innerHTML = buildSymbolBar('examThemeInput', e.target.value);
        };
        document.getElementById('exTrain').onclick = () => runExam(true);
        document.getElementById('exSolve').onclick = () => runExam(false);
    }

    async function runExam(train) {
        const et = document.getElementById('examType').value;
        const sk = document.getElementById('examSubject').value;
        const sObj = SUBJECTS_CONFIG[sk] || { title: 'Предмет', isMath: false };
        const ep = document.getElementById('examPart').value;
        const th = document.getElementById('examThemeInput').value.trim();
        const box = document.getElementById('examResultBox');
        if (!th) return alert('Выберите или введите тему!');
        const p = train
            ? `Ты эксперт ${et} по предмету "${sObj.title}". Составь ОДНО задание ФИПИ (${ep}) по теме "${th}". Выведи ТОЛЬКО условие задания, БЕЗ ответа и решения! На русском.`
            : `Ты эксперт ${et} по предмету "${sObj.title}". Составь ОДНО задание ФИПИ (${ep}) по теме "${th}". Напиши условие, затем "РЕШЕНИЕ:" и подробный разбор с критериями оценивания. На русском.`;
        const raw = await callAI(null, '', box, p, sObj.isMath, true);
        if (!raw) return;
        lastGeneratedExamTask = raw;
        if (train) {
            box.innerHTML += `<div style="margin-top:1rem;padding:1rem;background:var(--bg-color);border-radius:12px;border:1px solid var(--border-solid);"><textarea id="uExAns" class="hw-textarea" style="min-height:80px;" placeholder="Ваш ответ или решение..."></textarea><button class="btn btn-exam" id="chkEx">✅ Проверить ответ</button><div id="exChkRes" style="margin-top:1rem;"></div></div>`;
            document.getElementById('chkEx').onclick = () => {
                const ans = document.getElementById('uExAns').value.trim();
                if (!ans) return alert('Введите ваш ответ!');
                callAI(document.getElementById('chkEx'), '✅ Проверить ответ', document.getElementById('exChkRes'), `Ты эксперт ${et} (${sObj.title}). Задание:\n${lastGeneratedExamTask}\n\nОтвет ученика:\n${ans}\n\nПроверь по критериям ФИПИ, укажи баллы и разбери ошибки. На русском.`, sObj.isMath);
            };
        }
    }

    async function generateAI(type) {
        const th = document.getElementById('themeInput').value.trim();
        const gr = document.getElementById('gradeLevel')?.value || '8 класс';
        const box = document.getElementById('resultBox');
        const btn = document.getElementById('genBtn');
        if (!th) return alert('Введите тему!');
        const sObj = SUBJECTS_CONFIG[type] || { title: type, isMath: false };
        let p = '';
        if (type === 'essay') p = `Учитель русского языка. Напиши сочинение-рассуждение (${gr}) на тему "${th}" (вступление, 2 аргумента, заключение).`;
        else if (type === 'dictation') p = `Учитель русского языка. Напиши только текст диктанта (${gr}) на тему "${th}".`;
        else if (type === 'exercise') p = `Учитель русского языка. Составь упражнение (${gr}) по теме "${th}". Сначала задание, затем "РЕШЕНИЕ:" и разбор правил.`;
        else p = `Учитель предмета "${sObj.title}". Составь задачу (${gr}, сложность: ${document.getElementById('taskComplexity').value}) по теме "${th}". Сначала условие, затем "РЕШЕНИЕ:" и пошаговый разбор.`;
        await callAI(btn, 'Сгенерировать', box, p, sObj.isMath && type !== 'essay' && type !== 'dictation');
    }

    async function callAI(btn, origText, box, prompt, isMath = false, keepRaw = false) {
        if (Date.now() - lastRequestTime < 5000) { alert('Подождите 5 секунд перед следующим запросом.'); return null; }
        lastRequestTime = Date.now();
        if (btn) { btn.disabled = true; btn.textContent = 'ИИ думает...'; }
        box.style.display = 'block';
        box.innerHTML = `<div class="task-display">Нейросеть готовит ответ...</div>`;
        try {
                        const res = await fetch(PROXY_URL + "?q=" + encodeURIComponent(prompt));

            const data = await res.json();
            if (!data.text) { box.innerHTML = `<div class="task-display" style="color:#ef4444;">Ответ сервера: ${esc(JSON.stringify(data))}</div>`; return null; }

            let txt = data.text.replace(/\*\*/g, '').replace(/(\d|\w|[а-яА-ЯёЁ\)\]])\s*\*\s*(\d|\w|[а-яА-ЯёЁ\(\[])/g, '$1 × $2').replace(/\^2/g, '²').replace(/\^3/g, '³');
            if (isMath) txt = txt.replace(/(^|[^\d\/])(\d{1,3})\s*\/\s*(\d{1,3})(?!\d|\/)/g, '$1\\(\\frac{$2}{$3}\\)');
            const html = txt.replace(/\n/g, '<br>').replace(/РЕШЕНИЕ:/gi, '<br><br><strong style="color:var(--primary);font-size:1.15rem;">Решение и разбор:</strong><br>');
            box.innerHTML = `<div class="task-display">${html}</div>`;
            if (window.renderMathInElement) window.renderMathInElement(box, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }], throwOnError: false });
            return keepRaw ? data.text : true;
        } catch (e) {
            box.innerHTML = `<div class="task-display" style="color:#ef4444;">Ошибка: ${esc(e.message)}</div>`;

            return null;
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = origText; }
        }
    }

    if (aiBtn) aiBtn.onclick = () => { if (aiInput.value.trim()) callAI(aiBtn, 'Спросить', document.getElementById('aiResponse'), `Помощник учителя и ученика. Ответь на русском: ${aiInput.value.trim()}`, true); };
    if (aiInput) aiInput.onkeydown = (e) => { if (e.key === 'Enter' && aiBtn) aiBtn.click(); };

    const doSearch = () => {
        const q = searchInput.value.toLowerCase().trim();
        if (!q) return;
        const map = [
            ['russian', ['сочин', 'диктант', 'глагол', 'причаст', 'русск']], ['literature', ['стих', 'роман', 'пушкин', 'литератур']],
            ['geometry', ['треугольник', 'окружност', 'площад', 'пифагор', 'геометри']], ['probability', ['вероятност', 'статистик', 'медиан']],
            ['physics', ['скорост', 'ток', 'сила', 'физик', 'ньютон']], ['chemistry', ['хими', 'моль', 'реакц', 'кислот']],
            ['biology', ['биолог', 'клетк', 'фотосинтез', 'генетик']], ['geography', ['географ', 'климат', 'координат']],
            ['history', ['истор', 'петр', 'войн', 'русь', 'ссср']], ['social', ['обществ', 'конституц', 'право', 'экономик']],
            ['english', ['english', 'английск', 'present', 'past']], ['algebra', ['уравнен', 'функци', 'процент', 'алгебр', 'дроб']],
            ['informatics', ['двоичн', 'логик', 'информатик', 'алгоритм', 'python']]
        ];
        const found = map.find(([, keys]) => keys.some(k => q.includes(k)));
        const subj = found ? found : 'russian';
        if (q.includes('огэ') || q.includes('егэ')) { openTool('exam', subj); document.getElementById('examThemeInput').value = searchInput.value.trim(); return; }
        if (q.includes('дз') || q.includes('домашн')) { openTool('homework', subj); document.getElementById('hwTaskInput').value = searchInput.value.trim(); return; }
        if (found) {
            document.querySelector(`[data-subject="${subj}"]`)?.click();
            const ti = document.getElementById('themeInput');
            if (ti) ti.value = searchInput.value.trim();
        } else {
            document.querySelector('[data-subject="ai"]')?.click();
            aiInput.value = searchInput.value.trim();
            if (aiBtn) aiBtn.click();
        }
    };
    if (searchBtn) searchBtn.onclick = doSearch;
    if (searchInput) searchInput.onkeydown = (e) => { if (e.key === 'Enter') doSearch(); };

    renderSubject('russian');
});
