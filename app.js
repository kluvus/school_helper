const contentArea = document.getElementById('contentArea');
const aiArea = document.getElementById('aiArea');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const navBtns = document.querySelectorAll('.nav-btn');
const themeToggle = document.getElementById('themeToggle');

// =====================================================================
// ВАЖНО: ВСТАВЬТЕ СЮДА ВАШУ ССЫЛКУ ОТ CLOUDFLARE WORKER
// =====================================================================
const PROXY_URL = "https://mbou-school-1-helper.vaceslavkorotkih76.workers.dev"; 

let currentSubject = 'russian';

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

function renderSubject(subject) {
    if (subject === 'russian') renderRussianMenu();
    else if (['algebra', 'geometry', 'physics', 'informatics'].includes(subject)) {
        renderSubjectMenu(subject);
    }
}

// ==========================================
// РУССКИЙ ЯЗЫК
// ==========================================
function renderRussianMenu() {
    contentArea.innerHTML = `
        <div class="generator-box">
            <h3>📖 Русский язык</h3>
            <p>Выберите тип работы. Нейросеть напишет текст на любую тему.</p>
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
            <p>Введите тему для генерации.</p>
            <div class="controls" style="justify-content: flex-start;">
                <input type="text" id="themeInput" placeholder="Например: ${isEssay ? 'Роль книги в жизни человека' : 'Осень в лесу'}">
                ${!isEssay ? `
                <select id="dictLevel" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--border-solid);">
                    <option value="5-7 класс">5-7 класс</option>
                    <option value="8-9 класс" selected>8-9 класс</option>
                    <option value="10-11 класс">10-11 класс</option>
                </select>` : ''}
                <button class="btn" id="genBtn" onclick="generateAIText('${type}')">Сгенерировать</button>
            </div>
            <div id="resultBox" style="margin-top: 1.5rem;"></div>
        </div>
    `;
}

// ==========================================
// МАТЕМАТИКА, ФИЗИКА, ИНФОРМАТИКА
// ==========================================
function renderSubjectMenu(subject) {
    const config = {
        algebra: { title: 'Алгебра', icon: '📐', types: ['Уравнения', 'Упростить выражение', 'Функции', 'Задачи на проценты', 'Прогрессии'] },
        geometry: { title: 'Геометрия', icon: '📏', types: ['Треугольники', 'Окружность', 'Площади фигур', 'Векторы', 'Стереометрия'] },
        physics: { title: 'Физика', icon: '⚛️', types: ['Кинематика', 'Динамика', 'Закон Ома', 'Мощность', 'Плотность', 'Тепловые явления'] },
        informatics: { title: 'Информатика', icon: '💻', types: ['Системы счисления', 'Логика', 'Алгоритмы', 'Объём информации'] }
    };

    const sub = config[subject];
    let buttonsHtml = sub.types.map(t => `<button class="btn btn-outline" onclick="document.getElementById('themeInput').value='${t}'">${t}</button>`).join('');

    contentArea.innerHTML = `
        <div class="generator-box">
            <h3>${sub.icon} ${sub.title}</h3>
            <p>Введите любую тему. ИИ придумает задачу и решит её.</p>
            <div class="controls" style="margin-bottom: 1rem;">${buttonsHtml}</div>
            <div class="controls" style="justify-content: center; margin-top: 1.5rem;">
                <input type="text" id="themeInput" placeholder="Своя тема...">
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

// ==========================================
// ГЕНЕРАТОР ИИ
// ==========================================
async function generateAIText(type) {
    const themeInput = document.getElementById('themeInput').value.trim();
    const resultBox = document.getElementById('resultBox');
    const btn = document.getElementById('genBtn');

    if (!themeInput) {
        alert('Пожалуйста, введите тему!');
        return;
    }

    if (PROXY_URL.includes("ВАША_ССЫЛКА")) {
        resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Вы не настроили Cloudflare Worker. Вставьте ссылку в app.js.</div>`;
        return;
    }

    btn.textContent = 'ИИ думает...';
    btn.disabled = true;
    resultBox.innerHTML = `<div class="task-display">Генерация по теме: "${themeInput}"...</div>`;

    let prompt = "";
    if (type === 'essay') {
        prompt = `Напиши школьное сочинение-рассуждение на тему: "${themeInput}". Структура: вступление, 2-3 аргумента из литературы, заключение. Объем не менее 250 слов. Пиши на русском языке.`;
    } else if (type === 'dictation') {
        const level = document.getElementById('dictLevel').value;
        prompt = `Напиши текст для диктанта на тему: "${themeInput}". Уровень сложности: ${level}. Объем 120-150 слов. Соблюдай правила орфографии и пунктуации для этого класса. Просто текст, без заголовков.`;
    } else {
        const comp = document.getElementById('taskComplexity').value;
        const subjectNames = { algebra: 'алгебры', geometry: 'геометрии', physics: 'физики', informatics: 'информатики' };
        prompt = `Ты учитель ${subjectNames[type]}. Придумай задачу по теме "${themeInput}". Сложность: ${comp}. Сначала напиши текст задачи, затем напиши "РЕШЕНИЕ:" и распиши полное пошаговое решение с формулами и объяснениями. Пиши на русском языке.`;
    }

    try {
        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await res.json();
        
        if (data.text) {
            let displayHtml = data.text.replace(/\n/g, '<br>');
            if (type !== 'essay' && type !== 'dictation') {
                displayHtml = displayHtml.replace(/РЕШЕНИЕ:/gi, '<br><br><strong style="color:var(--primary); font-size:1.2rem;">Решение:</strong><br>');
            }

            resultBox.innerHTML = `
                <div class="task-display" style="line-height: 1.8; font-size: 1.05rem;">${displayHtml}</div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button class="btn btn-outline" onclick="generateAIText('${type}')">🔄 Другой вариант</button>
                    <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector('#resultBox .task-display').innerText); this.textContent='Скопировано!'">📋 Скопировать</button>
                </div>
            `;
        } else {
            resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка ИИ. Попробуйте еще раз.</div>`;
        }
    } catch (error) {
        resultBox.innerHTML = `<div class="task-display" style="color: #ef4444;">Ошибка сети. Проверьте прокси.</div>`;
    } finally {
        btn.textContent = 'Сгенерировать';
        btn.disabled = false;
    }
}

// ==========================================
// ЧАТ ИИ
// ==========================================
async function askAI() {
    const input = document.getElementById('aiInput').value.trim();
    if (!input) return;

    const btn = document.getElementById('aiBtn');
    const responseBox = document.getElementById('aiResponse');
    
    btn.textContent = 'Думает...';
    btn.disabled = true;
    responseBox.style.display = 'block';
    responseBox.textContent = 'Нейросеть обрабатывает запрос...';

    if (PROXY_URL.includes("ВАША_ССЫЛКА")) {
        responseBox.textContent = 'Ошибка: Ссылка на Cloudflare Worker не вставлена в app.js.';
        btn.textContent = 'Спросить';
        btn.disabled = false;
        return;
    }

    try {
        const fullPrompt = `Ты — умный помощник учителя. Отвечай кратко, по делу, на русском языке. Вопрос: ${input}`;

        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: fullPrompt })
        });

        const data = await res.json();
        
        if (data.text) {
            responseBox.textContent = data.text;
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

// ==========================================
// ГЛОБАЛЬНЫЙ ПОИСК
// ==========================================
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

// Инициализация
renderSubject('russian');
