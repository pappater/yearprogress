// Milestone storage (in-memory for now)
let milestones = [];
// Track selected milestone index for each bar
const selectedMilestone = {
    year: null,
    month: null,
    week: null,
    day: null,
    custom: null
};
function saveMilestones() {
    localStorage.setItem('milestones', JSON.stringify(milestones));
}
function loadMilestones() {
    const data = localStorage.getItem('milestones');
    if (data) milestones = JSON.parse(data);
}
function addMilestone(date, label) {
    if (!date) return;
    milestones.push({ date, label });
    saveMilestones();
    updateUI();
}
function clearMilestoneMarkers(barId) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    // Remove old markers
    Array.from(bar.querySelectorAll('.milestone-marker, .milestone-marker-label')).forEach(e => e.remove());
}
function renderMilestoneMarkers(barId, rangeStart, rangeEnd, infoId, selKey) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    clearMilestoneMarkers(barId);
    const info = infoId ? document.getElementById(infoId) : null;
    if (info) info.textContent = '';
    let milestoneIdx = 0;
    milestones.forEach((m) => {
        const d = new Date(m.date);
        if (isNaN(d) || d < rangeStart || d > rangeEnd) return;
        const percent = ((d - rangeStart) / (rangeEnd - rangeStart)) * 100;
        const marker = document.createElement('div');
        marker.className = 'milestone-marker';
        marker.style.left = percent + '%';
        marker.tabIndex = 0;
        marker.style.position = 'absolute';
        if (selKey && selectedMilestone[selKey] === milestoneIdx) {
            marker.classList.add('selected');
            if (info) info.textContent = (m.label ? m.label + ' - ' : '') + d.toLocaleDateString();
        }
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            if (info) info.textContent = (m.label ? m.label + ' - ' : '') + d.toLocaleDateString();
            bar.querySelectorAll('.milestone-marker.selected').forEach(el => el.classList.remove('selected'));
            marker.classList.add('selected');
            if (selKey) selectedMilestone[selKey] = milestoneIdx;
        });
        bar.appendChild(marker);
        milestoneIdx++;
    });
    // Hide info and highlight if click outside
    if (info && selKey) {
        document.addEventListener('click', function clearMilestoneInfo(e) {
            if (!bar.contains(e.target)) {
                info.textContent = '';
                bar.querySelectorAll('.milestone-marker.selected').forEach(el => el.classList.remove('selected'));
                selectedMilestone[selKey] = null;
                document.removeEventListener('click', clearMilestoneInfo);
            }
        });
    }
}
function getCustomRangeProgress(startDate, endDate, now = new Date()) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end) || end <= start) return 0;
    if (now < start) return 0;
    if (now > end) return 100;
    const elapsed = now - start;
    const total = end - start;
    return (elapsed / total) * 100;
}

// ui.js - Year Progress UI logic

function getYearProgress(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 1);
    const elapsed = date - start;
    const total = end - start;
    return (elapsed / total) * 100;
}

function getMonthProgress(date = new Date()) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const elapsed = date - start;
    const total = end - start;
    return (elapsed / total) * 100;
}
function getWeekProgress(date = new Date()) {
    // Week starts on Sunday
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const elapsed = date - start;
    const total = end - start;
    return (elapsed / total) * 100;
}

function getDayProgress(date = new Date()) {
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(24,0,0,0);
    const elapsed = date - start;
    const total = end - start;
    return (elapsed / total) * 100;
}



function updateUI() {
    const now = new Date();
    // Year
    const yearPercent = getYearProgress(now);
    document.getElementById('progress-bar-year').style.width = yearPercent.toFixed(6) + '%';
    document.getElementById('progress-text-year').textContent = yearPercent.toFixed(6) + '% of 100%';
    renderMilestoneMarkers('progress-bar-bg-year', new Date(now.getFullYear(), 0, 1), new Date(now.getFullYear() + 1, 0, 1), 'milestone-info-year');
    // Month
    const monthPercent = getMonthProgress(now);
    document.getElementById('progress-bar-month').style.width = monthPercent.toFixed(6) + '%';
    document.getElementById('progress-text-month').textContent = monthPercent.toFixed(6) + '% of 100%';
    renderMilestoneMarkers('progress-bar-bg-month', new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 1), 'milestone-info-month');
    // Week
    const weekPercent = getWeekProgress(now);
    document.getElementById('progress-bar-week').style.width = weekPercent.toFixed(6) + '%';
    document.getElementById('progress-text-week').textContent = weekPercent.toFixed(6) + '% of 100%';
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    renderMilestoneMarkers('progress-bar-bg-week', weekStart, weekEnd, 'milestone-info-week');
    // Day
    const dayPercent = getDayProgress(now);
    document.getElementById('progress-bar-day').style.width = dayPercent.toFixed(6) + '%';
    document.getElementById('progress-text-day').textContent = dayPercent.toFixed(6) + '% of 100%';
    const dayStart = new Date(now);
    dayStart.setHours(0,0,0,0);
    const dayEnd = new Date(now);
    dayEnd.setHours(24,0,0,0);
    renderMilestoneMarkers('progress-bar-bg-day', dayStart, dayEnd, 'milestone-info-day');
    // Custom Range
    const startInput = document.getElementById('custom-start');
    const endInput = document.getElementById('custom-end');
    if (startInput && endInput) {
        const customPercent = getCustomRangeProgress(startInput.value, endInput.value, now);
        document.getElementById('progress-bar-custom').style.width = customPercent.toFixed(6) + '%';
        document.getElementById('progress-text-custom').textContent = customPercent > 0 ? customPercent.toFixed(6) + '% of 100%' : 'Enter valid dates';
        if (startInput.value && endInput.value) {
            renderMilestoneMarkers('progress-bar-bg-custom', new Date(startInput.value), new Date(endInput.value), 'milestone-info-custom');
        } else {
            clearMilestoneMarkers('progress-bar-bg-custom');
        }
    }
    // Date info
    document.getElementById('date-info').textContent = `Today: ${now.toLocaleDateString()} | Day ${Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000*60*60*24))} of ${now.getFullYear()}`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadMilestones();
    updateUI();
    setInterval(updateUI, 1000);
    // Listen for custom range input changes
    const startInput = document.getElementById('custom-start');
    const endInput = document.getElementById('custom-end');
    if (startInput && endInput) {
        startInput.addEventListener('input', updateUI);
        endInput.addEventListener('input', updateUI);
    }
    // Milestone add button
    const addBtn = document.getElementById('add-milestone');
    const dateInput = document.getElementById('milestone-date');
    const labelInput = document.getElementById('milestone-label');
    if (addBtn && dateInput) {
        addBtn.addEventListener('click', () => {
            if (dateInput.value) {
                addMilestone(dateInput.value, labelInput.value);
                dateInput.value = '';
                labelInput.value = '';
            }
        });
    }
});
