function logout() {
  revokeToken();
  chrome.storage.sync.set({
    "token": "notSet",
    "signedIn": false
  }, function() {
    location.reload();
  });
  console.log("Signed out.");
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
      "token": token,
      "signedIn": true
    }, function() {
      location.reload();
    });

    var request = new XMLHttpRequest();
    request.open("GET", "https://www.googleapis.com/calendar/v3/users/me/calendarList");
    request.setRequestHeader("Authorization", "Bearer " + token);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        var calendars = [];
        var data = JSON.parse(this.response);
        console.log(data);
        data.items.forEach((calendar) => {
          calendars.push([calendar.summary, calendar.id]);
        });
        chrome.storage.sync.set({
          "calendars": calendars
        });

      } else {
        console.log("Error in API call.");
      }

    };
    request.send();

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
      var request = new XMLHttpRequest();
      request.open("GET", "https://accounts.google.com/o/oauth2/revoke?token=" +
      current_token);
      request.send();
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
