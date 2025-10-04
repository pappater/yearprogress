// ui.js - Year Progress UI logic
function getYearProgress(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 1);
    const end = new Date(date.getFullYear() + 1, 0, 1);
    const elapsed = date - start;
    const total = end - start;
    return (elapsed / total) * 100;
}

function updateUI() {
    const now = new Date();
    const percent = getYearProgress(now);
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const dateInfo = document.getElementById('date-info');

    progressBar.style.width = percent.toFixed(6) + '%';
    progressText.textContent = percent.toFixed(6) + '% of 100%';
    dateInfo.textContent = `Today: ${now.toLocaleDateString()} | Day ${Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (1000*60*60*24))} of ${now.getFullYear()}`;
}

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    setInterval(updateUI, 1000);
});
