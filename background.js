chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({
    "token": "notSet",
    "btnSignIn": true
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
