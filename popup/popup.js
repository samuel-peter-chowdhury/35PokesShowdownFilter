// Polyfill for browser compatibility
if (typeof browser === "undefined") globalThis.browser = chrome;

const months = new Map([[1, 'jan'], [2, 'feb'], [3, 'mar'], [4, 'apr'], [5, 'may'], [6, 'jun'], [7, 'jul'], [8, 'aug'], [9, 'sep'], [10, 'oct'], [11, 'nov'], [12, 'dec']]);
const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const currentDate = new Date();

const KEY_TOGGLESTATE = "35pokes-toggleState";
const KEY_MONTH = "35pokes-month";
const KEY_YEAR = "35pokes-year";
const KEY_TEXT = "35pokes-text";
const KEY_LIST = "35pokes-list";

document.addEventListener("DOMContentLoaded", function() {
    const messageContainer = document.getElementById('message-container');

    // Toggle
    const toggleElement = document.getElementById('toggle-input');
    browser.storage.local.get(KEY_TOGGLESTATE).then(items => {
        if (items[KEY_TOGGLESTATE]) {
            toggleElement.value = items[KEY_TOGGLESTATE];
            toggleElement.checked = items[KEY_TOGGLESTATE];
        } else {
            toggleElement.value = false;
            toggleElement.checked = false;
        }
    });
    toggleElement.addEventListener('change', function() {
        browser.storage.local.set({ [KEY_TOGGLESTATE]: this.checked });
    });

    // Month Input
    const monthElement = document.getElementById('month-select');
    months.forEach((value, key) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.innerHTML = value;
        monthElement.appendChild(opt);
    });
    browser.storage.local.get(KEY_MONTH).then(items => {
        if (items[KEY_MONTH]) {
            monthElement.value = items[KEY_MONTH];
        } else {
            monthElement.value = currentDate.getUTCMonth() + 1;
            browser.storage.local.set({ [KEY_MONTH]: currentDate.getUTCMonth() + 1 }).then(fetchAllowedPokemonDataAndSetStorage);
        }
    });
    monthElement.addEventListener('change', function() {
        browser.storage.local.set({ [KEY_MONTH]: Number(this.value) });
        fetchAllowedPokemonDataAndSetStorage().then(showMessage);
    });

    // Year Input
    const yearElement = document.getElementById('year-select');
    years.forEach(y => {
        const opt = document.createElement('option');
        opt.value = y;
        opt.innerHTML = y;
        yearElement.appendChild(opt);
    });
    browser.storage.local.get(KEY_YEAR).then(items => {
        if (items[KEY_YEAR]) {
            yearElement.value = items[KEY_YEAR];
        } else {
            yearElement.value = currentDate.getUTCFullYear();
            browser.storage.local.set({ [KEY_YEAR]: currentDate.getUTCFullYear() }).then(fetchAllowedPokemonDataAndSetStorage);
        }
    });
    yearElement.addEventListener('change', function() {
        browser.storage.local.set({ [KEY_YEAR]: Number(this.value) });
        fetchAllowedPokemonDataAndSetStorage().then(showMessage);
    });

    // Text Input
    const textElement = document.getElementById('text-input');
    browser.storage.local.get(KEY_TEXT).then(items => {
        if (items[KEY_TEXT]) {
            textElement.value = items[KEY_TEXT];
        }
    });
    textElement.addEventListener('change', function() {
        browser.storage.local.set({ [KEY_TEXT]: this.value });
        fetchAllowedPokemonDataAndSetStorage().then(showMessage);
    });

    const buttonElement = document.getElementById('code-button');
    buttonElement.addEventListener('click', function() {
        const challengeCodePrefix = '/challenge gen9nationaldexag @@@ Z-Move Clause, -Mega, Terastal Clause, Sleep Clause Mod, Forme Clause, -Hidden Power, -Last Respects, -Kings Rock, -Shadow Tag, -Acupressure, -Battle Bond, -Quick Claw, -Razor Fang, Evasion Clause, OHKO Clause, baton pass stat trap clause, -All Pokemon, +';
        browser.storage.local.get(KEY_LIST).then(items => {
            if(items[KEY_LIST]) navigator.clipboard.writeText(challengeCodePrefix + items[KEY_LIST].join(', +')).then(() => showMessage('Copied!'));
            else showMessage("This meta doesn't exist yet!");
        });
    });

    // This replaces alert() because alert breaks clipboard functionality on every browser.
    // also alert in popup is unreadable for firefox users.
    function showMessage(msg) {
        const text = document.createElement("span");
        text.className = "message-text";
        text.innerHTML = msg;
        text.style.opacity = 1;
        messageContainer.style.display = "flex";
        messageContainer.appendChild(text);
        setTimeout(() => {
            let fadeout = setInterval(() => {
                text.style.opacity -= 0.1;
                if(text.style.opacity == 0) {
                    messageContainer.removeChild(text);
                    if(messageContainer.childElementCount === 0) messageContainer.style.display = "none";
                    clearInterval(fadeout);
                }
            }, 100);
        }, 5 * 1000);
    }
});

// TODO: any ideas for a shorter name here?
async function fetchAllowedPokemonDataAndSetStorage() {
    // Default metagame in case the storage gets wiped.
    const storageItems = await browser.storage.local.get({
        [KEY_MONTH]: 5,
        [KEY_YEAR]: 2024,
        [KEY_TEXT]: ''
    });
    const urlPrefix = 'https://samuel-peter-chowdhury.github.io/35PokesShowdownFilter/dates/';
    const urlSuffix = storageItems[KEY_TEXT] ? '_' + storageItems[KEY_TEXT] : '';
    const url = urlPrefix + storageItems[KEY_YEAR] + '_' + storageItems[KEY_MONTH] + urlSuffix + '.json';

    let allowedMons = "";
    const response = await fetch(url);
    if(response.ok) allowedMons = await response.json();
    browser.storage.local.set({ [KEY_LIST]: allowedMons });

    const msgPrefix = allowedMons ? "Date set: " : "Meta not found: ";
    const msgSuffix = storageItems[KEY_TEXT] ? " " + storageItems[KEY_TEXT] : "";
    const msg = msgPrefix + months.get(storageItems[KEY_MONTH]) + " " + storageItems[KEY_YEAR] + msgSuffix;
    return msg;
}