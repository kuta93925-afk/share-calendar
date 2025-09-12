document.addEventListener("DOMContentLoaded", () => {
    // 祝日データ (2025年, 2026年)
    const holidays = {
        "2025-01-01": "元日", "2025-01-13": "成人の日", "2025-02-11": "建国記念の日", "2025-02-23": "天皇誕生日", "2025-02-24": "振替休日",
        "2025-03-20": "春分の日", "2025-04-29": "昭和の日", "2025-05-03": "憲法記念日", "2025-05-04": "みどりの日", "2025-05-05": "こどもの日",
        "2025-05-06": "振替休日", "2025-07-21": "海の日", "2025-08-11": "山の日", "2025-09-15": "敬老の日", "2025-09-23": "秋分の日",
        "2025-10-13": "スポーツの日", "2025-11-03": "文化の日", "2025-11-23": "勤労感謝の日", "2025-11-24": "振替休日",
        "2026-01-01": "元日", "2026-01-12": "成人の日", "2026-02-11": "建国記念の日", "2026-02-23": "天皇誕生日", "2026-03-20": "春分の日",
        "2026-04-29": "昭和の日", "2026-05-03": "憲法記念日", "2026-05-04": "みどりの日", "2026-05-05": "こどもの日", "2026-05-06": "振替休日",
        "2026-07-20": "海の日", "2026-08-11": "山の日", "2026-09-21": "敬老の日", "2026-09-22": "国民の休日", "2026-09-23": "秋分の日",
        "2026-10-12": "スポーツの日", "2026-11-03": "文化の日", "2026-11-23": "勤労感謝の日"
    };

    const credentials = { "拓己": "my", "心春": "partner" };
    const commonPassword = "1234";
    let currentYear, currentMonth;
    let currentCalendar = "my";
    let currentUser = null;
    let events = { my: [], partner: [], shared: [] };
    let currentEventId = null;

    // DOM要素 (変更なし)
    const loginContainer = document.getElementById("loginContainer");
    const calendarContainer = document.getElementById("calendarContainer");
    const loginUserInput = document.getElementById("loginUser");
    const loginPasswordInput = document.getElementById("loginPassword");
    const loginBtn = document.getElementById("loginBtn");
    const loginMsg = document.getElementById("loginMsg");
    const calendarDiv = document.getElementById("calendar");
    const calendarTitle = document.getElementById("calendar-title");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const todayBtn = document.getElementById("todayBtn");
    const calendarTabs = document.getElementById("calendarTabs");
    const eventModalEl = document.getElementById('eventModal');
    const eventModal = new bootstrap.Modal(eventModalEl);
    const modal = {
        title: document.getElementById("eventTitle"), startDate: document.getElementById("eventStartDate"),
        startTime: document.getElementById("eventStartTime"), endDate: document.getElementById("eventEndDate"),
        endTime: document.getElementById("eventEndTime"), memo: document.getElementById("eventMemo"),
        saveBtn: document.getElementById("saveEventBtn"), deleteBtn: document.getElementById("deleteEventBtn"),
        colorButtonsDiv: document.getElementById("colorButtons")
    };
    const colors = ['#0d6efd', '#6f42c1', '#28a745', '#ffc107', '#fd7e14', '#dc3545'];
    const userColors = { my: '#28a745', partner: '#fd7e14' };

    // ログイン処理 (変更なし)
    loginBtn.addEventListener("click", () => {
        const user = loginUserInput.value.trim();
        const pass = loginPasswordInput.value;
        if (!credentials[user] || pass !== commonPassword) {
            loginMsg.textContent = "ユーザー名またはパスワードが違います"; return;
        }
        currentUser = credentials[user];
        loginContainer.style.display = "none";
        calendarContainer.style.display = "block";
        initCalendar();
    });

    // データ管理
    const loadEvents = () => {
        const saved = localStorage.getItem("calendarEvents");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.my) && Array.isArray(parsed.partner) && Array.isArray(parsed.shared)) events = parsed;
        }
    };
    const saveEvents = () => localStorage.setItem("calendarEvents", JSON.stringify(events));

    // ▼▼▼ 修正点: タイムゾーン問題を解決する日付フォーマットに変更 ▼▼▼
    const formatDate = date => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // --- UI描画 ---
    const generateCalendar = (year, month) => {
        calendarTitle.textContent = `${year}年 ${month}月`;
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate();
        const startDayOfWeek = firstDayOfMonth.getDay();
        const today = new Date();
        const todayString = formatDate(today);
        const prevMonthEndDate = new Date(year, month - 1, 0);
        const prevMonthDays = prevMonthEndDate.getDate();
        
        let html = `<table class="table table-bordered"><thead><tr>
            <th class="sunday">日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th class="saturday">土</th>
            </tr></thead><tbody><tr>`;
        
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            html += `<td class="other-month"><span class="date-number">${prevMonthDays - i}</span></td>`;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month - 1, day);
            const dateKey = formatDate(currentDate);
            const dayOfWeek = currentDate.getDay();

            let dayClass = '';
            if (dayOfWeek === 0 || holidays[dateKey]) dayClass = 'sunday';
            else if (dayOfWeek === 6) dayClass = 'saturday';

            const isToday = (dateKey === todayString) ? 'today' : '';
            if (dayOfWeek === 0 && day > 1) html += `</tr><tr>`;
            
            html += `<td data-date="${dateKey}" class="${isToday} ${dayClass}">
                        <span class="date-number">${day}</span>`;
            
            if (holidays[dateKey]) {
                html += `<div class="event-bar" style="background:#dc3545; font-size:0.7em;">${holidays[dateKey]}</div>`;
            }
                        
            html += `<div class="events-container">`;
            const dayEvents = events[currentCalendar].filter(ev => {
                const start = new Date(ev.startDate); start.setHours(0,0,0,0);
                const end = new Date(ev.endDate); end.setHours(0,0,0,0);
                return currentDate >= start && currentDate <= end;
            }).sort((a,b) => a.id - b.id);
            
            dayEvents.forEach(ev => {
                let displayColor = ev.color;
                if (currentCalendar === 'shared') displayColor = userColors[ev.owner] || ev.color;
                html += `<div class="event-bar" data-id="${ev.id}" style="background:${displayColor}">${ev.title}</div>`;
            });
            html += `</div></td>`;
        }

        const lastDayOfMonth = new Date(year, month - 1, daysInMonth);
        const endDayOfWeek = lastDayOfMonth.getDay();
        for (let i = 1; i < 7 - endDayOfWeek; i++) {
            html += `<td class="other-month"><span class="date-number">${i}</span></td>`;
        }
        html += "</tr></tbody></table>";
        calendarDiv.innerHTML = html;
    };
    
    // 他のJS関数は一切変更なし
    const updateColorButtons = (selectedColor) => {
        modal.colorButtonsDiv.innerHTML = '';
        colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = `btn color-btn ${color === selectedColor ? 'selected' : ''}`;
            btn.style.backgroundColor = color;
            btn.style.width = '30px'; btn.style.height = '30px';
            btn.dataset.color = color;
            modal.colorButtonsDiv.appendChild(btn);
        });
    };
    const openModalForNew = dateKey => {
        currentEventId = null;
        modal.title.value = ""; modal.startDate.value = dateKey; modal.endDate.value = dateKey;
        modal.startTime.value = "09:00"; modal.endTime.value = "10:00"; modal.memo.value = "";
        modal.deleteBtn.style.display = 'none';
        updateColorButtons(colors[0]);
        eventModal.show();
    };
    const openModalForEdit = event => {
        currentEventId = event.id;
        modal.title.value = event.title; modal.startDate.value = event.startDate; modal.endDate.value = event.endDate;
        modal.startTime.value = event.startTime; modal.endTime.value = event.endTime; modal.memo.value = event.memo;
        const canEdit = (event.owner === currentUser) || (currentCalendar === 'shared');
        modal.deleteBtn.style.display = canEdit ? 'inline-block' : 'none';
        modal.saveBtn.disabled = !canEdit;
        updateColorButtons(event.color);
        eventModal.show();
    };
    calendarDiv.addEventListener("click", e => {
        const eventBar = e.target.closest('.event-bar');
        const td = e.target.closest('td[data-date]');
        if (eventBar) {
            if(!eventBar.dataset.id) return;
            const event = events[currentCalendar].find(ev => ev.id === Number(eventBar.dataset.id));
            if (event) openModalForEdit(event);
        } else if (td) {
            const canAddEvent = (currentCalendar === currentUser) || (currentCalendar === 'shared');
            if (canAddEvent) openModalForNew(td.dataset.date);
        }
    });
    modal.colorButtonsDiv.addEventListener('click', e => {
        if (e.target.classList.contains('color-btn')) {
            modal.colorButtonsDiv.querySelector('.selected')?.classList.remove('selected');
            e.target.classList.add('selected');
        }
    });
    modal.saveBtn.addEventListener("click", () => {
        const selectedColor = modal.colorButtonsDiv.querySelector('.selected')?.dataset.color || colors[0];
        const eventData = {
            id: currentEventId || Date.now(), title: modal.title.value.trim(),
            startDate: modal.startDate.value, endDate: modal.endDate.value,
            startTime: modal.startTime.value, endTime: modal.endTime.value,
            memo: modal.memo.value, color: selectedColor, owner: currentUser
        };
        if (!eventData.title) return alert('タイトルを入力してください。');
        if (new Date(eventData.startDate) > new Date(eventData.endDate)) return alert('終了日は開始日以降にしてください。');
        
        if (currentEventId) {
            events.my = events.my.map(ev => ev.id === currentEventId ? eventData : ev);
            events.partner = events.partner.map(ev => ev.id === currentEventId ? eventData : ev);
            events.shared = events.shared.map(ev => ev.id === currentEventId ? eventData : ev);
        } else {
            const calendarToAdd = (currentCalendar === 'shared') ? 'shared' : currentUser;
            events[calendarToAdd].push(eventData);
            if (calendarToAdd !== 'shared') events.shared.push(eventData);
            else events[currentUser].push(eventData);
        }
        saveEvents();
        generateCalendar(currentYear, currentMonth);
        eventModal.hide();
    });
    modal.deleteBtn.addEventListener("click", () => {
        if (!currentEventId) return;
        events.my = events.my.filter(ev => ev.id !== currentEventId);
        events.partner = events.partner.filter(ev => ev.id !== currentEventId);
        events.shared = events.shared.filter(ev => ev.id !== currentEventId);
        saveEvents();
        generateCalendar(currentYear, currentMonth);
        eventModal.hide();
    });
    calendarTabs.addEventListener("click", e => {
        e.preventDefault();
        if (e.target.tagName !== 'A') return;
        calendarTabs.querySelector('.active').classList.remove('active');
        e.target.classList.add('active');
        currentCalendar = e.target.dataset.calendar;
        generateCalendar(currentYear, currentMonth);
    });
    prevBtn.addEventListener("click", () => {
        currentMonth--; if (currentMonth < 1) { currentMonth = 12; currentYear--; }
        generateCalendar(currentYear, currentMonth);
    });
    nextBtn.addEventListener("click", () => {
        currentMonth++; if (currentMonth > 12) { currentMonth = 1; currentYear++; }
        generateCalendar(currentYear, currentMonth);
    });
    todayBtn.addEventListener("click", () => {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth() + 1;
        generateCalendar(currentYear, currentMonth);
    });
    const initCalendar = () => {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth() + 1;
        loadEvents();
        generateCalendar(currentYear, currentMonth);
    };
});