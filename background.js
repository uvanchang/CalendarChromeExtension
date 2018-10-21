chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.set({color: '#3aa757'}, function() {
    console.log("The color is green.");
  });
  chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
    window.localStorage.setItem("token", token);
  });
});

chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.create({url: 'index.html'});
});
