const contentArea = document.getElementById('contentArea');
const aiArea = document.getElementById('aiArea');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const navBtns = document.querySelectorAll('.nav-btn');
const themeToggle = document.getElementById('themeToggle');

const PROXY_URL = "https://mbou-school-1-helper.vaceslavkorotkih76.workers.dev/";

let currentSubject = 'russian';
let lastRequestTime = 0;

const SYMBOL_SETS = {
    algebra: ['a/b', '√', 'x²', 'x³', '×', '÷', '±', '≠', '≤', '≥', 'π'],
    geometry: ['∠', '°', '△', '⊥', '∥', 'π', '√', '²', '≅', '∼'],
    physics: ['a/b', '×', '÷', '²', '³', 'Δ', 'ρ', 'Ω', 'μ', 'λ', '°'],
    informatics: ['∧', '∨', '¬', '→', '↔', '⊕', '∈', '∀', '∃', '₂', '₈', '₁₆'],
    ai: ['a/b', '√', '²', '³', '×', '÷', '±', '∠', '°', '△', 'π', 'Δ']
};

function insertSym(inputId, sym) {
    const el = document.getElementById(inputId);
    if (!el) return;
    const toInsert = sym === 'a/b' ? ' / ' : sym;
    const start = el.selectionStart || el.value.length;
    const end = el.selectionEnd || el.value.length;
    el.value = el.value.substring(0, start) + toInsert + el.value.substring(end);
    el.focus();
    const pos = start + toInsert.length;
    el.setSelectionRange(pos, pos);
}

function buildSymbolBar(inputId, subject) {
    const syms = SYMBOL_SETS[subject] || SYMBOL_SETS.ai;
    return syms.map(s => `<button type="button" class="btn btn-outline" style="padding: 0.35rem 0.65rem; font-size: 0.95rem; min-width: 36px;" onclick="insertSym('${inputId}', '${s}')">${s}</button>`).join('');
}

const aiSymBox = document.getElementById('aiSymbols');
if (aiSymBox) aiSymBox.innerHTML = buildSymbolBar('aiInput', 'ai');

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

function renderSubject(subject) {
    if (subject === 'russian') renderRussianMenu();
    else if (['algebra', 'geometry', 'physics', 'informatics'].includes(subject)) {
        renderSubjectMenu(subject);
    }
}

function renderRussianMenu() {
    contentArea.innerHTML = `
        <div class="generator-box">
            <h3>📖 Русский язык</h3>
            <p>Выберите тип работы. Нейросеть напишет текст строго по школьной программе для выбранного класса.</p>
            <div class="controls">
                <button class="btn" onclick="renderRussianGenerator('essay')">📝 Сочинение на любую тему</button>
                <button class="btn btn-outline" onclick="renderRussianGenerator('dictation')">✍️ Диктант на любую тему</button>
            </div>
        </div>
        <div id="russianResult"></div>
    `;
}

function renderRussianGenerator(type) {
    const isEssay = type === 'essay';
    document.getElementById('russianResult').innerHTML = `
        <div class="generator-box" style="border-style:solid; text-align:left;">
            <h3>${isEssay ? '📝 Сочинение' : '✍️ Диктант'}</h3>
            <p>Укажите класс и тему для генерации по программе ФГОС.</p>
            <div class="controls" style="justify-content: flex-start; flex-wrap: wrap; gap: 0.6rem;">
                <select id="gradeLevel" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--border-solid);">
                    ${getGradeOptions(1, 11, 8)}
                </select>
                <input type="text" id="themeInput" placeholder="Например: ${isEssay ? 'Роль книги в жизни человека' : 'Осень в лесу'}">
                <button class="btn" id="genBtn" onclick="generateAIText('${type}')">Сгенерировать</button>
            </div>
            <div id="resultBox" style="margin-top: 1.5rem;"></div>
        </div>
    `;
}

function renderSubjectMenu(subject) {
    const config = {
        algebra: { title: 'Алгебра (Математика)', icon: '📐', minGrade: 1, defaultGrade: 8, types: ['Уравнения', 'Упростить выражение', 'Функции', 'Задачи на проценты', 'Прогрессии', 'Дроби'] },
        geometry: { title: 'Геометрия', icon: '📏', minGrade: 1, defaultGrade: 8, types: ['Треугольники', 'Окружность', 'Площади фигур', 'Векторы', 'Стереометрия'] },
        physics: { title: 'Физика', icon: '⚛️', minGrade: 7, defaultGrade: 8, types: ['Кинематика', 'Динамика', 'Закон Ома', 'Мощность', 'Плотность', 'Тепловые явления'] },
        informatics: { title: 'Информатика', icon: '💻', minGrade: 1, defaultGrade: 8, types: ['Системы счисления', 'Логика', 'Алгоритмы', 'Объём информации'] }
    };

    const sub = config[subject];
    let buttonsHtml = sub.types.map(t => `<button class="btn btn-outline" onclick="document.getElementById('themeInput').value='${t}'">${t}</button>`).join('');

    contentArea.innerHTML = `
        <div class="generator-box">
            <h3>${sub.icon} ${sub.title}</h3>
            <p>Выберите класс и тему. ИИ составит задачу по школьной программе и распишет решение.</p>
            <div class="controls" style="margin-bottom: 1rem;">${buttonsHtml}</div>
            <div style="display: flex; gap: 0.35rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem;">
                ${buildSymbolBar('themeInput', subject)}
            </div>
            <div class="controls" style="justify-content: center; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.8rem;">
                <select id="gradeLevel" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--border-solid);">
                    ${getGradeOptions(sub.minGrade, 11, sub.defaultGrade)}
                </select>
                <input type="text" id="themeInput" placeholder="Своя тема или пример...">
                <select id="taskComplexity" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--border-solid);">
                    <option value="лёгкая">Лёгкая</option>
                    <option value="средняя" selected>Средняя</option>
                    <option value="сложная">Сложная</option>
                </select>
                <button class="btn" id="genBtn" onclick="generateAIText('${subject}')">Сгенерировать</button>
            </div>
            <div id="resultBox" style="margin-top: 1.5rem;"></div>
        </div>
    `;
}

function renderFractionsAndMath(el) {
    if (window.renderMathInElement) {
        renderMathInElement(el, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
                { left: '\\[', right: '\\]', display: true }
            ],
            throwOnError: false
        });
    }
}

function formatMathText(text) {
    return text
        .replace(/\*\*/g, '')
        .replace(/\*/g, ' × ')
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³')
        .replace(/(?<![\\$\w])(\d+)\s*\/\s*(\d+)(?![\w$])/g, '$\\frac{$1}{$2}$');
}

async function generateAIText(type) {
    const themeInput = document.getElementById('themeInput').value.trim();
    const gradeEl = document.getElementById('gradeLevel');
    const grade = gradeEl ? gradeEl.value : '8 класс';
    const resultBox = document.getElementById('resultBox');
    const btn = document.getElementById('genBtn');

    if (!themeInput) {
        alert('Пожалуйста, введите тему!');
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

    const mathRule = `ВАЖНО: Пиши простым понятным школьным языком. Обыкновенные и алгебраические дроби оформляй как настоящие двухэтажные дроби через $\\frac{числитель}{знаменатель}$ (например, $\\frac{3}{4}$). Знак умножения пиши как ×, корни как $\\sqrt{x}$, степени как ² и ³. Строго соблюдай программу ФГОС для ${grade} и не используй формулы из более старших классов.`;

    let prompt = "";
    
    if (type === 'essay') {
        prompt = `Ты опытный учитель русского языка и литературы. Напиши школьное сочинение-рассуждение для ученика (${grade}) на тему: "${themeInput}". Соблюдай требования ФГОС и уровень словарного запаса, подходящий строго для ${grade}. Структура: вступление, 2 аргумента, заключение. Пиши на русском языке.`;
    } else if (type === 'dictation') {
        prompt = `Ты опытный учитель русского языка. Напиши связный текст для диктанта для ученика (${grade}) на тему: "${themeInput}". Соблюдай правила орфографии, пунктуации и объем слов строго по стандартам ФГОС для ${grade}. Выведи только сам текст диктанта, без заголовков и пояснений.`;
    } else {
        const comp = document.getElementById('taskComplexity').value;
        const subjectNames = { algebra: 'математики и алгебры', geometry: 'геометрии', physics: 'физики', informatics: 'информатики' };
        prompt = `Ты опытный учитель ${subjectNames[type]}. Придумай учебную задачу для ученика (${grade}) по теме "${themeInput}". Сложность: ${comp}. Сначала напиши условие задачи, затем напиши "РЕШЕНИЕ:" и распиши подробное пошаговое решение с формулами и объяснениями, понятными ученику в ${grade}. ${mathRule} Пиши на русском языке.`;
    }

    try {
        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await res.json();
        
        if (data.text) {
            let cleanText = (type !== 'essay' && type !== 'dictation') ? formatMathText(data.text) : data.text;
            let displayHtml = cleanText.replace(/\n/g, '<br>');

            if (type !== 'essay' && type !== 'dictation') {
                displayHtml = displayHtml.replace(/РЕШЕНИЕ:/gi, '<br><br><strong style="color:var(--primary); font-size:1.2rem;">Решение:</strong><br>');
            }

            resultBox.innerHTML = `
                <div class="task-display" style="line-height: 1.9; font-size: 1.05rem;">${displayHtml}</div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button class="btn btn-outline" onclick="generateAIText('${type}')">🔄 Другой вариант</button>
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector('#resultBox .task-display').innerText); this.textContent='Скопировано!'">📋 Скопировать</button>
                </div>
            `;
            if (type !== 'essay' && type !== 'dictation') {
                renderFractionsAndMath(resultBox);
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
        const fullPrompt = `Ты — умный помощник школьного учителя. Отвечай кратко, грамотно, простым школьным языком на русском языке. Если в ответе есть дроби, оформляй их как двухэтажные через $\\frac{числитель}{знаменатель}$. Вопрос: ${input}`;

        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: fullPrompt })
        });

        const data = await res.json();
        
        if (data.text) {
            responseBox.innerHTML = formatMathText(data.text).replace(/\n/g, '<br>');
            renderFractionsAndMath(responseBox);
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

searchBtn.addEventListener('click', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) return;

    if (currentSubject === 'ai') {
        contentArea.style.display = 'block';
        aiArea.style.display = 'none';
        document.querySelector('[data-subject="russian"]').click(); 
    }

    if (q.includes('сочин') || q.includes('друж') || q.includes('любов')) {
        document.querySelector('[data-subject="russian"]').click();
        setTimeout(() => { renderRussianGenerator('essay'); document.getElementById('themeInput').value = q; }, 100);
    } else if (q.includes('диктант')) {
        document.querySelector('[data-subject="russian"]').click();
        setTimeout(() => { renderRussianGenerator('dictation'); document.getElementById('themeInput').value = q.replace('диктант', '').trim(); }, 100);
    } else if (q.includes('треугольник') || q.includes('окружност') || q.includes('площад') || q.includes('геометри')) {
        document.querySelector('[data-subject="geometry"]').click();
        setTimeout(() => { document.getElementById('themeInput').value = q; }, 100);
    } else if (q.includes('скорост') || q.includes('ток') || q.includes('сила') || q.includes('физик')) {
        document.querySelector('[data-subject="physics"]').click();
        setTimeout(() => { document.getElementById('themeInput').value = q; }, 100);
    } else if (q.includes('уравнен') || q.includes('функци') || q.includes('процент') || q.includes('алгебр')) {
        document.querySelector('[data-subject="algebra"]').click();
        setTimeout(() => { document.getElementById('themeInput').value = q; }, 100);
    } else if (q.includes('двоичн') || q.includes('систем') || q.includes('логик') || q.includes('информатик')) {
        document.querySelector('[data-subject="informatics"]').click();
        setTimeout(() => { document.getElementById('themeInput').value = q; }, 100);
    } else {
        document.querySelector('[data-subject="ai"]').click();
        setTimeout(() => { document.getElementById('aiInput').value = q; askAI(); }, 100);
    }
});

renderSubject('russian');
