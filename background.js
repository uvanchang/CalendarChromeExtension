chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({
    "token": "notSet"
  });
  chrome.storage.sync.set({
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
