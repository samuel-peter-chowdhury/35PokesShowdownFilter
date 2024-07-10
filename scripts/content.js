let allowedMap = new Map();
const challengeCodePrefix = '/challenge gen9nationaldexag @@@ Z-Move Clause, -Mega, Terastal Clause, Sleep Clause Mod, Forme Clause, -Hidden Power, -Last Respects, -Kings Rock, -Shadow Tag, -Acupressure, -Battle Bond, -Quick Claw, -Razor Fang, Evasion Clause, OHKO Clause, baton pass stat trap clause, -All Pokemon, +';

// Polyfill for browser compatibility
if (typeof browser === 'undefined') {
    var browser = chrome;
}

function getChallengeCode() {
    const pokemonList = Array.from(allowedMap.keys()).join(', +');
    return challengeCodePrefix + pokemonList;
}

// Function to fetch JSON data
function fetchAllowedPokemonData() {
    browser.storage.local.get('35pokes-month').then(monthItems => {
        browser.storage.local.get('35pokes-year').then(yearItems => {
            browser.storage.local.get('35pokes-text').then(textItems => {
                const xhr = new XMLHttpRequest();
                let fileName;
                if (monthItems['35pokes-month'] && yearItems['35pokes-year']) {
                    textSuffix = textItems['35pokes-text'] ? '_' + textItems['35pokes-text'] : '';
                    fileName = 'https://samuel-peter-chowdhury.github.io/35PokesShowdownFilter/dates/' + yearItems['35pokes-year'] + '_' + monthItems['35pokes-month'] + textSuffix + '.json';
                } else {
                    fileName = 'https://samuel-peter-chowdhury.github.io/35PokesShowdownFilter/dates/2024_5.json';
                }
                console.log(fileName);
                xhr.open('GET', fileName, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if (xhr.status === 200) {
                            const data = JSON.parse(xhr.responseText);
                            data.forEach(item => {
                                allowedMap.set(item.toLowerCase(), true);
                            });
                            browser.storage.local.set({ '35pokes-code': getChallengeCode() }, function() {});
                            console.log(allowedMap);
                        } else {
                            alert('Invalid Date');
                        }
                    }
                }
                xhr.send();
            });
        });
    });
}

// Call the function to fetch JSON data
fetchAllowedPokemonData();

let removedElements = [];

const observer = new MutationObserver(onMutation);
browser.storage.local.get(['35pokes-toggleState']).then(items => {
    if (items['35pokes-toggleState']) {
        observer.observe(document, {
            childList: true,
            subtree: true,
        });
    }
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
    if (chart) {
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
