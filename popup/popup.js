// Polyfill for browser compatibility
if (typeof browser === "undefined") globalThis.browser = chrome;

const months = new Map([['jan', 1], ['feb', 2], ['mar', 3], ['apr', 4], ['may', 5], ['jun', 6], ['jul', 7], ['aug', 8], ['sep', 9], ['oct', 10], ['nov', 11], ['dec', 12]]);
const years = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
const currentDate = new Date();

document.addEventListener("DOMContentLoaded", function() {
    const messageContainer = document.getElementById('message-container');

    // Toggle
    const toggleElement = document.getElementById('toggle-input');
    browser.storage.local.get(['35pokes-toggleState']).then(items => {
        if (items['35pokes-toggleState']) {
            toggleElement.value = items['35pokes-toggleState'];
            toggleElement.checked = items['35pokes-toggleState'];
        } else {
            toggleElement.value = false;
            toggleElement.checked = false;
        }
    });
    toggleElement.addEventListener('change', function() {
        browser.storage.local.set({ '35pokes-toggleState': this.checked });
        messageTabs({ toggleSet: this.checked });
        fetchAllowedPokemonDataAndSetStorage().then(onPopupActivity); // remove this for 1.4
    });

    // Month Input
    const monthElement = document.getElementById('month-select');
    months.forEach((value, key) => {
        let opt = document.createElement('option');
        opt.value = value;
        opt.innerHTML = key;
        monthElement.appendChild(opt);
    });
    browser.storage.local.get(['35pokes-month']).then(items => {
        if (items['35pokes-month']) {
            monthElement.value = items['35pokes-month'];
        } else {
            monthElement.value = currentDate.getUTCMonth() + 1;
            browser.storage.local.set({ '35pokes-month': currentDate.getUTCMonth() + 1 });
        }
    });
    monthElement.addEventListener('change', function() {
        browser.storage.local.set({ '35pokes-month': Number(this.value) });
        fetchAllowedPokemonDataAndSetStorage().then(onPopupActivity);
    });

    // Year Input
    const yearElement = document.getElementById('year-select');
    years.forEach(y => {
        let opt = document.createElement('option');
        opt.value = y;
        opt.innerHTML = y;
        yearElement.appendChild(opt);
    });
    browser.storage.local.get(['35pokes-year']).then(items => {
        if (items['35pokes-year']) {
            yearElement.value = items['35pokes-year'];
        } else {
            yearElement.value = currentDate.getUTCFullYear();
            browser.storage.local.set({ '35pokes-year': currentDate.getUTCFullYear() });
        }
    });
    yearElement.addEventListener('change', function() {
        browser.storage.local.set({ '35pokes-year': Number(this.value) });
        fetchAllowedPokemonDataAndSetStorage().then(onPopupActivity);
    });

    // Text Input
    const textElement = document.getElementById('text-input');
    browser.storage.local.get(['35pokes-text']).then(items => {
        if (items['35pokes-text']) {
            textElement.value = items['35pokes-text'];
        } else {
            textElement.value = '';
            browser.storage.local.set({ '35pokes-text': '' });
        }
    });
    textElement.addEventListener('change', function() {
        browser.storage.local.set({ '35pokes-text': this.value });
        fetchAllowedPokemonDataAndSetStorage().then(onPopupActivity);
    });

    const buttonElement = document.getElementById('code-button');
    buttonElement.addEventListener('click', function() {
        const challengeCodePrefix = '/challenge gen9nationaldexag @@@ Z-Move Clause, -Mega, Terastal Clause, Sleep Clause Mod, Forme Clause, -Hidden Power, -Last Respects, -Kings Rock, -Shadow Tag, -Acupressure, -Battle Bond, -Quick Claw, -Razor Fang, Evasion Clause, OHKO Clause, baton pass stat trap clause, -All Pokemon, +';
        browser.storage.local.get('35pokes-list').then(items => {
            if(items['35pokes-list']) navigator.clipboard.writeText(challengeCodePrefix + items['35pokes-list'].join(', +')).then(() => showMessage('Copied!'));
            else showMessage("This meta doesn't exist yet!");
        });
    });

    function onPopupActivity(result) {
        let textPrefix = result.list ? "Meta set to:<br>" : "Meta not found:<br>";
        let textSuffix = result.text ? " " + result.text : "";
        showMessage(textPrefix + result.month + " " + result.year + textSuffix);
        messageTabs(result);
    }

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

async function fetchAllowedPokemonDataAndSetStorage() {
    // Default metagame in case the storage gets wiped.
    let storageItems = await browser.storage.local.get({
        '35pokes-month': 5,
        '35pokes-year': 2024,
        '35pokes-text': ''
    });
    let textPrefix = 'https://samuel-peter-chowdhury.github.io/35PokesShowdownFilter/dates/';
    let textSuffix = storageItems['35pokes-text'] ? '_' + storageItems['35pokes-text'] : '';
    let fileName = textPrefix + storageItems['35pokes-year'] + '_' + storageItems['35pokes-month'] + textSuffix + '.json';

    let allowedMons = "";
    let response = await fetch(fileName);
    if(response.ok) allowedMons = await response.json();
    browser.storage.local.set({ '35pokes-list': allowedMons });
    return {
        month: storageItems['35pokes-month'],
        year: storageItems['35pokes-year'],
        text: storageItems['35pokes-text'],
        list: allowedMons
    };
}

function messageTabs(data) {
    browser.tabs.query({
        url: "https://play.pokemonshowdown.com/*",
        discarded: false
    }).then(psTabs => {
        psTabs.forEach(tab => {
            browser.tabs.sendMessage(tab.id, data);
        });
    });
}