const allowedMap = new Map([['carbink', true],  ['mantine', true],  ['dusknoir', true],  ['cryogonal', true],  ['milotic', true],  ['mr. mime', true],  ['hitmonchan', true],  ['shiinotic', true],  ['beheeyem', true],  ['drampa', true],  ['oinkologne-f', true],  ['dustox', true],  ['sunflora', true],  ['raichu-alola', true],  ['meowstic', true],  ['dachsbun', true],  ['calyrex', true],  ['arbok', true],  ['octillery', true],  ['maushold', true],  ['grafaiai', true],  ['torkoal', true],  ['miltank', true],  ['froslass', true],  ['ariados', true],  ['sableye', true],  ['cherrim', true],  ['simisear', true],  ['salazzle', true],  ['zoroark', true],  ['emolga', true],  ['wobbuffet', true],  ['klawf', true],  ['delcatty', true],  ['drakloak', true]]);

let removedElements = [];
let filterEnabled = false;

chrome.storage.local.get(['toggleState'], function(items) {
    if (items['toggleState']) {
        filterEnabled = items['toggleState'];
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.message === 'filter_on') {
        console.log('filter_on');
        const chart = document.querySelector('div.teambuilder-results');
        filterChart(chart);
    }
    if (request.message === 'filter_off') {
        console.log('filter_off');
        if (removedElements.length > 0) {
            removedElements.forEach(element => {
                element.style.display = 'unset';
            });
            removedElements = [];
        }
    }
});

const observer = new MutationObserver(onMutation);
observer.observe(document, {
    childList: true,
    subtree: true,
});

function onMutation(mutations) {
    for (const { addedNodes } of mutations) {
        for (const node of addedNodes) {
            if (!node.tagName) continue;
            const elements = node.getElementsByClassName('teambuilder-results');
            if (elements[0]) {
                filterChart(elements[0]);
                return;
            }
            const results = node.getElementsByClassName('result');
            if (results) {
                for (const result of results) {
                    const resultChild = result.querySelector('a[data-entry^="pokemon|"]');
                    if (resultChild) {
                        filterChart(results[0].parentElement.parentElement);
                        return;
                    }
                }
            }
        }
    }
}

function filterChart(chart) {
    if (filterEnabled && chart) {
        console.log('Filtering Chart...');
        chart.scrollTop = chart.scrollHeight;
        setTimeout(function() {
            chart.scrollTop = 0;
            removedElements = [];
            filterPokemon(chart);
            filterHeaders(chart);
            unsetHeight(chart);
        }, 50);
    }
}

function filterPokemon(parentElement) {
    const entries = parentElement.querySelectorAll('li.result');
    entries.forEach(entry => {
        const pokemonName = entry.querySelector('a[data-entry^="pokemon|"]')?.getAttribute('data-entry')?.split('|')[1];
        if (pokemonName && !allowedMap.has(pokemonName.toLowerCase())) {
            entry.style.display = 'none';
            removedElements.push(entry);
        }
    });
}

function filterHeaders(parentElement) {
    const results = [...parentElement.querySelectorAll('li.result')];
    const headers = results.map((element) => element.querySelector('h3')).filter(e => e);
    headers.forEach(value => {
        value.parentElement.style.display = 'none';
        removedElements.push(value.parentElement);
    });
}

function unsetHeight(parentElement) {
    const childElement = parentElement.querySelector('ul.utilichart');
    if (childElement) {
        childElement.style = null;
    }
}