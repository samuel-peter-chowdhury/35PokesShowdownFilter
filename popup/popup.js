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
    const dropDownElement = document.getElementById('input');
    chrome.storage.local.get(['meta'], function(items) {
        dropDownElement.value = items['meta'];
       
    });
    dropDownElement.addEventListener('change', function() {
        chrome.storage.local.set({ 'meta': this.value }, function() {});
    });
});