chrome.runtime.onInstalled.addListener(function() {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    chrome.storage.sync.set({"token": token});
    console.log("token" + chrome.storage.sync.get(["token"], function(result) {
      console.log(result.token);
    }));
  });
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({url: 'index.html'});
});
