document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = 'https://odwybynihxxhsqydanht.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kd3lieW5paHh4aHNxeWRhbmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODc4NjAsImV4cCI6MjA3MzI2Mzg2MH0.Rt8BnTOL6yBzSp3D999tno5JalMrOypITYe9_mgb7qI';
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const anniversary = { month: 7, day: 11, startYear: 2022 };
    const birthdays = [
        { month: 10, day: 2, title: "拓己誕生日" },
        { month: 5, day: 19, title: "心春誕生日" }
    ];
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
    const colors = ['#0d6efd', '#6f42c1', '#28a745', '#ffc107', '#fd7e14', '#dc3545'];
    const userColors = { my: '#28a745', partner: '#fd7e14' };

    let currentYear, currentMonth;
    let currentCalendar = "my";
    let currentUser = null;
    let events = { my: [], partner: [], shared: [] };
    let currentEventId = null;

    const loginContainer = document.getElementById("loginContainer");
    const calendarContainer = document.getElementById("calendarContainer");
    const loginUserInput = document.getElementById("loginUser");
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
        colorButtonsDiv: document.getElementById("colorButtons"),
        isPrivateSwitch: document.getElementById("isPrivateSwitch")
    };
    const viewSwitcher = document.getElementById("viewSwitcher");
    const calendarView = document.getElementById("calendarView");
    const countdownView = document.getElementById("countdownView");
    const usageView = document.getElementById("usageView");
    const calendarHeader = document.getElementById("calendarHeader");

    loginBtn.addEventListener("click", () => {
        const user = loginUserInput.value.trim();
        if (!credentials[user]) {
            loginMsg.textContent = "ユーザー名が違います";
            return;
        }
        currentUser = credentials[user];
        loginContainer.style.display = "none";
        calendarContainer.style.display = "block";
        initCalendar();
    });

    const loadEvents = async () => {
        const { data, error } = await supabaseClient.from('events').select('*');
        if (error) { console.error('Error loading events:', error); return; }
        events = { my: [], partner: [], shared: [] };
        data.forEach(ev => {
            const eventWithId = { ...ev };
            if (ev.owner === 'my') events.my.push(eventWithId);
            if (ev.owner === 'partner') events.partner.push(eventWithId);
            if (!ev.is_private) {
                events.shared.push(eventWithId);
            }
        });
    };
    
    const formatDate = date => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const generateCalendar = (year, month) => {
        calendarTitle.textContent = `${year}年 ${month}月`;
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate();
        const startDayOfWeek = firstDayOfMonth.getDay();
        const today = new Date();
        const todayString = formatDate(today);
        const prevMonthEndDate = new Date(year, month - 1, 0);
        const prevMonthDays = prevMonthEndDate.getDate();
        let html = `<table class="table table-bordered"><thead><tr><th class="sunday">日</th><th>月</th><th>火</th><th>水</th><th>木</th><th>金</th><th class="saturday">土</th></tr></thead><tbody><tr>`;
        for (let i = startDayOfWeek - 1; i >= 0; i--) html += `<td class="other-month"><span class="date-number">${prevMonthDays - i}</span></td>`;
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month - 1, day);
            const dateKey = formatDate(currentDate);
            const dayOfWeek = currentDate.getDay();
            let dayClass = '';
            if (dayOfWeek === 0 || holidays[dateKey]) dayClass = 'sunday';
            else if (dayOfWeek === 6) dayClass = 'saturday';
            const isToday = (dateKey === todayString) ? 'today' : '';
            if (dayOfWeek === 0 && day > 1) html += `</tr><tr>`;
            html += `<td data-date="${dateKey}" class="${isToday} ${dayClass}"><span class="date-number">${day}</span>`;
            if (holidays[dateKey]) html += `<div class="event-bar" style="background:#dc3545; font-size:0.7em;">${holidays[dateKey]}</div>`;
            html += `<div class="events-container">`;
            const dayEvents = events[currentCalendar].filter(ev => {
                const start = new Date(ev.startDate); start.setHours(0,0,0,0);
                const end = new Date(ev.endDate); end.setHours(0,0,0,0);
                return currentDate >= start && currentDate <= end;
            });
            if (currentCalendar === 'shared') {
                birthdays.forEach(birthday => {
                    if (currentDate.getMonth() + 1 === birthday.month && currentDate.getDate() === birthday.day) {
                        dayEvents.push({ id: `birthday-${birthday.month}-${birthday.day}`, title: birthday.title, color: '#e83e8c' });
                    }
                });
                if (currentDate.getMonth() + 1 === anniversary.month && currentDate.getDate() === anniversary.day) {
                    const yearsPassed = year - anniversary.startYear;
                    if (yearsPassed > 0) {
                        dayEvents.push({ id: `anniversary-${yearsPassed}`, title: `${yearsPassed}年記念日`, color: '#ff69b4' });
                    }
                }
            }
            dayEvents.sort((a,b) => a.id - b.id);
            dayEvents.forEach(ev => {
                let displayColor = ev.color;
                const isSpecialEvent = ev.id.toString().startsWith('birthday') || ev.id.toString().startsWith('anniversary');
                if (currentCalendar === 'shared' && !isSpecialEvent) {
                     displayColor = userColors[ev.owner] || ev.color;
                }
                html += `<div class="event-bar" data-id="${ev.id}" style="background:${displayColor}">${ev.title}</div>`;
            });
            html += `</div></td>`;
        }
        const lastDayOfMonth = new Date(year, month - 1, daysInMonth);
        const endDayOfWeek = lastDayOfMonth.getDay();
        for (let i = 1; i < 7 - endDayOfWeek; i++) html += `<td class="other-month"><span class="date-number">${i}</span></td>`;
        html += "</tr></tbody></table>";
        calendarDiv.innerHTML = html;
    };
    
    const generateCountdownView = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const getDaysDiff = (date1, date2) => Math.ceil((date2 - date1) / (1000 * 60 * 60 * 24));
        const getNextDate = (month, day) => {
            const currentYear = today.getFullYear();
            let nextDate = new Date(currentYear, month - 1, day);
            if (today > nextDate) {
                nextDate.setFullYear(currentYear + 1);
            }
            return nextDate;
        };
        const anniversaryStartDate = new Date(anniversary.startYear, anniversary.month - 1, anniversary.day);
        const daysSince = getDaysDiff(anniversaryStartDate, today);
        const nextAnniversaryDate = getNextDate(anniversary.month, anniversary.day);
        const n = nextAnniversaryDate.getFullYear() - anniversary.startYear;
        const daysUntilAnniversary = getDaysDiff(today, nextAnniversaryDate);
        const nextTakumiBd = getNextDate(birthdays[0].month, birthdays[0].day);
        const daysUntilTakumiBd = getDaysDiff(today, nextTakumiBd);
        const nextKoharuBd = getNextDate(birthdays[1].month, birthdays[1].day);
        const daysUntilKoharuBd = getDaysDiff(today, nextKoharuBd);
        const anniversaryText = daysUntilAnniversary === 0 ? '今日です！🎉' : `${daysUntilAnniversary} <span class="fs-5">日</span>`;
        const takumiBdText = daysUntilTakumiBd === 0 ? '今日です！🎉' : `${daysUntilTakumiBd} <span class="fs-5">日</span>`;
        const koharuBdText = daysUntilKoharuBd === 0 ? '今日です！🎉' : `${daysUntilKoharuBd} <span class="fs-5">日</span>`;
        const anniversaryClass = daysUntilAnniversary === 0 ? 'celebrate' : '';
        const takumiBdClass = daysUntilTakumiBd === 0 ? 'celebrate' : '';
        const koharuBdClass = daysUntilKoharuBd === 0 ? 'celebrate' : '';
        countdownView.innerHTML = `
            <div class="w-100" style="max-width: 500px;">
                <h2 class="text-center mb-4">カウントダウン</h2>
                <div class="card text-center mb-3 shadow-sm"><div class="card-body"><h5 class="card-title">付き合った日数</h5><p class="card-text fs-1 fw-bold text-primary">${daysSince} <span class="fs-5">日</span></p></div></div>
                <div class="card text-center mb-3 shadow-sm ${anniversaryClass}"><div class="card-body"><h5 class="card-title">${n}年記念日まであと</h5><p class="card-text fs-1 fw-bold text-success">${anniversaryText}</p></div></div>
                <div class="card text-center mb-3 shadow-sm ${takumiBdClass}"><div class="card-body"><h5 class="card-title">拓己誕生日まであと</h5><p class="card-text fs-1 fw-bold text-info">${takumiBdText}</p></div></div>
                <div class="card text-center mb-3 shadow-sm ${koharuBdClass}"><div class="card-body"><h5 class="card-title">心春誕生日まであと</h5><p class="card-text fs-1 fw-bold text-warning">${koharuBdText}</p></div></div>
            </div>`;
    };

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
        modal.isPrivateSwitch.checked = false;
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
        modal.isPrivateSwitch.checked = event.is_private || false;
        updateColorButtons(event.color);
        eventModal.show();
    };
    calendarDiv.addEventListener("click", e => {
        const eventBar = e.target.closest('.event-bar');
        const td = e.target.closest('td[data-date]');
        if (eventBar) {
            const eventId = eventBar.dataset.id;
            if(!eventId || eventId.startsWith('birthday') || eventId.startsWith('anniversary')) return;
            const event = events[currentCalendar].find(ev => ev.id === Number(eventId));
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
    modal.saveBtn.addEventListener("click", async () => {
        const selectedColor = modal.colorButtonsDiv.querySelector('.selected')?.dataset.color || colors[0];
        const eventData = {
            title: modal.title.value.trim(),
            startDate: modal.startDate.value,
            endDate: modal.endDate.value,
            startTime: modal.startTime.value,
            endTime: modal.endTime.value,
            memo: modal.memo.value,
            color: selectedColor,
            owner: currentUser,
            is_private: modal.isPrivateSwitch.checked
        };
        if (!eventData.title) return alert('タイトルを入力してください。');
        if (new Date(eventData.startDate) > new Date(eventData.endDate)) return alert('終了日は開始日以降にしてください。');
        let error;
        if (currentEventId) {
            ({ error } = await supabaseClient.from('events').update(eventData).eq('id', currentEventId));
        } else {
            ({ error } = await supabaseClient.from('events').insert([eventData]));
        }
        if (error) {
            console.error('Error saving event:', error); alert('保存に失敗しました。');
        } else {
            await initCalendar(); eventModal.hide();
        }
    });
    modal.deleteBtn.addEventListener("click", async () => {
        if (!currentEventId) return;
        if (!confirm('この予定を本当に削除しますか？')) return;
        const { error } = await supabaseClient.from('events').delete().eq('id', currentEventId);
        if (error) {
            console.error('Error deleting event:', error); alert('削除に失敗しました。');
        } else {
            await initCalendar(); eventModal.hide();
        }
    });
    calendarTabs.addEventListener("click", e => {
        e.preventDefault();
        if (e.target.tagName !== 'A') return;
        calendarTabs.querySelector('.active').classList.remove('active');
        e.target.classList.add('active');
        currentCalendar = e.target.dataset.calendar;
        generateCalendar(currentYear, currentMonth);
    });
    viewSwitcher.addEventListener("click", e => {
        e.preventDefault();
        const target = e.target;
        if (target.tagName !== 'A') return;
        viewSwitcher.querySelector('.active').classList.remove('active');
        target.classList.add('active');
        const view = target.dataset.view;
        calendarView.style.display = 'none';
        countdownView.style.display = 'none';
        usageView.style.display = 'none';
        calendarHeader.style.display = 'none';
        if (view === 'calendar') {
            calendarView.style.display = 'block';
            calendarHeader.style.display = 'block';
        } else if (view === 'countdown') {
            countdownView.style.display = 'flex';
            generateCountdownView();
        } else if (view === 'usage') {
            usageView.style.display = 'block';
        }
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
    const initCalendar = async () => {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth() + 1;
        await loadEvents();
        generateCalendar(currentYear, currentMonth);
    };
});