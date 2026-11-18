const contentArea = document.getElementById('contentArea');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const navBtns = document.querySelectorAll('.nav-btn');
const themeToggle = document.getElementById('themeToggle');

let currentSubject = 'russian';
let currentArgCount = 3;

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
        renderSubject(currentSubject);
    });
});

function renderSubject(subject) {
    if (subject === 'russian') renderRussianMenu();
    else if (taskGenerators[subject]) renderTaskGenerator(subject);
}

// --- РУССКИЙ ЯЗЫК ---
function renderRussianMenu() {
    contentArea.innerHTML = `
        <div class="generator-box">
            <h3>📖 Русский язык</h3>
            <p>Выберите тип работы.</p>
            <div class="controls">
                <button class="btn" onclick="renderEssayGenerator()">📝 Сочинение</button>
                <button class="btn btn-outline" onclick="renderDictation()">✍️ Диктант</button>
            </div>
        </div>
        <div id="russianResult"></div>
    `;
}

function renderDictation() {
    document.getElementById('russianResult').innerHTML = `
        <div class="generator-box" style="border-style:solid; text-align:left;">
            <h3>✍️ Генератор диктантов</h3>
            <p>Выберите сложность и количество предложений.</p>
            <div style="margin-bottom: 1rem;">
                <label>Сложность:</label>
                <select id="dictLevel" style="padding: 0.5rem; border-radius: 8px; width: 100%; margin-top: 0.5rem;">
                    <option value="easy">Лёгкий (5-7 класс)</option>
                    <option value="medium" selected>Средний (8-9 класс)</option>
                    <option value="hard">Сложный (10-11 класс)</option>
                </select>
            </div>
            <div style="margin-bottom: 1rem;">
                <label>Количество предложений: <span id="sentCountLabel">5</span></label>
                <input type="range" id="sentCount" min="3" max="12" value="5" step="1" style="width: 100%;">
            </div>
            <button class="btn" onclick="generateDictation()">Сгенерировать</button>
            <div id="dictationResult" style="margin-top: 1.5rem;"></div>
        </div>
    `;
    document.getElementById('sentCount').addEventListener('input', (e) => {
        document.getElementById('sentCountLabel').textContent = e.target.value;
    });
}

function generateDictation() {
    const level = document.getElementById('dictLevel').value;
    const count = parseInt(document.getElementById('sentCount').value);
    const pool = russianEngine.dictationPool[level];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const text = shuffled.slice(0, count).join(' ');
    
    document.getElementById('dictationResult').innerHTML = `
        <div class="task-display" style="line-height: 2;">${text}</div>
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button class="btn btn-outline" onclick="generateDictation()">🔄 Другой диктант</button>
            <button class="btn btn-secondary" onclick="navigator.clipboard.writeText('${text}'); this.textContent='Скопировано!'">📋 Скопировать</button>
        </div>
    `;
}

function renderEssayGenerator() {
    document.getElementById('russianResult').innerHTML = `
        <div class="generator-box" style="border-style:solid; text-align:left;">
            <h3>📝 Конструктор сочинений</h3>
            <div style="margin-bottom: 1rem;">
                <label>Количество аргументов: <span id="argCountLabel">3</span></label>
                <input type="range" id="essaySize" min="1" max="5" value="3" step="1" style="width: 100%;">
            </div>
            <div class="controls" style="justify-content: flex-start;">
                <input type="text" id="essayTheme" placeholder="Тема (любовь, дружба, природа, подвиг, нравственный выбор, патриотизм, мечта)">
                <button class="btn" onclick="generateEssay()">Сгенерировать</button>
            </div>
            <div id="essayResult" style="margin-top: 1.5rem;"></div>
        </div>
    `;
    document.getElementById('essaySize').addEventListener('input', (e) => {
        currentArgCount = parseInt(e.target.value);
        document.getElementById('argCountLabel').textContent = e.target.value;
    });
}

function generateEssay() {
    const query = document.getElementById('essayTheme').value.toLowerCase().trim();
    let themeKey = null;
    if (query.includes('любов')) themeKey = 'любовь';
    else if (query.includes('друж')) themeKey = 'дружба';
    else if (query.includes('природ')) themeKey = 'природа';
    else if (query.includes('подвиг')) themeKey = 'подвиг';
    else if (query.includes('нравствен')) themeKey = 'нравственный выбор';
    else if (query.includes('патриот')) themeKey = 'патриотизм';
    else if (query.includes('мечт')) themeKey = 'мечта';
    
    if (!themeKey) {
        document.getElementById('essayResult').innerHTML = `<div class="task-display" style="color: #ef4444;">Тема не найдена. Попробуйте: любовь, дружба, природа, подвиг, нравственный выбор, патриотизм, мечта.</div>`;
        return;
    }

    const data = russianEngine.essayThemes[themeKey];
    const intro = data.intros[Math.floor(Math.random() * data.intros.length)];
    const conclusion = data.conclusions[Math.floor(Math.random() * data.conclusions.length)];
    
    let fullText = `<h2>${data.title}</h2><br><strong>Вступление:</strong><br>${intro}<br><br>`;
    for (let i = 0; i < currentArgCount; i++) {
        const template = data.args[Math.floor(Math.random() * data.args.length)];
        const argText = template
            .replace('{author}', authors[Math.floor(Math.random() * authors.length)])
            .replace('{title}', titles[Math.floor(Math.random() * titles.length)])
            .replace('{hero}', heroes[Math.floor(Math.random() * heroes.length)])
            .replace('{heroine}', heroines[Math.floor(Math.random() * heroines.length)]);
        fullText += `<strong>Аргумент ${i + 1}:</strong><br>${argText}<br><br>`;
    }
    fullText += `<strong>Заключение:</strong><br>${conclusion}`;

    document.getElementById('essayResult').innerHTML = `
        <div class="task-display" style="line-height: 1.8;">${fullText}</div>
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button class="btn btn-outline" onclick="generateEssay()">🔄 Другой вариант</button>
            <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector('#essayResult .task-display').innerText); this.textContent='Скопировано!'">📋 Скопировать</button>
        </div>
    `;
}

// --- МАТЕМАТИКА И ДРУГИЕ ---
function renderTaskGenerator(subjectKey) {
    const subject = taskGenerators[subjectKey];
    let html = `
        <div class="generator-box">
            <h3>${subject.icon} Генератор: ${subject.title}</h3>
            <p>Выберите тип задачи.</p>
            <div class="controls">
    `;
    for (const [key, gen] of Object.entries(subject.generators)) {
        html += `<button class="btn btn-outline" onclick="generateTask('${subjectKey}', '${key}')">${gen.name}</button>`;
    }
    html += `</div></div><div id="taskResult"></div>`;
    contentArea.innerHTML = html;
}

function generateTask(subjectKey, genKey) {
    const generator = taskGenerators[subjectKey].generators[genKey];
    const task = generator.generate();
    document.getElementById('taskResult').innerHTML = `
        <div class="generator-box" style="border-style:solid; text-align:left; margin-top: 1rem;">
            <h3>🎯 ${generator.name}</h3>
            <div class="task-display">${task.text.replace(/\n/g, '<br>')}</div>
            <div style="margin-top:1rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn" onclick="document.getElementById('answerBox').style.display='block'">Показать решение</button>
                <button class="btn btn-outline" onclick="generateTask('${subjectKey}', '${genKey}')">🔄 Другая задача</button>
                <button class="btn btn-secondary" onclick="navigator.clipboard.writeText(document.querySelector('#taskResult .task-display').innerText); this.textContent='Скопировано!'">📋 Скопировать</button>
            </div>
            <div id="answerBox" class="answer-display">${task.answer.replace(/\n/g, '<br>')}</div>
        </div>
    `;
}

// Поиск
searchBtn.addEventListener('click', () => {
    const q = searchInput.value.toLowerCase().trim();
    if (!q) return;

    if (q.includes('друж') || q.includes('любов') || q.includes('природ') || q.includes('подвиг') || q.includes('нравствен') || q.includes('патриот') || q.includes('мечт')) {
        document.querySelector('[data-subject="russian"]').click();
        setTimeout(() => renderEssayGenerator(), 100);
        setTimeout(() => { document.getElementById('essayTheme').value = q; generateEssay(); }, 200);
    } else if (q.includes('диктант')) {
        document.querySelector('[data-subject="russian"]').click();
        setTimeout(() => renderDictation(), 100);
    } else if (q.includes('уравнен')) {
        document.querySelector('[data-subject="algebra"]').click();
        setTimeout(() => generateTask('algebra', 'quadratic'), 100);
    } else if (q.includes('упростит')) {
        document.querySelector('[data-subject="algebra"]').click();
        setTimeout(() => generateTask('algebra', 'simplify'), 100);
    } else if (q.includes('функци')) {
        document.querySelector('[data-subject="algebra"]').click();
        setTimeout(() => generateTask('algebra', 'function_value'), 100);
    } else if (q.includes('прогресс')) {
        document.querySelector('[data-subject="algebra"]').click();
        setTimeout(() => generateTask('algebra', 'progression'), 100);
    } else if (q.includes('систем')) {
        document.querySelector('[data-subject="algebra"]').click();
        setTimeout(() => generateTask('algebra', 'system'), 100);
    } else if (q.includes('процент')) {
        document.querySelector('[data-subject="algebra"]').click();
        setTimeout(() => generateTask('algebra', 'percent'), 100);
    } else if (q.includes('пифагор')) {
        document.querySelector('[data-subject="geometry"]').click();
        setTimeout(() => generateTask('geometry', 'pythagoras'), 100);
    } else if (q.includes('окружност')) {
        document.querySelector('[data-subject="geometry"]').click();
        setTimeout(() => generateTask('geometry', 'circle'), 100);
    } else if (q.includes('площад')) {
        document.querySelector('[data-subject="geometry"]').click();
        setTimeout(() => generateTask('geometry', 'area_triangle'), 100);
    } else if (q.includes('объём')) {
        document.querySelector('[data-subject="geometry"]').click();
        setTimeout(() => generateTask('geometry', 'volume_cube'), 100);
    } else if (q.includes('тригонометр')) {
        document.querySelector('[data-subject="geometry"]').click();
        setTimeout(() => generateTask('geometry', 'trigonometry'), 100);
    } else if (q.includes('ом') || q.includes('ток')) {
        document.querySelector('[data-subject="physics"]').click();
        setTimeout(() => generateTask('physics', 'ohm'), 100);
    } else if (q.includes('мощност')) {
        document.querySelector('[data-subject="physics"]').click();
        setTimeout(() => generateTask('physics', 'power'), 100);
    } else if (q.includes('плотност')) {
        document.querySelector('[data-subject="physics"]').click();
        setTimeout(() => generateTask('physics', 'density'), 100);
    } else if (q.includes('теплот')) {
        document.querySelector('[data-subject="physics"]').click();
        setTimeout(() => generateTask('physics', 'heat'), 100);
    } else if (q.includes('двоичн') || q.includes('систем счисл')) {
        document.querySelector('[data-subject="informatics"]').click();
        setTimeout(() => generateTask('informatics', 'binary'), 100);
    } else if (q.includes('логик')) {
        document.querySelector('[data-subject="informatics"]').click();
        setTimeout(() => generateTask('informatics', 'logic'), 100);
    } else {
        alert('Попробуйте: Дружба, Любовь, Природа, Подвиг, Диктант, Уравнение, Упростить, Функция, Прогрессия, Система, Процент, Пифагор, Окружность, Площадь, Объём, Тригонометрия, Закон Ома, Мощность, Плотность, Теплота, Двоичная, Логика.');
    }
});

renderSubject('russian');