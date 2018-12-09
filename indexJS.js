function logout() {
  chrome.storage.sync.set({
    "token": "notSet"
  });
  revokeToken();
  console.log("Signed out.");
  window.alert("You have been signed out.");
  chrome.storage.sync.set({
    "signedIn": false
  }, function() {
    location.reload();
  });
}

function login() {
  chrome.identity.getAuthToken({
    'interactive': true
  }, function(token) {
    if (chrome.runtime.lastError) {
      // if user closes window
      console.log(chrome.runtime.lastError);
      return;
    }
    chrome.storage.sync.set({
      "token": token
    });
    console.log("Signed in.");
    chrome.storage.sync.set({
      "signedIn": true
    }, function() {
      location.reload();
    });
  });
}

function revokeToken() {
  chrome.identity.getAuthToken({
      'interactive': false
    },
    function(current_token) {
      if (!chrome.runtime.lastError) {

        // @corecode_begin removeAndRevokeAuthToken
        // @corecode_begin removeCachedAuthToken
        // Remove the local cached token
        chrome.identity.removeCachedAuthToken({
            token: current_token
          },
          function() {});
        // @corecode_end removeCachedAuthToken

        // Make a request to revoke token in the server
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' +
          current_token);
        xhr.send();
        // @corecode_end removeAndRevokeAuthToken

      }
    });
}

function handleSignInOut() {
  chrome.storage.sync.get(["signedIn"], function(result) {

    if (result.signedIn) {
      logout();
    } else {
      login();
    }

  });
}

document.getElementById("signInOutButton").onclick = handleSignInOut;
chrome.storage.sync.get(["signedIn"], function(result) {

  if (result.signedIn) {
    document.getElementById("signInOutButton").innerHTML = "Sign Out";
  } else {
    document.getElementById("signInOutButton").innerHTML = "Sign In";
  }

});
