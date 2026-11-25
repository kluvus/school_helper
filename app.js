const contentArea = document.getElementById('contentArea');
const aiArea = document.getElementById('aiArea');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const navBtns = document.querySelectorAll('.nav-btn');
const themeToggle = document.getElementById('themeToggle');

const PROXY_URL = "https://mbou-school-1-helper.vaceslavkorotkih76.workers.dev/";

let currentSubject = 'russian';
let lastRequestTime = 0;

const MATH_SUBJECTS = ['algebra', 'geometry', 'probability', 'physics', 'informatics'];

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
        title: 'Русский язык',
        icon: '📖',
        minGrade: 1,
        defaultGrade: 8,
        isRussian: true,
        types: ['Правописание Н и НН', 'Причастный и деепричастный оборот', 'Знаки препинания в СПП', 'Чередующиеся гласные в корне', 'Слитное и раздельное написание НЕ']
    },
    literature: {
        title: 'Литература',
        icon: '📚',
        minGrade: 5,
        defaultGrade: 9,
        description: 'ИИ составит вопрос для анализа произведения, тему сочинения или литературную викторину с разбором по ФГОС.',
        types: ['Анализ лирического стихотворения', 'Образ «лишнего человека»', 'Тема маленького человека', 'Средства художественной выразительности', 'Конфликт отцов и детей']
    },
    algebra: {
        title: 'Алгебра (Математика)',
        icon: '📐',
        minGrade: 1,
        defaultGrade: 8,
        types: ['Квадратные уравнения', 'Упростить выражение', 'Линейная и квадратичная функции', 'Задачи на проценты и сплавы', 'Арифметическая и геометрическая прогрессии']
    },
    geometry: {
        title: 'Геометрия',
        icon: '📏',
        minGrade: 7,
        defaultGrade: 8,
        types: ['Признаки равенства и подобия треугольников', 'Теорема Пифагора', 'Вписанные и центральные углы', 'Площади многоугольников', 'Векторы и метод координат']
    },
    probability: {
        title: 'Вероятность и статистика',
        icon: '🎲',
        minGrade: 7,
        defaultGrade: 8,
        types: ['Классическое определение вероятности', 'Среднее арифметическое, медиана и размах', 'Дерево вероятностей и графы', 'Комбинаторика: перестановки и сочетания', 'Случайные события и испытания Бернулли']
    },
    physics: {
        title: 'Физика',
        icon: '⚛️',
        minGrade: 7,
        defaultGrade: 8,
        types: ['Равномерное и равноускоренное движение', 'Законы Ньютона и силы в механике', 'Закон Ома для участка цепи', 'Работа, мощность и КПД', 'Количество теплоты и тепловой баланс']
    },
    chemistry: {
        title: 'Химия',
        icon: '🧪',
        minGrade: 8,
        defaultGrade: 8,
        types: ['Окислительно-восстановительные реакции', 'Расчёты по химическим уравнениям (моль, масса)', 'Классы неорганических соединений', 'Электролитическая диссоциация и ионные уравнения', 'Строение атома и периодический закон']
    },
    biology: {
        title: 'Биология',
        icon: '🧬',
        minGrade: 5,
        defaultGrade: 8,
        types: ['Строение и функции клетки', 'Фотосинтез и обмен веществ', 'Анатомия человека: кровеносная и нервная системы', 'Законы Менделя и основы генетики', 'Эволюция и экосистемы']
    },
    geography: {
        title: 'География',
        icon: '🌍',
        minGrade: 5,
        defaultGrade: 8,
        types: ['Определение географических координат', 'Климатические пояса и погода', 'Рельеф и тектоническое строение России', 'Природные зоны и ресурсы', 'Население и хозяйство регионов']
    },
    history: {
        title: 'История',
        icon: '🏛️',
        minGrade: 5,
        defaultGrade: 8,
        description: 'ИИ сгенерирует задание на работу с датами, историческими личностями, причинно-следственными связями или документами.',
        types: ['Древняя Русь и князья', 'Реформы Петра I', 'Отечественная война 1812 года', 'Великая Отечественная война (1941–1945)', 'Культура и быт России XIX века']
    },
    social: {
        title: 'Обществознание',
        icon: '⚖️',
        minGrade: 6,
        defaultGrade: 9,
        description: 'ИИ составит проблемную задачу, тест или разбор правовой/экономической ситуации по программе ФГОС.',
        types: ['Конституция РФ и права человека', 'Спрос, предложение и рыночная экономика', 'Правонарушения и юридическая ответственность', 'Социальные нормы и отклоняющееся поведение', 'Политические режимы и формы государства']
    },
    english: {
        title: 'Английский язык',
        icon: '🇬🇧',
        minGrade: 2,
        defaultGrade: 8,
        description: 'ИИ создаст тренировочные упражнения на грамматику, лексику или перевод с подробным разбором правил.',
        types: ['Present Simple vs Present Continuous', 'Past Simple vs Present Perfect', 'Conditionals (Условные предложения)', 'Passive Voice (Страдательный залог)', 'Modal Verbs (Модальные глаголы)']
    },
    informatics: {
        title: 'Информатика',
        icon: '💻',
        minGrade: 5,
        defaultGrade: 8,
        types: ['Системы счисления и перевод чисел', 'Алгебра логики и таблицы истинности', 'Кодирование и объём информации', 'Алгоритмы и исполнители', 'Основы программирования на Python']
    }
};

function escapeHtmlAttr(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/'/g, '&#39;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
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
    if (el.setSelectionRange) {
        el.setSelectionRange(pos, pos);
    }
}

function buildSymbolBar(inputId, subject) {
    const syms = SYMBOL_SETS[subject] || SYMBOL_SETS.ai;
    return syms.map(s => `<button type="button" class="btn btn-outline" style="padding: 0.35rem 0.65rem; font-size: 0.9rem; min-width: 36px;" onclick="insertSym('${inputId}', '${escapeHtmlAttr(s)}')">${s}</button>`).join('');
}

const aiSymBox = document.getElementById('aiSymbols');
if (aiSymBox) {
    aiSymBox.innerHTML = buildSymbolBar('aiInput', 'ai');
}

themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.textContent = isDark ? '🌙' : '☀️';
});

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

function selectTopicChip(btn) {
    document.querySelectorAll('.topic-chip').forEach(c => c.classList.remove('selected-chip'));
    btn.classList.add('selected-chip');
    const topicText = btn.dataset.topic || btn.textContent;
    const input = document.getElementById('themeInput');
    if (input) {
        input.value = topicText;
        input.focus();
    }
}

function buildTopicChipsHtml(topics) {
    return topics.map(t => `<button type="button" class="btn btn-outline topic-chip" data-topic="${escapeHtmlAttr(t)}" onclick="selectTopicChip(this)">${t}</button>`).join('');
}

function renderSubject(subject) {
    if (subject === 'russian') {
        renderRussianMenu();
    } else if (SUBJECTS_CONFIG[subject]) {
        renderSubjectMenu(subject);
    }
}

function renderRussianMenu() {
    contentArea.innerHTML = `
        <div class="generator-box">
            <h3>📖 Русский язык</h3>
            <p>Для учителей и учеников: выберите формат работы, популярную тему или впишите свою.</p>
            <div class="controls">
                <button class="btn" onclick="renderRussianGenerator('essay')">📝 Сочинение на любую тему</button>
                <button class="btn btn-outline" onclick="renderRussianGenerator('dictation')">✍️ Диктант на любую тему</button>
                <button class="btn btn-outline" onclick="renderRussianGenerator('exercise')">🧩 Тренировочное задание</button>
                <button class="btn btn-hw" onclick="openHomeworkForSubject('russian')">🎒 Разобрать ДЗ (не ГДЗ)</button>
            </div>
        </div>
        <div id="russianResult"></div>
    `;
    renderRussianGenerator('exercise');
}

function renderRussianGenerator(type) {
    const sub = SUBJECTS_CONFIG.russian;
    const topicsHtml = buildTopicChipsHtml(sub.types);
    
    const titles = {
        essay: '📝 Сочинение-рассуждение',
        dictation: '✍️ Текст для диктанта',
        exercise: '🧩 Тренировочное упражнение с разбором'
    };
    const placeholders = {
        essay: 'Например: Роль книги в жизни человека',
        dictation: 'Например: Осень в лесу или Правописание Н и НН',
        exercise: 'Например: Знаки препинания при причастном обороте'
    };

    document.getElementById('russianResult').innerHTML = `
        <div class="generator-box" style="border-style:solid; text-align:left;">
            <h3>${titles[type]}</h3>
            <p>Укажите класс, выберите тему из популярных или введите любую свою тему по программе ФГОС.</p>
            <div class="topics-label">Популярные темы:</div>
            <div class="controls" style="justify-content: flex-start; margin-bottom: 1rem;">${topicsHtml}</div>
            <div class="controls" style="justify-content: flex-start; flex-wrap: wrap; gap: 0.6rem;">
                <select id="gradeLevel">
                    ${getGradeOptions(1, 11, 8)}
                </select>
                <input type="text" id="themeInput" placeholder="${placeholders[type]}">
                <button class="btn" id="genBtn" onclick="generateAIText('${type}')">Сгенерировать</button>
            </div>
            <div id="resultBox" style="margin-top: 1.5rem;"></div>
        </div>
    `;
}

function renderSubjectMenu(subject) {
    const sub = SUBJECTS_CONFIG[subject];
    const buttonsHtml = buildTopicChipsHtml(sub.types);
    const hasSymbols = Boolean(SYMBOL_SETS[subject]);
    const symBarHtml = hasSymbols ? `<div style="display: flex; justify-content: center; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.8rem;">${buildSymbolBar('themeInput', subject)}</div>` : '';
    const desc = sub.description || 'Выберите класс и тему. ИИ составит задание по школьной программе и распишет подробное решение.';

    contentArea.innerHTML = `
        <div class="generator-box">
            <h3>${sub.icon} ${sub.title}</h3>
            <p>${desc}</p>
            <div class="topics-label">Популярные темы:</div>
            <div class="controls" style="margin-bottom: 1rem;">${buttonsHtml}</div>
            ${symBarHtml}
            <div class="controls" style="justify-content: center; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.8rem;">
                <select id="gradeLevel">
                    ${getGradeOptions(sub.minGrade, 11, sub.defaultGrade)}
                </select>
                <input type="text" id="themeInput" placeholder="Введите любую свою тему...">
                <select id="taskComplexity">
                    <option value="лёгкая">Лёгкая</option>
                    <option value="средняя" selected>Средняя</option>
                    <option value="сложная">Сложная</option>
                </select>
                <button class="btn" id="genBtn" onclick="generateAIText('${subject}')">Сгенерировать</button>
                <button class="btn btn-hw" onclick="openHomeworkForSubject('${subject}')">🎒 Помощь с ДЗ</button>
            </div>
            <div id="resultBox" style="margin-top: 1.5rem;"></div>
        </div>
    `;
}

function openHomeworkForSubject(subjectKey) {
    navBtns.forEach(b => b.classList.remove('active'));
    const hwBtn = document.querySelector('[data-subject="homework"]');
    if (hwBtn) hwBtn.classList.add('active');
    currentSubject = 'homework';
    contentArea.style.display = 'block';
    aiArea.style.display = 'none';
    renderHomeworkHelper(subjectKey);
}

function renderHomeworkHelper(preselectedSubject = 'algebra') {
    contentArea.innerHTML = `
        <div class="generator-box" style="text-align: left;">
            <h3>🎒 Умный помощник с домашним заданием (не ГДЗ)</h3>
            <p style="margin-bottom: 1rem;">Вставь условие задачи, правило или текст упражнения. Нейросеть поможет разобраться в теме, покажет похожий пример и даст пошаговые подсказки, чтобы ты смог решить сам.</p>
            
            <div class="hw-notice">
                <strong>💡 Принцип честной учёбы:</strong> Мы не даём готовых ответов для списывания. Вместо этого ты получишь:
                1) краткую теорию и формулы/правила по твоему вопросу;
                2) разбор <strong>аналогичного</strong> примера;
                3) план решения и подсказку для первого шага (или проверку твоего черновика).
            </div>

            <div class="controls" style="justify-content: flex-start; margin-bottom: 0.8rem;">
                <select id="hwSubject" onchange="updateHwSymbols()">
                    ${getAllSubjectOptions(preselectedSubject)}
                </select>
                <select id="hwGrade">
                    ${getGradeOptions(1, 11, 8)}
                </select>
                <select id="hwMode">
                    <option value="explain">🔍 Объяснить как решать + похожий пример</option>
                    <option value="hint">💡 Дать только подсказку для первого шага</option>
                    <option value="check">✅ Проверить моё решение и найти ошибку</option>
                </select>
            </div>

            <div id="hwSymbolsBar" style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 0.7rem;">
                ${buildSymbolBar('hwTaskInput', preselectedSubject)}
            </div>

            <textarea id="hwTaskInput" class="hw-textarea" placeholder="Вставь сюда текст задания из учебника или напиши свой ход решения, если хочешь его проверить..."></textarea>

            <div class="controls" style="justify-content: flex-start;">
                <button class="btn btn-hw" id="hwGenBtn" onclick="generateHomeworkHelp()">Помочь разобраться</button>
                <button class="btn btn-outline" onclick="document.getElementById('hwTaskInput').value=''">Очистить</button>
            </div>

            <div id="hwResultBox" style="margin-top: 1.5rem;"></div>
        </div>
    `;
}

function updateHwSymbols() {
    const subj = document.getElementById('hwSubject').value;
    const bar = document.getElementById('hwSymbolsBar');
    if (bar) {
        bar.innerHTML = buildSymbolBar('hwTaskInput', subj);
    }
}

async function generateHomeworkHelp() {
    const subjKey = document.getElementById('hwSubject').value;
    const subjTitle = SUBJECTS_CONFIG[subjKey] ? SUBJECTS_CONFIG[subjKey].title : 'Школьный предмет';
    const grade = document.getElementById('hwGrade').value;
    const mode = document.getElementById('hwMode').value;
    const taskText = document.getElementById('hwTaskInput').value.trim();
    const resultBox = document.getElementById('hwResultBox');
    const btn = document.getElementById('hwGenBtn');

    if (!taskText) {
        alert('Пожалуйста, впишите условие задания или ваш вопрос!');
        return;
    }

    const now = Date.now();
    if (now - lastRequestTime < 5000) {
        alert('Подождите 5 секунд перед следующим запросом.');
        return;
    }
    lastRequestTime = now;

    btn.textContent = 'Репетитор думает...';
    btn.disabled = true;
    resultBox.innerHTML = `<div class="task-display">Анализирую задание по предмету «${subjTitle}» (${grade})...</div>`;

    let modeInstruction = '';
    if (mode === 'explain') {
        modeInstruction = `СТРОГОЕ ПРАВИЛО: НЕ ПИШИ готовый ответ и не решай до конца именно это задание ученика! Вместо этого:
1. Объясни простым языком теорию, правила или формулы, которые нужны для этого задания (строго для ${grade}).
2. Придумай и полностью разбери ПОХОЖИЙ аналогичный пример с другими числами/словами.
3. Дай пошаговый план, как ученику самому выполнить его задание.`;
    } else if (mode === 'hint') {
        modeInstruction = `СТРОГОЕ ПРАВИЛО: НЕ решай задачу и НЕ пиши ответ! Дай ученику только понятную наводящую подсказку: с чего начать, какую формулу или правило вспомнить и какой первый шаг сделать.`;
    } else {
        modeInstruction = `Ученик прислал задание и свой вариант решения. Проверь его ход мыслей. Если есть ошибка — не выдавай сразу готовый ответ, а мягко укажи, на каком этапе ошибка и какое правило нужно перепроверить. Если всё верно — похвали и подтверди правильность хода решения.`;
    }

    const prompt = `Ты — добрый и опытный школьный репетитор по предмету "${subjTitle}" для ученика (${grade}). 
${modeInstruction}
Используй знак умножения (×) вместо звездочки (*), дроби пиши через слэш (например 3/4), степени символами (², ³). Пиши структурированно, понятно и на русском языке.

Задание ученика:
${taskText}`;

    try {
        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await res.json();

        if (data.text) {
            const useMath = MATH_SUBJECTS.includes(subjKey);
            const cleanText = formatMathText(data.text, useMath);
            const displayHtml = cleanText.replace(/\n/g, '<br>');
            resultBox.innerHTML = `
                <div class="task-display" id="hwOutput" style="line-height: 1.8;">${displayHtml}</div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector('#hwOutput').innerText); this.textContent='Скопировано!'">📋 Скопировать разбор</button>
                </div>
            `;
            if (useMath) {
                renderKatexInElement(document.getElementById('hwOutput'));
            }
        } else {
            resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка ИИ. Попробуйте еще раз.</div>`;
        }
    } catch (error) {
        resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка сети. Проверьте подключение.</div>`;
    } finally {
        btn.textContent = 'Помочь разобраться';
        btn.disabled = false;
    }
}

function formatMathText(text, enableFractions = true) {
    let cleaned = text
        .replace(/\*\*/g, '')
        .replace(/([0-9a-zA-Zа-яА-Я)])\s*\*\s*([0-9a-zA-Zа-яА-Я(])/g, '$1 × $2')
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³');
    
    if (enableFractions) {
        cleaned = cleaned.replace(/(\d+)\s*\/\s*(\d+)/g, function(match, num, den) {
            return `\\(\\frac{${num}}{${den}}\\)`;
        });
    }
    return cleaned;
}

function renderKatexInElement(el) {
    if (window.renderMathInElement && el) {
        window.renderMathInElement(el, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '\\(', right: '\\)', display: false }
            ],
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

    if (!themeInput) {
        alert('Пожалуйста, выберите или введите тему!');
        return;
    }

    const now = Date.now();
    if (now - lastRequestTime < 5000) {
        alert('Подождите 5 секунд перед следующим запросом.');
        return;
    }
    lastRequestTime = now;

    btn.textContent = 'ИИ думает...';
    btn.disabled = true;
    resultBox.innerHTML = `<div class="task-display">Генерация (${grade}) по теме: "${themeInput}"...</div>`;

    const mathRule = `ВАЖНО: Пиши математические и химические выражения аккуратно. Вместо звездочки (*) используй знак умножения (×). Обыкновенные дроби пиши через слэш (например: 3/4 или 1/2). Степени пиши символами (², ³). Строго соблюдай программу ФГОС для ${grade} и не используй материал из более старших классов.`;

    let prompt = "";
    const isTextOnlyMode = (type === 'essay' || type === 'dictation');

    if (type === 'essay') {
        prompt = `Ты опытный учитель русского языка и литературы. Напиши школьное сочинение-рассуждение для ученика (${grade}) на тему: "${themeInput}". Соблюдай требования ФГОС и уровень словарного запаса, подходящий строго для ${grade}. Структура: вступление, 2 аргумента, заключение. Пиши на русском языке.`;
    } else if (type === 'dictation') {
        prompt = `Ты опытный учитель русского языка. Напиши связный текст для диктанта для ученика (${grade}) на тему: "${themeInput}". Соблюдай правила орфографии, пунктуации и объем слов строго по стандартам ФГОС для ${grade}. Выведи только сам текст диктанта, без заголовков и пояснений.`;
    } else if (type === 'exercise') {
        prompt = `Ты опытный учитель русского языка. Составь тренировочное упражнение для ученика (${grade}) по теме "${themeInput}". Сначала напиши задание (например, вставь пропущенные буквы и расставь знаки препинания), затем напиши "РЕШЕНИЕ:" и приведи правильный вариант с подробным объяснением орфограмм и пунктограмм. Пиши на русском языке.`;
    } else {
        const comp = document.getElementById('taskComplexity').value;
        const subjectTitle = SUBJECTS_CONFIG[type] ? SUBJECTS_CONFIG[type].title : type;
        prompt = `Ты опытный учитель по предмету "${subjectTitle}". Придумай учебное задание или задачу для ученика (${grade}) по теме "${themeInput}". Сложность: ${comp}. Сначала напиши условие задания, затем напиши "РЕШЕНИЕ:" и распиши подробное пошаговое решение/разбор с объяснениями, понятными ученику в ${grade}. ${mathRule} Пиши на русском языке.`;
    }

    try {
        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await res.json();
        
        if (data.text) {
            const useMath = MATH_SUBJECTS.includes(type);
            let cleanText = !isTextOnlyMode ? formatMathText(data.text, useMath) : data.text;
            let displayHtml = cleanText.replace(/\n/g, '<br>');

            if (!isTextOnlyMode) {
                displayHtml = displayHtml.replace(/РЕШЕНИЕ:/gi, '<br><br><strong style="color:var(--primary); font-size:1.2rem;">Решение и разбор:</strong><br>');
            }

            resultBox.innerHTML = `
                <div class="task-display" id="taskOutput" style="line-height: 1.8; font-size: 1.05rem;">${displayHtml}</div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap;">
                    <button class="btn btn-outline" onclick="generateAIText('${type}')">🔄 Другой вариант</button>
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector('#resultBox .task-display').innerText); this.textContent='Скопировано!'">📋 Скопировать</button>
                </div>
            `;
            if (useMath) {
                renderKatexInElement(document.getElementById('taskOutput'));
            }
        } else {
            resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка ИИ. Попробуйте еще раз.</div>`;
        }
    } catch (error) {
        resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка сети. Проверьте подключение.</div>`;
    } finally {
        btn.textContent = 'Сгенерировать';
        btn.disabled = false;
    }
}

async function askAI() {
    const input = document.getElementById('aiInput').value.trim();
    if (!input) return;

    const now = Date.now();
    if (now - lastRequestTime < 5000) {
        alert('Подождите 5 секунд перед следующим вопросом.');
        return;
    }
    lastRequestTime = now;

    const btn = document.getElementById('aiBtn');
    const responseBox = document.getElementById('aiResponse');
    
    btn.textContent = 'Думает...';
    btn.disabled = true;
    responseBox.style.display = 'block';
    responseBox.textContent = 'Нейросеть обрабатывает запрос...';

    try {
        const fullPrompt = `Ты — умный помощник школьного учителя и ученика. Отвечай грамотно, понятно и по делу на русском языке. Если ученик просит просто решить домашнее задание без объяснений, обязательно добавь подробное пояснение правил. Обыкновенные дроби пиши через слэш (например: 3/4 или 1/2). Вопрос: ${input}`;

        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: fullPrompt })
        });

        const data = await res.json();
        
        if (data.text) {
            const formatted = formatMathText(data.text, true).replace(/\n/g, '<br>');
            responseBox.innerHTML = formatted;
            renderKatexInElement(responseBox);
        } else {
            responseBox.textContent = 'Ошибка: ИИ не смог ответить.';
        }
    } catch (error) {
        responseBox.textContent = 'Ошибка сети. Проверьте подключение к интернету.';
    } finally {
        btn.textContent = 'Спросить';
        btn.disabled = false;
    }
}

function handleGlobalSearch() {
    const rawQ = searchInput.value.trim();
    const q = rawQ.toLowerCase();
    if (!q) return;

    const keywordMap = [
        { subject: 'russian', keys: ['сочин', 'диктант', 'глагол', 'причаст', 'орфограф', 'пунктуац', 'русск'] },
        { subject: 'literature', keys: ['стих', 'поэм', 'роман', 'пушкин', 'толстой', 'достоевск', 'литератур', 'герой'] },
        { subject: 'geometry', keys: ['треугольник', 'окружност', 'площад', 'пифагор', 'вектор', 'геометри', 'угол'] },
        { subject: 'probability', keys: ['вероятност', 'статистик', 'медиан', 'комбинатор', 'граф', 'случайн'] },
        { subject: 'physics', keys: ['скорост', 'ток', 'сила', 'физик', 'ньютон', 'ом', 'мощност', 'теплот'] },
        { subject: 'chemistry', keys: ['хими', 'моль', 'реакц', 'кислот', 'оксид', 'валентн', 'атом', 'таблиц менделеев'] },
        { subject: 'biology', keys: ['биолог', 'клетк', 'фотосинтез', 'генетик', 'мендел', 'анатом', 'эволюц'] },
        { subject: 'geography', keys: ['географ', 'климат', 'координат', 'рельеф', 'материк', 'океан', 'погод'] },
        { subject: 'history', keys: ['истор', 'петр', 'войн', 'русь', 'княз', 'реформ', 'ссср', 'век'] },
        { subject: 'social', keys: ['обществ', 'конституц', 'право', 'экономик', 'спрос', 'налог', 'государств'] },
        { subject: 'english', keys: ['english', 'английск', 'present', 'past', 'future', 'passive', 'verb', 'tense'] },
        { subject: 'algebra', keys: ['уравнен', 'функци', 'процент', 'алгебр', 'дроб', 'прогресс', 'корн'] },
        { subject: 'informatics', keys: ['двоичн', 'систем', 'логик', 'информатик', 'алгоритм', 'python', 'код'] }
    ];

    const matched = keywordMap.find(item => item.keys.some(k => q.includes(k)));

    if (q.includes('дз') || q.includes('домашн') || q.includes('помог')) {
        openHomeworkForSubject(matched ? matched.subject : 'algebra');
        setTimeout(() => {
            const hwInput = document.getElementById('hwTaskInput');
            if (hwInput) hwInput.value = rawQ;
        }, 100);
        return;
    }

    if (matched) {
        const targetBtn = document.querySelector(`[data-subject="${matched.subject}"]`);
        if (targetBtn) targetBtn.click();
        setTimeout(() => {
            if (matched.subject === 'russian') {
                if (q.includes('сочин')) renderRussianGenerator('essay');
                else if (q.includes('диктант')) renderRussianGenerator('dictation');
                else renderRussianGenerator('exercise');
            }
            const themeEl = document.getElementById('themeInput');
            if (themeEl) themeEl.value = rawQ;
        }, 100);
    } else {
        document.querySelector('[data-subject="ai"]').click();
        setTimeout(() => {
            document.getElementById('aiInput').value = rawQ;
            askAI();
        }, 100);
    }
}

searchBtn.addEventListener('click', handleGlobalSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleGlobalSearch();
});

const aiInputEl = document.getElementById('aiInput');
if (aiInputEl) {
    aiInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') askAI();
    });
}

// Запуск стартового экрана
renderSubject('russian');
