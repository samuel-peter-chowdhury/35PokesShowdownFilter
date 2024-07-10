// Polyfill for browser compatibility
if (typeof browser === 'undefined') {
    var browser = chrome;
}

const months = new Map([['jan', 1], ['feb', 2], ['mar', 3], ['apr', 4], ['may', 5], ['jun', 6], ['jul', 7], ['aug', 8], ['sep', 9], ['oct', 10], ['nov', 11], ['dec', 12]])
const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const currentDate = new Date();

document.addEventListener("DOMContentLoaded", function() {
    const toggleElement = document.getElementById('toggle-input');
    browser.storage.local.get(['35pokes-toggleState'], function(items) {
        if (items['35pokes-toggleState']) {
            toggleElement.value = items['35pokes-toggleState'];
            toggleElement.checked = items['35pokes-toggleState'];
        } else {
            toggleElement.value = false;
            toggleElement.checked = false;
        }
    });
    toggleElement.addEventListener('change', function() {
        browser.storage.local.set({ '35pokes-toggleState': this.checked }, function() {});
    });

    const monthElement = document.getElementById('month-select');
    months.forEach((value, key) => {
        let opt = document.createElement('option');
        opt.value = value;
        opt.innerHTML = key;
        monthElement.appendChild(opt);
    });
    browser.storage.local.get(['35pokes-month'], function(items) {
        if (items['35pokes-month']) {
            monthElement.value = items['35pokes-month'];
        } else {
            monthElement.value = currentDate.getUTCMonth() + 1;
            browser.storage.local.set({ '35pokes-month': currentDate.getUTCMonth() + 1 }, function() {});
        }
    });
    monthElement.addEventListener('change', function() {
        browser.storage.local.set({ '35pokes-month': this.value }, function() {});
    });

    const yearElement = document.getElementById('year-select');
    years.forEach(y => {
        let opt = document.createElement('option');
        opt.value = y;
        opt.innerHTML = y;
        yearElement.appendChild(opt);
    });
    browser.storage.local.get(['35pokes-year'], function(items) {
        if (items['35pokes-year']) {
            yearElement.value = items['35pokes-year'];
        } else {
            yearElement.value = currentDate.getUTCFullYear();
            browser.storage.local.set({ '35pokes-year': currentDate.getUTCFullYear() }, function() {});
        }
    });
    yearElement.addEventListener('change', function() {
        browser.storage.local.set({ '35pokes-year': this.value }, function() {});
    });

    const textElement = document.getElementById('text-input');
    browser.storage.local.get(['35pokes-text'], function(items) {
        if (items['35pokes-text']) {
            textElement.value = items['35pokes-text'];
        } else {
            textElement.value = '';
            browser.storage.local.set({ '35pokes-text': '' }, function() {});
        }
    });
    textElement.addEventListener('change', function() {
        browser.storage.local.set({ '35pokes-text': this.value }, function() {});
    });

    const buttonElement = document.getElementById('code-button');
    buttonElement.addEventListener('click', function() {
        browser.storage.local.get(['35pokes-code'], function(items) {
            if (items['35pokes-code']) {
                navigator.clipboard.writeText(items['35pokes-code']);
                alert('Challenge code copied to clipboard.');
            } else {
                alert('No challenge code was found, please reload the page.');
            }
        });
    });
});
