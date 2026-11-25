document.addEventListener('DOMContentLoaded', () => {
    const contentArea = document.getElementById('contentArea');
    const aiArea = document.getElementById('aiArea');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const navBtns = document.querySelectorAll('.nav-btn');
    const themeToggle = document.getElementById('themeToggle');
    const aiBtn = document.getElementById('aiBtn');
    const aiInput = document.getElementById('aiInput');

    const PROXY_URL = "https://workers.dev";

    let currentSubject = 'russian';
    let lastRequestTime = 0;

    const SYMBOL_SETS = {
        algebra: ['a/b', '√', 'x²', 'x³', '×', '÷', '±', '≠', '≤', '≥', 'π'],
        geometry: ['∠', '°', '△', '⊥', '∥', 'π', '√', '²', '≅', '∼'],
        probability: ['P(A)', 'Cₙᵏ', 'Aₙᵏ', 'Pₙ', '!', '∪', '∩', '∅', '∑', 'x̄', 'σ'],
        physics: ['a/b', '×', '÷', '²', '³', 'Δ', 'ρ', 'Ω', 'μ', 'λ', '°'],
        chemistry: ['→', '⇄', '↑', '↓', '₂', '₃', '₄', '⁺', '⁻', '²⁺', '³⁺', '°'],
        informatics: ['∧', '∨', '¬', '→', '↔', '⊕', '∈', '∀', '∃', '₂', '₈', '₁₆'],
        geography: ['°', '′', '″', 'с.ш.', 'ю.ш.', 'в.д.', 'з.д.', '‰', '℃'],
        ai: ['a/b', '√', '²', '³', '×', '÷', '±', '∠', '°', '△', 'π', '→', '₂', '₃']
    };

    const SUBJECTS_CONFIG = {
        russian: {
            title: 'Русский язык', icon: '📖', minGrade: 1, defaultGrade: 8, isMath: false,
            types: ['Правописание Н и НН', 'Причастный и деепричастный оборот', 'Знаки препинания в СПП', 'Чередующиеся гласные в корне', 'Слитное и раздельное написание НЕ'],
            examTopics: ['Орфография (корни, приставки, Н/НН)', 'Пунктуация в сложном предложении', 'Синтаксический и грамматический анализ', 'Средства выразительности речи', 'Сочинение-рассуждение по тексту']
        },
        literature: {
            title: 'Литература', icon: '📚', minGrade: 5, defaultGrade: 9, isMath: false,
            description: 'ИИ составит вопрос для анализа произведения, тему сочинения или викторину с разбором.',
            types: ['Анализ лирического стихотворения', 'Образ «лишнего человека»', 'Тема маленького человека', 'Средства художественной выразительности', 'Конфликт отцов и детей'],
            examTopics: ['Анализ фрагмента эпического произведения', 'Сопоставление двух стихотворений', 'Средства художественной выразительности', 'Теория литературы: роды, жанры, размеры', 'Развёрнутое сочинение на литературную тему']
        },
        algebra: {
            title: 'Алгебра (Математика)', icon: '📐', minGrade: 1, defaultGrade: 8, isMath: true,
            types: ['Квадратные уравнения', 'Упростить выражение', 'Линейная и квадратичная функции', 'Задачи на проценты и сплавы', 'Арифметическая и геометрическая прогрессии'],
            examTopics: ['Уравнения и неравенства (1 часть)', 'Текстовые задачи на движение и работу', 'Графики функций и их свойства', 'Тригонометрия и логарифмы (ЕГЭ)', 'Экономическая задача и параметры (2 часть)']
        },
        geometry: {
            title: 'Геометрия', icon: '📏', minGrade: 7, defaultGrade: 8, isMath: true,
            types: ['Признаки равенства и подобия треугольников', 'Теорема Пифагора', 'Вписанные и центральные углы', 'Площади многоугольников', 'Векторы и метод координат'],
            examTopics: ['Треугольники и четырёхугольники', 'Окружность, касательные и хорды', 'Площади фигур на клетчатой решётке', 'Планиметрия повышенной сложности (2 часть)', 'Стереометрия: объёмы и сечения (ЕГЭ)']
        },
        probability: {
            title: 'Вероятность и статистика', icon: '🎲', minGrade: 7, defaultGrade: 8, isMath: true,
            types: ['Классическое определение вероятности', 'Среднее арифметическое, медиана и размах', 'Дерево вероятностей и графы', 'Комбинаторика: перестановки и сочетания', 'Случайные события и испытания Бернулли'],
            examTopics: ['Классическая вероятность (базовый уровень)', 'Теоремы о вероятностях сложных событий', 'Условная вероятность и дерево решений', 'Статистические характеристики набора данных', 'Комбинаторные задачи']
        },
        physics: {
            title: 'Физика', icon: '⚛️', minGrade: 7, defaultGrade: 8, isMath: true,
            types: ['Равномерное и равноускоренное движение', 'Законы Ньютона и силы в механике', 'Закон Ома для участка цепи', 'Работа, мощность и КПД', 'Количество теплоты и тепловой баланс'],
            examTopics: ['Кинематика и динамика', 'Законы сохранения в механике', 'Молекулярная физика и термодинамика', 'Электродинамика и законы постоянного тока', 'Качественные и расчётные задачи 2 части']
        },
        chemistry: {
            title: 'Химия', icon: '🧪', minGrade: 8, defaultGrade: 8, isMath: false,
            types: ['Окислительно-восстановительные реакции', 'Расчёты по химическим уравнениям', 'Классы неорганических соединений', 'Электролитическая диссоциация', 'Строение атома и периодический закон'],
            examTopics: ['Строение атома и периодический закон', 'Химическая связь и степени окисления', 'Реакции ионного обмена (РИО)', 'Окислительно-восстановительные реакции (ОВР)', 'Расчётные задачи на растворы и выход продукта']
        },
        biology: {
            title: 'Биология', icon: '🧬', minGrade: 5, defaultGrade: 8, isMath: false,
            types: ['Строение и функции клетки', 'Фотосинтез и обмен веществ', 'Анатомия человека: системы органов', 'Законы Менделя и основы генетики', 'Эволюция и экосистемы'],
            examTopics: ['Клетка как биологическая система', 'Человек и его здоровье (анатомия)', 'Генетические задачи (моно- и дигибридное скрещивание)', 'Эволюция живого мира и экология', 'Работа с биологическим экспериментом (2 часть)']
        },
        geography: {
            title: 'География', icon: '🌍', minGrade: 5, defaultGrade: 8, isMath: false,
            types: ['Определение географических координат', 'Климатические пояса и погода', 'Рельеф и тектоническое строение России', 'Природные зоны и ресурсы', 'Население и хозяйство регионов'],
            examTopics: ['Географические координаты и работа с картой', 'Атмосфера, климат и циклоны/антициклоны', 'Природа и ресурсы регионов России', 'Население, урбанизация и демография', 'Мировое хозяйство и природопользование']
        },
        history: {
            title: 'История', icon: '🏛️', minGrade: 5, defaultGrade: 8, isMath: false,
            description: 'ИИ сгенерирует задание на работу с датами, личностями, причинно-следственными связями или документами.',
            types: ['Древняя Русь и князья', 'Реформы Петра I', 'Отечественная война 1812 года', 'Великая Отечественная война (1941–1945)', 'Культура и быт России XIX века'],
            examTopics: ['Хронология и соотнесение событий и дат', 'Анализ исторического источника (текста)', 'Работа с исторической картой (схемой)', 'Причинно-следственные связи (2 часть)', 'Аргументация точки зрения с опорой на факты']
        },
        social: {
            title: 'Обществознание', icon: '⚖️', minGrade: 6, defaultGrade: 9, isMath: false,
            description: 'ИИ составит проблемную задачу, тест или разбор правовой/экономической ситуации.',
            types: ['Конституция РФ и права человека', 'Спрос, предложение и рыночная экономика', 'Правонарушения и юридическая ответственность', 'Социальные нормы и отклоняющееся поведение', 'Политические режимы и формы государства'],
            examTopics: ['Человек и общество, духовная культура', 'Экономика: рынок, налоги, инфляция', 'Социальная сфера и стратификация', 'Политика и конституционный строй РФ', 'Правовые задачи и составление сложного плана']
        },
        english: {
            title: 'Английский язык', icon: '🇬🇧', minGrade: 2, defaultGrade: 8, isMath: false,
            description: 'ИИ создаст тренировочные упражнения на грамматику, лексику или перевод с подробным разбором правил.',
            types: ['Present Simple vs Present Continuous', 'Past Simple vs Present Perfect', 'Conditionals (Условные предложения)', 'Passive Voice (Страдательный залог)', 'Modal Verbs (Модальные глаголы)'],
            examTopics: ['Грамматика: времена и залоги (задания 19–24)', 'Словообразование (задания 25–29)', 'Лексика и сочетаемость слов (задания 30–36)', 'Электронное письмо другу (Email)', 'Развёрнутое высказывание с опорой на план/график']
        },
        informatics: {
            title: 'Информатика', icon: '💻', minGrade: 5, defaultGrade: 8, isMath: true,
            types: ['Системы счисления и перевод чисел', 'Алгебра логики и таблицы истинности', 'Кодирование и объём информации', 'Алгоритмы и исполнители', 'Основы программирования на Python'],
            examTopics: ['Кодирование информации и передача данных', 'Алгебра логики и построение таблиц истинности', 'Анализ алгоритмов для исполнителей (Робот, Чертёжник)', 'Системы счисления и комбинаторика слов', 'Программирование и обработка массивов (Python)']
        }
    };
    function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function insertSym(inputId, sym) {
        const el = document.getElementById(inputId);
        if (!el) return;
        const toInsert = sym === 'a/b' ? ' / ' : sym;
        const start = typeof el.selectionStart === 'number' ? el.selectionStart : el.value.length;
        const end = typeof el.selectionEnd === 'number' ? el.selectionEnd : el.value.length;
        el.value = el.value.substring(0, start) + toInsert + el.value.substring(end);
        el.focus();
        const pos = start + toInsert.length;
        if (el.setSelectionRange) el.setSelectionRange(pos, pos);
    }

    function buildSymbolBar(inputId, subject) {
        const syms = SYMBOL_SETS[subject] || SYMBOL_SETS.ai;
        return syms.map(s => `<button type="button" class="btn btn-outline sym-btn" data-target="${inputId}" data-sym="${escapeHtml(s)}" style="padding: 0.35rem 0.65rem; font-size: 0.9rem; min-width: 36px;">${escapeHtml(s)}</button>`).join('');
    }

    document.addEventListener('click', (e) => {
        const symBtn = e.target.closest('.sym-btn');
        if (symBtn) {
            insertSym(symBtn.dataset.target, symBtn.dataset.sym);
            return;
        }
        const chipBtn = e.target.closest('.topic-chip');
        if (chipBtn) {
            document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('selected-chip'));
            chipBtn.classList.add('selected-chip');
            const targetInputId = chipBtn.dataset.input || 'themeInput';
            const input = document.getElementById(targetInputId);
            if (input) {
                input.value = chipBtn.dataset.topic;
                input.focus();
            }
        }
    });

    const aiSymBox = document.getElementById('aiSymbols');
    if (aiSymBox) aiSymBox.innerHTML = buildSymbolBar('aiInput', 'ai');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
            themeToggle.textContent = isDark ? '🌙' : '☀️';
        });
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSubject = btn.dataset.subject;
            
            if (currentSubject === 'ai') {
                contentArea.style.display = 'none';
                aiArea.style.display = 'block';
            } else if (currentSubject === 'homework') {
                contentArea.style.display = 'block';
                aiArea.style.display = 'none';
                renderHomeworkHelper();
            } else if (currentSubject === 'exam') {
                contentArea.style.display = 'block';
                aiArea.style.display = 'none';
                renderExamHelper();
            } else {
                contentArea.style.display = 'block';
                aiArea.style.display = 'none';
                renderSubject(currentSubject);
            }
        });
    });

    function getGradeOptions(minGrade = 1, maxGrade = 11, defaultGrade = 8) {
        let options = '';
        for (let i = minGrade; i <= maxGrade; i++) {
            options += `<option value="${i} класс" ${i === defaultGrade ? 'selected' : ''}>${i} класс</option>`;
        }
        return options;
    }

    function getAllSubjectOptions(selectedKey = 'algebra') {
        return Object.entries(SUBJECTS_CONFIG)
            .map(([key, val]) => `<option value="${key}" ${key === selectedKey ? 'selected' : ''}>${val.icon} ${val.title}</option>`)
            .join('');
    }

    function renderSubject(subject) {
        if (subject === 'russian') renderRussianMenu();
        else if (SUBJECTS_CONFIG[subject]) renderSubjectMenu(subject);
    }

    function renderRussianMenu() {
        contentArea.innerHTML = `
            <div class="generator-box">
                <h3>📖 Русский язык</h3>
                <p>Для учителей и учеников: выберите формат работы, популярную тему или впишите свою.</p>
                <div class="controls">
                    <button class="btn" id="rusEssayBtn">📝 Сочинение на любую тему</button>
                    <button class="btn btn-outline" id="rusDictBtn">✍️ Диктант на любую тему</button>
                    <button class="btn btn-outline" id="rusExBtn">🧩 Тренировочное задание</button>
                    <button class="btn btn-hw" id="rusHwBtn">🎒 Помощь с ДЗ</button>
                    <button class="btn btn-exam" id="rusExamBtn">🎯 ОГЭ / ЕГЭ</button>
                </div>
            </div>
            <div id="russianResult"></div>
        `;
        document.getElementById('rusEssayBtn').onclick = () => renderRussianGenerator('essay');
        document.getElementById('rusDictBtn').onclick = () => renderRussianGenerator('dictation');
        document.getElementById('rusExBtn').onclick = () => renderRussianGenerator('exercise');
        document.getElementById('rusHwBtn').onclick = () => openToolForSubject('homework', 'russian');
        document.getElementById('rusExamBtn').onclick = () => openToolForSubject('exam', 'russian');
        renderRussianGenerator('exercise');
    }

    function renderRussianGenerator(type) {
        const sub = SUBJECTS_CONFIG.russian;
        const topicsHtml = sub.types.map(t => `<button type="button" class="btn btn-outline topic-chip" data-input="themeInput" data-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('');
        const titles = { essay: '📝 Сочинение-рассуждение', dictation: '✍️ Текст для диктанта', exercise: '🧩 Тренировочное упражнение с разбором' };
        const placeholders = { essay: 'Например: Роль книги в жизни человека', dictation: 'Например: Осень в лесу', exercise: 'Например: Знаки препинания при причастном обороте' };

        document.getElementById('russianResult').innerHTML = `
            <div class="generator-box" style="border-style:solid; text-align:left;">
                <h3>${titles[type]}</h3>
                <p>Укажите класс, выберите тему из популярных или введите любую свою тему.</p>
                <div class="controls" style="justify-content: flex-start; margin-bottom: 1rem;">${topicsHtml}</div>
                <div class="controls" style="justify-content: flex-start; flex-wrap: wrap; gap: 0.6rem;">
                    <select id="gradeLevel">${getGradeOptions(1, 11, 8)}</select>
                    <input type="text" id="themeInput" placeholder="${placeholders[type]}">
                    <button class="btn" id="genBtn">Сгенерировать</button>
                </div>
                <div id="resultBox" style="margin-top: 1.5rem;"></div>
            </div>
        `;
        document.getElementById('genBtn').onclick = () => generateAIText(type);
    }

    function renderSubjectMenu(subject) {
        const sub = SUBJECTS_CONFIG[subject];
        const buttonsHtml = sub.types.map(t => `<button type="button" class="btn btn-outline topic-chip" data-input="themeInput" data-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>`).join('');
        const symBarHtml = SYMBOL_SETS[subject] ? `<div style="display: flex; justify-content: center; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.8rem;">${buildSymbolBar('themeInput', subject)}</div>` : '';
        const desc = sub.description || 'Выберите класс и тему. ИИ составит задание по школьной программе и распишет подробное решение.';

        contentArea.innerHTML = `
            <div class="generator-box">
                <h3>${sub.icon} ${sub.title}</h3>
                <p>${desc}</p>
                <div class="topics-label">Популярные темы:</div>
                <div class="controls" style="margin-bottom: 1rem;">${buttonsHtml}</div>
                ${symBarHtml}
                <div class="controls" style="justify-content: center; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.8rem;">
                    <select id="gradeLevel">${getGradeOptions(sub.minGrade, 11, sub.defaultGrade)}</select>
                    <input type="text" id="themeInput" placeholder="Введите любую свою тему...">
                    <select id="taskComplexity">
                        <option value="лёгкая">Лёгкая</option>
                        <option value="средняя" selected>Средняя</option>
                        <option value="сложная">Сложная</option>
                    </select>
                    <button class="btn" id="genBtn">Сгенерировать</button>
                    <button class="btn btn-hw" id="subHwBtn">🎒 Помощь с ДЗ</button>
                    <button class="btn btn-exam" id="subExamBtn">🎯 ОГЭ / ЕГЭ</button>
                </div>
                <div id="resultBox" style="margin-top: 1.5rem;"></div>
            </div>
        `;
        document.getElementById('genBtn').onclick = () => generateAIText(subject);
        document.getElementById('subHwBtn').onclick = () => openToolForSubject('homework', subject);
        document.getElementById('subExamBtn').onclick = () => openToolForSubject('exam', subject);
    }

    function openToolForSubject(tool, subjectKey) {
        navBtns.forEach(b => b.classList.remove('active'));
        const targetBtn = document.querySelector(`[data-subject="${tool}"]`);
        if (targetBtn) targetBtn.classList.add('active');
        currentSubject = tool;
        contentArea.style.display = 'block';
        aiArea.style.display = 'none';
        if (tool === 'homework') renderHomeworkHelper(subjectKey);
        if (tool === 'exam') renderExamHelper(subjectKey);
    }
    function renderHomeworkHelper(preselectedSubject = 'algebra') {
        contentArea.innerHTML = `
            <div class="generator-box" style="text-align: left;">
                <h3>🎒 Умный помощник с домашним заданием</h3>
                <p style="margin-bottom: 1rem;">Вставь условие задачи, правило или текст упражнения. Нейросеть поможет разобраться в теме, покажет похожий пример и даст подсказки, чтобы ты смог решить сам.</p>
                <div class="hw-notice">
                    <strong>Принцип честной учёбы:</strong> Мы не даём готовых ответов для списывания. Вместо этого ты получишь разбор правила, решение аналогичного примера и пошаговую подсказку для своего задания.
                </div>
                <div class="controls" style="justify-content: flex-start; margin-bottom: 0.8rem;">
                    <select id="hwSubject">${getAllSubjectOptions(preselectedSubject)}</select>
                    <select id="hwGrade">${getGradeOptions(1, 11, 8)}</select>
                    <select id="hwMode">
                        <option value="explain">🔍 Объяснить как решать + похожий пример</option>
                        <option value="hint">💡 Дать только подсказку для первого шага</option>
                        <option value="check">✅ Проверить моё решение и найти ошибку</option>
                    </select>
                </div>
                <div id="hwSymbolsBar" style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.7rem;">
                    ${buildSymbolBar('hwTaskInput', preselectedSubject)}
                </div>
                <textarea id="hwTaskInput" class="hw-textarea" placeholder="Впишите сюда условие домашнего задания (или условие + ваше решение, если выбрали проверку)..."></textarea>
                <div class="controls" style="justify-content: flex-start;">
                    <button class="btn btn-hw" id="hwGenBtn">Помочь разобраться</button>
                    <button class="btn btn-outline" id="hwClearBtn">Очистить</button>
                </div>
                <div id="hwResultBox" style="margin-top: 1.5rem;"></div>
            </div>
        `;
        document.getElementById('hwSubject').onchange = (e) => {
            document.getElementById('hwSymbolsBar').innerHTML = buildSymbolBar('hwTaskInput', e.target.value);
        };
        document.getElementById('hwGenBtn').onclick = generateHomeworkHelp;
        document.getElementById('hwClearBtn').onclick = () => { document.getElementById('hwTaskInput').value = ''; };
    }

    async function generateHomeworkHelp() {
        const subjKey = document.getElementById('hwSubject').value;
        const subObj = SUBJECTS_CONFIG[subjKey] || { title: 'Школьный предмет', isMath: false };
        const grade = document.getElementById('hwGrade').value;
        const mode = document.getElementById('hwMode').value;
        const taskText = document.getElementById('hwTaskInput').value.trim();
        const resultBox = document.getElementById('hwResultBox');
        const btn = document.getElementById('hwGenBtn');

        if (!taskText) { alert('Пожалуйста, впишите условие задания!'); return; }
        if (Date.now() - lastRequestTime < 5000) { alert('Подождите 5 секунд перед следующим запросом.'); return; }
        lastRequestTime = Date.now();

        btn.textContent = 'Репетитор думает...';
        btn.disabled = true;
        resultBox.innerHTML = `<div class="task-display">Анализирую задание по предмету «${subObj.title}» (${grade})...</div>`;

        let modeInstruction = mode === 'explain'
            ? `СТРОГОЕ ПРАВИЛО: НЕ ПИШИ готовый ответ на задание ученика! Объясни правило/формулу (${grade}), разбери ПОХОЖИЙ аналогичный пример с другими данными и дай план действий.`
            : mode === 'hint'
            ? `СТРОГОЕ ПРАВИЛО: НЕ решай задачу и НЕ пиши ответ! Дай только наводящую подсказку: с чего начать и какую формулу/правило применить.`
            : `Проверь ход решения ученика. Если есть ошибка — не выдавай готовый ответ сразу, а укажи, на каком шаге ошибка и что нужно перепроверить.`;

        const prompt = `Ты — опытный школьный репетитор по предмету "${subObj.title}" для ученика (${grade}). ${modeInstruction} Пиши на русском языке.\n\nЗадание ученика:\n${taskText}`;

        try {
            const res = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if (data.text) {
                const formatted = formatOutputText(data.text, subObj.isMath).replace(/\n/g, '<br>');
                resultBox.innerHTML = `<div class="task-display" id="hwOutput">${formatted}</div>`;
                renderKatexInElement(document.getElementById('hwOutput'));
            } else {
                resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка ИИ. Попробуйте еще раз.</div>`;
            }
        } catch (err) {
            resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка сети. Проверьте подключение.</div>`;
        } finally {
            btn.textContent = 'Помочь разобраться';
            btn.disabled = false;
        }
    }

    let lastGeneratedExamTask = '';

    function renderExamHelper(preselectedSubject = 'russian') {
        const sub = SUBJECTS_CONFIG[preselectedSubject] || SUBJECTS_CONFIG.russian;
        const examTopicsHtml = (sub.examTopics || sub.types)
            .map(t => `<button type="button" class="btn btn-outline topic-chip" data-input="examThemeInput" data-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>`)
            .join('');

        contentArea.innerHTML = `
            <div class="generator-box" style="text-align: left;">
                <h3>🎯 Подготовка к ОГЭ и ЕГЭ</h3>
                <p style="margin-bottom: 1rem;">Тренажёр экзаменационных заданий по стандартам ФИПИ. Выберите экзамен, предмет и линию заданий или впишите свою тему.</p>
                <div class="exam-notice">
                    <strong>Два режима работы:</strong> Можно сразу сгенерировать типовое задание с разбором и критериями оценивания или включить <strong>режим тренировки</strong> — решить задание самостоятельно и отправить свой ответ на проверку нейросети.
                </div>
                <div class="controls" style="justify-content: flex-start; margin-bottom: 0.8rem;">
                    <select id="examType">
                        <option value="ОГЭ (9 класс)">📘 ОГЭ (9 класс)</option>
                        <option value="ЕГЭ (11 класс)" selected>📕 ЕГЭ (11 класс)</option>
                    </select>
                    <select id="examSubject">${getAllSubjectOptions(preselectedSubject)}</select>
                    <select id="examPart">
                        <option value="1 часть (краткий ответ)">1 часть (базовый / краткий ответ)</option>
                        <option value="2 часть (развёрнутый ответ)">2 часть (повышенный / развёрнутый ответ)</option>
                    </select>
                </div>
                <div class="topics-label" style="text-align: left;">Популярные линии заданий:</div>
                <div id="examTopicsBox" class="controls" style="justify-content: flex-start; margin-bottom: 1rem;">${examTopicsHtml}</div>
                <div id="examSymbolsBar" style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.7rem;">
                    ${buildSymbolBar('examThemeInput', preselectedSubject)}
                </div>
                <div class="controls" style="justify-content: flex-start; margin-bottom: 0.5rem;">
                    <input type="text" id="examThemeInput" placeholder="Номер задания ФИПИ или своя тема (например: Задание 12)..." style="flex: 1; min-width: 260px;">
                    <button class="btn btn-exam" id="examTrainBtn">✍️ Получить задание (Тренировка)</button>
                    <button class="btn" id="examSolveBtn">📖 Задание + разбор решения</button>
                </div>
                <div id="examResultBox" style="margin-top: 1.5rem;"></div>
            </div>
        `;

        document.getElementById('examSubject').onchange = (e) => {
            const newSubKey = e.target.value;
            const newSub = SUBJECTS_CONFIG[newSubKey] || SUBJECTS_CONFIG.russian;
            document.getElementById('examTopicsBox').innerHTML = (newSub.examTopics || newSub.types)
                .map(t => `<button type="button" class="btn btn-outline topic-chip" data-input="examThemeInput" data-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>`)
                .join('');
            document.getElementById('examSymbolsBar').innerHTML = buildSymbolBar('examThemeInput', newSubKey);
        };

        document.getElementById('examTrainBtn').onclick = () => generateExamTask(true);
        document.getElementById('examSolveBtn').onclick = () => generateExamTask(false);
    }
    async function generateExamTask(isTrainingMode) {
        const examType = document.getElementById('examType').value;
        const subjKey = document.getElementById('examSubject').value;
        const subObj = SUBJECTS_CONFIG[subjKey] || { title: 'Предмет', isMath: false };
        const examPart = document.getElementById('examPart').value;
        const theme = document.getElementById('examThemeInput').value.trim();
        const resultBox = document.getElementById('examResultBox');
        const trainBtn = document.getElementById('examTrainBtn');
        const solveBtn = document.getElementById('examSolveBtn');

        if (!theme) { alert('Выберите линию заданий или впишите тему!'); return; }
        if (Date.now() - lastRequestTime < 5000) { alert('Подождите 5 секунд перед следующим запросом.'); return; }
        lastRequestTime = Date.now();

        trainBtn.disabled = true;
        solveBtn.disabled = true;
        resultBox.innerHTML = `<div class="task-display">Составляю вариант ${examType} по предмету «${subObj.title}» (${escapeHtml(theme)})...</div>`;

        const prompt = isTrainingMode
            ? `Ты — эксперт предметной комиссии ${examType} по предмету "${subObj.title}". Составь ОДНО реальное экзаменационное задание в формате ФИПИ (${examPart}) по теме "${theme}". СТРОГО: выведи ТОЛЬКО формулировку самого задания, без ответа и без решения! Пиши на русском языке.`
            : `Ты — эксперт предметной комиссии ${examType} по предмету "${subObj.title}". Составь ОДНО реальное экзаменационное задание в формате ФИПИ (${examPart}) по теме "${theme}". Сначала напиши условие задания, затем напиши "РАЗБОР И КРИТЕРИИ:" и приведи подробное эталонное решение, правильный ответ и критерии выставления баллов ФИПИ. Пиши на русском языке.`;

        try {
            const res = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();

            if (data.text) {
                lastGeneratedExamTask = data.text;
                let formatted = formatOutputText(data.text, subObj.isMath).replace(/\n/g, '<br>');
                if (!isTrainingMode) {
                    formatted = formatted.replace(/РАЗБОР И КРИТЕРИИ:/gi, '<br><br><strong style="color:var(--accent-exam); font-size:1.15rem;">Разбор и критерии оценивания ФИПИ:</strong><br>');
                }

                let checkBlockHtml = isTrainingMode
                    ? `<div style="margin-top: 1.2rem; padding: 1.2rem; background: var(--bg-color); border-radius: 12px; border: 1px solid var(--border-solid);">
                            <label style="display:block; font-weight:600; margin-bottom:0.5rem;">Ваш ответ или развёрнутое решение:</label>
                            <textarea id="userExamAnswer" class="hw-textarea" style="min-height: 80px;" placeholder="Введите ваш ответ (или ход решения для 2 части)..."></textarea>
                            <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
                                <button class="btn btn-exam" id="checkExamAnswerBtn">✅ Проверить мой ответ</button>
                                <button class="btn btn-outline" id="nextExamTaskBtn">🔄 Другой вариант</button>
                            </div>
                            <div id="examCheckResult" style="margin-top: 1rem;"></div>
                       </div>`
                    : `<div style="display: flex; gap: 0.8rem; margin-top: 1rem; flex-wrap: wrap;">
                            <button class="btn btn-outline" id="nextExamSolveBtn">🔄 Другой вариант</button>
                            <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector('#examOutput').innerText); this.textContent='Скопировано!'">📋 Скопировать</button>
                       </div>`;

                resultBox.innerHTML = `<div class="task-display" id="examOutput">${formatted}</div>${checkBlockHtml}`;
                renderKatexInElement(document.getElementById('examOutput'));

                if (isTrainingMode) {
                    document.getElementById('checkExamAnswerBtn').onclick = () => checkUserExamAnswer(examType, subObj);
                    document.getElementById('nextExamTaskBtn').onclick = () => generateExamTask(true);
                } else {
                    document.getElementById('nextExamSolveBtn').onclick = () => generateExamTask(false);
                }
            } else {
                resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка ИИ. Попробуйте еще раз.</div>`;
            }
        } catch (err) {
            resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка сети. Проверьте подключение.</div>`;
        } finally {
            trainBtn.disabled = false;
            solveBtn.disabled = false;
        }
    }
    async function checkUserExamAnswer(examType, subObj) {
        const userAns = document.getElementById('userExamAnswer').value.trim();
        const checkBox = document.getElementById('examCheckResult');
        const btn = document.getElementById('checkExamAnswerBtn');

        if (!userAns) { alert('Введите ваш ответ для проверки!'); return; }
        if (Date.now() - lastRequestTime < 5000) { alert('Подождите 5 секунд перед следующим запросом.'); return; }
        lastRequestTime = Date.now();

        btn.disabled = true;
        btn.textContent = 'Эксперт проверяет...';
        checkBox.innerHTML = `<div class="task-display">Сверяю ответ с критериями ${examType}...</div>`;

        const prompt = `Ты — эксперт предметной комиссии ${examType} по предмету "${subObj.title}".\nЗадание было таким:\n${lastGeneratedExamTask}\n\nОтвет ученика:\n${userAns}\n\nПроверь ответ ученика строго по критериям ФИПИ. Укажи: 1) Верно или неверно (и сколько первичных баллов ставится); 2) Если есть ошибка — подробно разбери её; 3) Приведи эталонное решение. Пиши на русском языке.`;

        try {
            const res = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if (data.text) {
                const formatted = formatOutputText(data.text, subObj.isMath).replace(/\n/g, '<br>');
                checkBox.innerHTML = `<div class="task-display" id="examCheckOut">${formatted}</div>`;
                renderKatexInElement(document.getElementById('examCheckOut'));
            }
        } catch (err) {
            checkBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка сети при проверке.</div>`;
        } finally {
            btn.disabled = false;
            btn.textContent = '✅ Проверить мой ответ';
        }
    }

    function formatOutputText(text, isMathSubject = false) {
        let cleaned = text
            .replace(/\*\*/g, '')
            .replace(/(\d|\w|[а-яА-ЯёЁ\)\]])\s*\*\s*(\d|\w|[а-яА-ЯёЁ\(\[])/g, '$1 × $2')
            .replace(/\^2/g, '²')
            .replace(/\^3/g, '³');

        if (isMathSubject) {
            cleaned = cleaned.replace(/(^|[^\d\/])(\d{1,3})\s*\/\s*(\d{1,3})(?!\d|\/)/g, (match, prefix, num, den) => {
                return `${prefix}\\(\\frac{${num}}{${den}}\\)`;
            });
        }
        return cleaned;
    }

    function renderKatexInElement(el) {
        if (window.renderMathInElement && el) {
            window.renderMathInElement(el, {
                delimiters: [{ left: '$$', right: '$$', display: true }, { left: '\\(', right: '\\)', display: false }],
                throwOnError: false
            });
        }
    }

    async function generateAIText(type) {
        const themeInput = document.getElementById('themeInput').value.trim();
        const gradeEl = document.getElementById('gradeLevel');
        const grade = gradeEl ? gradeEl.value : '8 класс';
        const resultBox = document.getElementById('resultBox');
        const btn = document.getElementById('genBtn');

        if (!themeInput) { alert('Пожалуйста, выберите или введите тему!'); return; }
        if (Date.now() - lastRequestTime < 5000) { alert('Подождите 5 секунд перед следующим запросом.'); return; }
        lastRequestTime = Date.now();

        btn.textContent = 'ИИ думает...';
        btn.disabled = true;
        resultBox.innerHTML = `<div class="task-display">Генерация (${grade}) по теме: "${escapeHtml(themeInput)}"...</div>`;

        const subObj = SUBJECTS_CONFIG[type] || { title: type, isMath: false };
        const isTextOnlyMode = (type === 'essay' || type === 'dictation');
        let prompt = "";

        if (type === 'essay') {
            prompt = `Ты опытный учитель русского языка. Напиши школьное сочинение-рассуждение для ученика (${grade}) на тему: "${themeInput}". Структура: вступление, 2 аргумента, заключение. Пиши на русском языке.`;
        } else if (type === 'dictation') {
            prompt = `Ты опытный учитель русского языка. Напиши связный текст для диктанта для ученика (${grade}) на тему: "${themeInput}". Выведи только сам текст диктанта. Пиши на русском языке.`;
        } else if (type === 'exercise') {
            prompt = `Ты опытный учитель русского языка. Составь тренировочное упражнение для ученика (${grade}) по теме "${themeInput}". Сначала напиши задание, затем напиши "РЕШЕНИЕ:" и приведи правильный вариант с подробным объяснением правил. Пиши на русском языке.`;
        } else {
            const comp = document.getElementById('taskComplexity').value;
            prompt = `Ты опытный учитель по предмету "${subObj.title}". Придумай учебное задание или задачу для ученика (${grade}) по теме "${themeInput}". Сложность: ${comp}. Сначала напиши условие, затем напиши "РЕШЕНИЕ:" и распиши подробное пошаговое решение с объяснениями для ${grade}. Пиши на русском языке.`;
        }

        try {
            const res = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            if (data.text) {
                let cleanText = !isTextOnlyMode ? formatOutputText(data.text, subObj.isMath) : data.text;
                let displayHtml = cleanText.replace(/\n/g, '<br>');
                if (!isTextOnlyMode) {
                    displayHtml = displayHtml.replace(/РЕШЕНИЕ:/gi, '<br><br><strong style="color:var(--primary); font-size:1.15rem;">Решение и разбор:</strong><br>');
                }
                resultBox.innerHTML = `
                    <div class="task-display" id="taskOutput">${displayHtml}</div>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
                        <button class="btn btn-outline" id="regenBtn">🔄 Другой вариант</button>
                        <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector('#taskOutput').innerText); this.textContent='Скопировано!'">📋 Скопировать</button>
                    </div>
                `;
                document.getElementById('regenBtn').onclick = () => generateAIText(type);
                renderKatexInElement(document.getElementById('taskOutput'));
            } else {
                resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка ИИ. Попробуйте еще раз.</div>`;
            }
        } catch (err) {
            resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка сети. Проверьте подключение.</div>`;
        } finally {
            btn.textContent = 'Сгенерировать';
            btn.disabled = false;
        }
    }
    async function askAI() {
        const input = aiInput.value.trim();
        if (!input) return;
        if (Date.now() - lastRequestTime < 5000) { alert('Подождите 5 секунд перед следующим вопросом.'); return; }
        lastRequestTime = Date.now();

        const responseBox = document.getElementById('aiResponse');
        aiBtn.textContent = 'Думает...';
        aiBtn.disabled = true;
        responseBox.style.display = 'block';
        responseBox.textContent = 'Нейросеть обрабатывает запрос...';

        try {
            const fullPrompt = `Ты — умный помощник школьного учителя и ученика. Отвечай грамотно, понятно и по делу на русском языке. Вопрос: ${input}`;
            const res = await fetch(PROXY_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: fullPrompt })
            });
            const data = await res.json();
            if (data.text) {
                responseBox.innerHTML = formatOutputText(data.text, true).replace(/\n/g, '<br>');
                renderKatexInElement(responseBox);
            } else {
                responseBox.textContent = 'Ошибка: ИИ не смог ответить.';
            }
        } catch (err) {
            responseBox.textContent = 'Ошибка сети. Проверьте подключение.';
        } finally {
            aiBtn.textContent = 'Спросить';
            aiBtn.disabled = false;
        }
    }

    if (aiBtn) aiBtn.addEventListener('click', askAI);
    if (aiInput) aiInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') askAI(); });

    function handleGlobalSearch() {
        const q = searchInput.value.toLowerCase().trim();
        if (!q) return;

        const keywordMap = [
            { subject: 'russian', keys: ['сочин', 'диктант', 'глагол', 'причаст', 'орфограф', 'пунктуац', 'русск'] },
            { subject: 'literature', keys: ['стих', 'поэм', 'роман', 'пушкин', 'толстой', 'достоевск', 'литератур', 'герой'] },
            { subject: 'geometry', keys: ['треугольник', 'окружност', 'площад', 'пифагор', 'вектор', 'геометри', 'угол'] },
            { subject: 'probability', keys: ['вероятност', 'статистик', 'медиан', 'комбинатор', 'граф', 'случайн'] },
            { subject: 'physics', keys: ['скорост', 'ток', 'сила', 'физик', 'ньютон', 'ом', 'мощност', 'теплот'] },
            { subject: 'chemistry', keys: ['хими', 'моль', 'реакц', 'кислот', 'оксид', 'валентн', 'атом'] },
            { subject: 'biology', keys: ['биолог', 'клетк', 'фотосинтез', 'генетик', 'мендел', 'анатом', 'эволюц'] },
            { subject: 'geography', keys: ['географ', 'климат', 'координат', 'рельеф', 'материк', 'океан', 'погод'] },
            { subject: 'history', keys: ['истор', 'петр', 'войн', 'русь', 'княз', 'реформ', 'ссср', 'век'] },
            { subject: 'social', keys: ['обществ', 'конституц', 'право', 'экономик', 'спрос', 'налог', 'государств'] },
            { subject: 'english', keys: ['english', 'английск', 'present', 'past', 'future', 'passive', 'verb', 'tense'] },
            { subject: 'algebra', keys: ['уравнен', 'функци', 'процент', 'алгебр', 'дроб', 'прогресс', 'корн'] },
            { subject: 'informatics', keys: ['двоичн', 'систем', 'логик', 'информатик', 'алгоритм', 'python', 'код'] }
        ];

        const matched = keywordMap.find(item => item.keys.some(k => q.includes(k)));
        const detectedSubject = matched ? matched.subject : 'russian';

        if (q.includes('огэ') || q.includes('егэ') || q.includes('экзамен') || q.includes('фипи')) {
            openToolForSubject('exam', detectedSubject);
            if (q.includes('огэ')) document.getElementById('examType').value = 'ОГЭ (9 класс)';
            document.getElementById('examThemeInput').value = searchInput.value.trim();
            return;
        }

        if (q.includes('дз') || q.includes('домашн') || q.includes('помоги')) {
            openToolForSubject('homework', detectedSubject);
            document.getElementById('hwTaskInput').value = searchInput.value.trim();
            return;
        }

        if (matched) {
            const targetBtn = document.querySelector(`[data-subject="${matched.subject}"]`);
            if (targetBtn) targetBtn.click();
            if (matched.subject === 'russian') {
                if (q.includes('сочин')) renderRussianGenerator('essay');
                else if (q.includes('диктант')) renderRussianGenerator('dictation');
                else renderRussianGenerator('exercise');
            }
            const themeEl = document.getElementById('themeInput');
            if (themeEl) themeEl.value = searchInput.value.trim();
        } else {
            document.querySelector('[data-subject="ai"]').click();
            aiInput.value = searchInput.value.trim();
            askAI();
        }
    }

    if (searchBtn) searchBtn.addEventListener('click', handleGlobalSearch);
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleGlobalSearch(); });

    renderSubject('russian');
});
