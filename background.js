chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({
    "token": "notSet",
    "signedIn": false
  });
  chrome.tabs.create({
    url: 'index.html'
  });
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({
    url: 'index.html'
  });
});
