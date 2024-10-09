// Polyfill for browser compatibility
if (typeof browser === "undefined") globalThis.browser = chrome;

let metaText = '';
const allowedMap = new Map();
const removedElements = [];
const observer = new MutationObserver(onMutation);

const KEY_TOGGLESTATE = "35pokes-toggleState";
const KEY_TEXT = "35pokes-text";
const KEY_LIST = "35pokes-list";
const KEY_MONTH = "35pokes-month";

// Receive settings as the user changes them.
browser.storage.local.onChanged.addListener(items => {
    console.log(items);
    if(items[KEY_LIST]) {
        console.log(1);
        allowedMap.clear();
        if(items[KEY_LIST].newValue) items[KEY_LIST].newValue.forEach(item => allowedMap.set(item.toLowerCase()));
    }
    else if(items[KEY_TOGGLESTATE]) {
        console.log(2);
        if(items[KEY_TOGGLESTATE].newValue) observer.observe(document, {
            childList: true,
            subtree: true,
        });
        else observer.disconnect();
    }
    else if(items[KEY_TEXT]) {
        console.log(3);
        metaText = items[KEY_TEXT].newValue;
    }
});

// Receive settings on load from last time if present, otherwise load defaults.
browser.storage.local.get({
    [KEY_TOGGLESTATE]: false,
    [KEY_TEXT]: '',
    [KEY_LIST]: '',
    [KEY_MONTH]: ''
}).then(data => {
    if(data[KEY_TEXT]) metaText = data[KEY_TEXT];
    if(data[KEY_LIST]) data[KEY_LIST].forEach(item => allowedMap.set(item.toLowerCase()));
    else if(data[KEY_MONTH]) {
        console.log("35Pokes Filter handling update to version 1.3");
        // make the user open popup which populates KEY_LIST
        browser.storage.local.set({
            [KEY_MONTH]: '',
            [KEY_TOGGLESTATE]: false
        });
        // might as well do this now, save a few lines in service worker later
        browser.storage.local.remove("35pokes-code");
        return;
    }
    if(data[KEY_TOGGLESTATE]) observer.observe(document, {
        childList: true,
        subtree: true,
    });
});

function onMutation(mutations) {
    if(allowedMap.size === 0) return;

    for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
            if(!node.tagName) continue;
            const elements = node.getElementsByClassName('teambuilder-results')[0];
            if(elements) {
                console.log('35Pokes Filtering Chart... (teambuilder-results)');
                filterChart(elements);
                return;
            }
            const results = node.getElementsByClassName('result')[0];
            if(results) {
                console.log('35Pokes Filtering Chart... (result)');
                filterChart(results.parentElement.parentElement);
                return;
            }
        }
    }
}

function filterChart(chart) {
    if (!chart) return; 

    chart.scrollTop = chart.scrollHeight;
    
    // Mobile support - previous statement does nothing on mobile view.
    if(chart.scrollTop === 0) {
        let morebtn = document.getElementsByClassName('result more');
        while(morebtn.length) morebtn[0].firstChild.firstChild.click();
    }

    setTimeout(function() {
        chart.scrollTop = 0;
        removedElements.length = 0;

        let chartType = filterHeaders(chart);
        filterEntries(chart, chartType);
        unsetHeight(chart);
    }, 50);
}

function filterHeaders(parentElement) {
    const results = [...parentElement.querySelectorAll('li.result')];
    const headers = results.map((element) => element.querySelector('h3')).filter(e => e);
    for(let value of headers) {
        // "EVs" and "Details" don't quite work for this.
        if(value.innerHTML === "Popular items") return "Items";
        if(value.innerHTML === "Abilities") return "Abilities";
        if(value.innerHTML === "Moves") return "Moves";
        value.parentElement.style.display = 'none';
        removedElements.push(value.parentElement);
    }
    return "Pokemon";
}

function filterEntries(parentElement, chartType) {
    const entries = parentElement.querySelectorAll('li.result');
    if(chartType === "Pokemon") entries.forEach(entry => {
        const pokemonName = entry.querySelector('a[data-entry^="pokemon|"]')?.getAttribute('data-entry')?.split('|')[1];
        if (pokemonName && !allowedMap.has(pokemonName.toLowerCase())) {
            entry.style.display = 'none';
            removedElements.push(entry);
        }
    });
    // Don't filter out hidden power for old gens.
    else if(chartType === "Moves") if(!/^(RBY|GSC|ADV|BW|ORAS|SM)$/.test(metaText)) entries.forEach(entry => {
        const moveName = entry.querySelector('a[data-entry^="move|"]')?.getAttribute('data-entry')?.split('|')[1];
        if(moveName && /Hidden Power/.test(moveName)) {
            entry.style.display = 'none';
            removedElements.push(entry);
        }
    });
}

function unsetHeight(parentElement) {
    const childElement = parentElement.querySelector('ul.utilichart');
    if (childElement) {
        childElement.style = null;
    }
}