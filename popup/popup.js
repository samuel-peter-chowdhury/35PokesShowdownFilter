const months = new Map([['jan', 1], ['feb', 2], ['mar', 3], ['apr', 4], ['may', 5], ['jun', 6], ['jul', 7], ['aug', 8], ['sep', 9], ['oct', 10], ['nov', 11], ['dec', 12]])
const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const currentDate = new Date();

document.addEventListener("DOMContentLoaded", function() {
    const toggleElement = document.getElementById('toggle-input');
    chrome.storage.local.get(['toggleState'], function(items) {
        if (items['toggleState']) {
            toggleElement.value = items['toggleState'];
            toggleElement.checked = items['toggleState'];
        } else {
            toggleElement.value = false;
            toggleElement.checked = false;
        }
    });
    toggleElement.addEventListener('change', function() {
        chrome.storage.local.set({ 'toggleState': this.checked }, function() {});
    });

    const monthElement = document.getElementById('month-select');
    months.forEach((value, key) => {
        let opt = document.createElement('option');
        opt.value = value;
        opt.innerHTML = key;
        monthElement.appendChild(opt);
    });
    chrome.storage.local.get(['month'], function(items) {
        if (items['month']) {
            monthElement.value = items['month'];
        } else {
            monthElement.value = currentDate.getUTCMonth() + 1;
            chrome.storage.local.set({ 'month': currentDate.getUTCMonth() + 1 }, function() {});
        }
    });
    monthElement.addEventListener('change', function() {
        chrome.storage.local.set({ 'month': this.value }, function() {});
    });

    const yearElement = document.getElementById('year-select');
    years.forEach(y => {
        let opt = document.createElement('option');
        opt.value = y;
        opt.innerHTML = y;
        yearElement.appendChild(opt);
    });
    chrome.storage.local.get(['year'], function(items) {
        if (items['year']) {
            yearElement.value = items['year'];
        } else {
            yearElement.value = currentDate.getUTCFullYear();
            chrome.storage.local.set({ 'year': currentDate.getUTCFullYear() }, function() {});
        }
    });
    yearElement.addEventListener('change', function() {
        chrome.storage.local.set({ 'year': this.value }, function() {});
    });
});