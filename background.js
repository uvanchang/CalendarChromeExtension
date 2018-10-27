chrome.runtime.onInstalled.addListener(function() {
  chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
    chrome.storage.local.set({"token": token});
    console.log("token" + chrome.storage.local.get(["token"], function(result) {
      console.log(result.token);
    }));
  });
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({url: 'index.html'});
});
