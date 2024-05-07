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
        if (this.checked) {
            chrome.storage.local.set({ 'toggleState': this.checked }, function() {
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, {'message': 'filter_on'});
                });
            });
        } else {
            chrome.storage.local.set({ 'toggleState': this.checked }, function() {
                chrome.tabs.query({currentWindow: true, active: true}, function (tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, {'message': 'filter_off'});
                });
            });
        }
    });
});