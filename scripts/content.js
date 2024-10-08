// Polyfill for browser compatibility
if (typeof browser === "undefined") globalThis.browser = chrome;

let metaText;
const allowedMap = new Map();
const removedElements = [];
const observer = new MutationObserver(onMutation);

// Receive settings as the user changes them.
browser.runtime.onMessage.addListener((message) => {
    // Toggle state changed
    if(typeof(message.toggleSet) === "boolean") {
        if(message.toggleSet) observer.observe(document, {
            childList: true,
            subtree: true,
        });
        else observer.disconnect();
        return;
    }

    // Selected meta changed
    allowedMap.clear();
    if(message.list) message.list.forEach(item => allowedMap.set(item.toLowerCase()));
    metaText = message.text;
});

// Receive settings on load from last time if present, otherwise load defaults.
browser.storage.local.get({
    '35pokes-toggleState': false,
    '35pokes-list': [],
    '35pokes-text': ''
}).then(data => {
    data['35pokes-list'].forEach(item => allowedMap.set(item.toLowerCase()));
    metaText = data['35pokes-text'];
    if(data['35pokes-toggleState']) observer.observe(document, {
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