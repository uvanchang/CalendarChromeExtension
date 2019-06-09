function logout() {
  revokeToken();
  chrome.storage.sync.set({
    "token": "notSet",
    "btnSignIn": true
  }, function() {
    document.getElementById("signInOutButton").innerHTML = "Sign In";
  });
  console.log("Signed out.");
}

function login() {
  chrome.identity.getAuthToken({
    'interactive': true
  }, function(token) {
    if (chrome.runtime.lastError) {
      // if user closes window
      console.log("Closed window");
      return;
    }
    chrome.storage.sync.set({
      "token": token
    }, function() {

      var request = new XMLHttpRequest();
      request.open("GET", "https://www.googleapis.com/calendar/v3/users/me/calendarList");
      request.setRequestHeader("Authorization", "Bearer " + token);
      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          var calendars = [];
          var data = JSON.parse(this.response);

          data.items.forEach((calendar) => {
            calendars.push([calendar.summary, calendar.id]);
          });
          chrome.storage.sync.set({
            "calendars": calendars,
            "btnSignIn": false
          });
          console.log("Request status: " + request.status);

        } else {
          console.log("Error in API call.");
        }

      };
      request.send();

      document.getElementById("signInOutButton").innerHTML = "Sign Out";

      console.log("Signed in.");
    });
  });
}

function revokeToken() {
  chrome.identity.getAuthToken({
    'interactive': false
  },
  function(current_token) {
    if (!chrome.runtime.lastError) {

      chrome.identity.removeCachedAuthToken({
        token: current_token
      },
      function() {});

      var request = new XMLHttpRequest();
      request.open("GET", "https://accounts.google.com/o/oauth2/revoke?token=" + current_token);
      request.onload = function() {
        console.log("Request Status: " + request.status);
      }
      request.send();

    }
  });
}

function handleSignInOut() {
  chrome.storage.sync.get(["btnSignIn"], function(result) {
    if (!result.btnSignIn) {
      logout();
    } else {
      login();
    }
  });

}

document.getElementById("signInOutButton").onclick = handleSignInOut;
window.onload=function()
 {
      chrome.storage.sync.get(["btnSignIn"], function(result) {
        if(!result.btnSignIn) {
          document.getElementById("signInOutButton").innerHTML = "Sign Out";
        } else {
          document.getElementById("signInOutButton").innerHTML = "Sign In";
        }
      });
 }
