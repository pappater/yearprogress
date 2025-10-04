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
    // Month
    const monthPercent = getMonthProgress(now);
    document.getElementById('progress-bar-month').style.width = monthPercent.toFixed(6) + '%';
    document.getElementById('progress-text-month').textContent = monthPercent.toFixed(6) + '% of 100%';
    // Week
    const weekPercent = getWeekProgress(now);
    document.getElementById('progress-bar-week').style.width = weekPercent.toFixed(6) + '%';
    document.getElementById('progress-text-week').textContent = weekPercent.toFixed(6) + '% of 100%';
    // Day
    const dayPercent = getDayProgress(now);
    document.getElementById('progress-bar-day').style.width = dayPercent.toFixed(6) + '%';
    document.getElementById('progress-text-day').textContent = dayPercent.toFixed(6) + '% of 100%';
    // Date info
    document.getElementById('date-info').textContent = `Today: ${now.toLocaleDateString()} | Day ${Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000*60*60*24))} of ${now.getFullYear()}`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setInterval(updateUI, 1000);
});
