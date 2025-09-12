 document.addEventListener("DOMContentLoaded", () => {
    // ▼▼▼ ここに、Supabaseで取得したURLとキーを貼り付け ▼▼▼
    const SUPABASE_URL = 'https://kuta93925-afk.github.io/share-calendar/';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kd3lieW5paHh4aHNxeWRhbmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODc4NjAsImV4cCI6MjA3MzI2Mzg2MH0.Rt8BnTOL6yBzSp3D999tno5JalMrOypITYe9_mgb7qI';
    const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const credentials = { "拓己": "my", "心春": "partner" };
    const commonPassword = "1234";
    let currentYear, currentMonth;
    let currentCalendar = "my";
    let currentUser = null;
    let events = { my: [], partner: [], shared: [] };
    let currentEventId = null;

    // --- DOM要素 ---
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
        id: document