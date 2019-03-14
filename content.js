function openDateSelector() {

  chrome.storage.sync.get(["token"], function(result) {

    if (result.token == "notSet") {
      window.alert("You need to sign in to add classes. Click on the extension icon to sign in.");
      return;
    }

    var dateSelector = window.open(chrome.runtime.getURL("DateSelector.html"), "UCSD Class Scheduler", "height=385,width=293,menubar=no,status=no,titlebar=no");

    // keep checking if the calendar window has been closed or not
    var timer = setInterval(function() {
      if(dateSelector.closed) {
        clearInterval(timer);
        addToCalander(result);
      }
    }, 500);

  });

}

function addToCalander(result) {

  chrome.storage.sync.get(["date"], function(savedDate) {
    date = savedDate.date;

    var split = date.split("/");
    var month = split[0];
    var day = split[1];
    var year = split[2];

    var dayTracker = -1;
    var dayCount = -1;
    var jsons = [];
    var dayStrings = {
      "M": "MO",
      "Tu": "TU",
      "W": "WE",
      "Th": "TH",
      "F": "FR"
    };
    var dayVals = {
      "M": 0,
      "Tu": 1,
      "W": 2,
      "Th": 3,
      "F": 4
    };

    var rows = document.getElementsByClassName("ui-widget-content jqgrow ui-row-ltr wr-grid-en");

    for (i = 0; i < rows.length; i++) {

      var cols = rows[i].getElementsByTagName("td");

      var isFinal = false;
      var prevLectureName;

      // to find out what type of row it is
      switch (cols[3].innerHTML) {
        case "FI": // final exam row
        isFinal = true;
        var eventName = prevLectureName + " Final";
        eventName = eventName.replace(/\s\s+/g, ' ');
        break;
        case "DI": // section row
        var eventName = prevLectureName + " Section";
        eventName = eventName.replace(/\s\s+/g, ' ');
        break;
        case "LE": // lecture row
        var eventName = cols[0].innerHTML + " Lecture";
        eventName = eventName.replace(/\s\s+/g, ' ');
        prevLectureName = cols[0].innerHTML;
        break;
        default: // blank or review session
        continue;
        break;
      }

      var spanSplit = cols[8].innerHTML.trim().split("-");
      var eventStart = spanSplit[0];
      var eventEnd = spanSplit[1];

      // TBA cell or Additional Sessions & Meetings
      if (eventStart == null || eventEnd == null) {
        continue;
      }

      // change to 24 hr format
      if (eventStart.includes("p")) {
        eventStart = eventStart.slice(0, -1);
        var hr = parseInt(eventStart.split(":")[0]) + 12;
        // if at 12 PM
        if (hr == 24) {
          hr -= 12;
        }
        eventStart = hr + ":" + eventStart.split(":")[1];
      } else {
        eventStart = eventStart.slice(0, -1);
        if (eventStart.length == 4) {
          eventStart = "0" + eventStart;
        }
      }
      if (eventEnd.includes("p")) {
        eventEnd = eventEnd.slice(0, -1);
        var hr = parseInt(eventEnd.split(":")[0]) + 12;
        // if at 12 PM
        if (hr == 24) {
          hr -= 12;
        }
        eventEnd = hr + ":" + eventEnd.split(":")[1];
      } else {
        eventEnd = eventEnd.slice(0, -1);
        if (eventEnd.length == 4) {
          eventEnd = "0" + eventEnd;
        }
      }

      var location = "";
      if(!cols[9].innerText.includes("TBA") && !cols[10].innerText.includes("TBA")) {
        location = cols[9].innerText + " " + cols[10].innerText;
        location = location.replace(/\s\s+/g, ' ');
      }

      if(isFinal) {

        var finalDate = cols[7].innerHTML.split("/");
        var fMonth = finalDate[0].split(" ")[1];
        var fDay = finalDate[1];
        var fYear = finalDate[2];

        var dateFormatStart = new Date(fYear + "-" + fMonth + "-" + fDay + 'T' + eventStart + ':00');
        var dateFormatEnd = new Date(fYear + "-" + fMonth + "-" + fDay + 'T' + eventEnd + ':00');

        // add one minute to end time of Final Exam
        dateFormatEnd.setTime(dateFormatEnd.getTime() + 60000);

        // if location was not TBA
        if(location.localeCompare("") != 0) {
          jsons.push({
            method: "POST",
            headers: {
              "Authorization": "Bearer " + result.token,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              'summary': eventName,
              'location': location,
              'start': {
                'dateTime': dateFormatStart.toISOString(),
                'timeZone': 'America/Los_Angeles'
              },
              'end': {
                'dateTime': dateFormatEnd.toISOString(),
                'timeZone': 'America/Los_Angeles'
              },
              'reminders': {
                'useDefault': true
              }
            })
          });
        } else { // if location was TBA
          jsons.push({
            method: "POST",
            headers: {
              "Authorization": "Bearer " + result.token,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              'summary': eventName,
              'start': {
                'dateTime': dateFormatStart.toISOString(),
                'timeZone': 'America/Los_Angeles'
              },
              'end': {
                'dateTime': dateFormatEnd.toISOString(),
                'timeZone': 'America/Los_Angeles'
              },
              'reminders': {
                'useDefault': true
              }
            })
          });
        }

        continue;
      }

      var days = cols[7].innerHTML.split(/(?=[A-Z])/);
      var recurrence = "COUNT=" + days.length * 10 + ";BYDAY=";

      for(j = 0; j < days.length; j++) {
        if(j != 0) {
          recurrence += ",";
        }
        recurrence += dayStrings[days[j]];
      }

      var dateFormatStart = new Date(year + "-" + month + "-" + day + 'T' + eventStart + ':00');
      var dateFormatEnd = new Date(year + "-" + month + "-" + day + 'T' + eventEnd + ':00');

      dateFormatStart.setDate(dateFormatStart.getDate() + dayVals[days[0]]);
      dateFormatEnd.setDate(dateFormatEnd.getDate() + dayVals[days[0]]);

      // if location was not TBA
      if(location.localeCompare("") != 0) {
        jsons.push({
          method: "POST",
          headers: {
            "Authorization": "Bearer " + result.token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            'summary': eventName,
            'location': location,
            'start': {
              'dateTime': dateFormatStart.toISOString(),
              'timeZone': 'America/Los_Angeles'
            },
            'end': {
              'dateTime': dateFormatEnd.toISOString(),
              'timeZone': 'America/Los_Angeles'
            },
            'recurrence': [
              'RRULE:FREQ=WEEKLY;' + recurrence
            ],
            'reminders': {
              'useDefault': true
            }
          })
        });
      } else { // if location was TBA
        jsons.push({
          method: "POST",
          headers: {
            "Authorization": "Bearer " + result.token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            'summary': eventName,
            'start': {
              'dateTime': dateFormatStart.toISOString(),
              'timeZone': 'America/Los_Angeles'
            },
            'end': {
              'dateTime': dateFormatEnd.toISOString(),
              'timeZone': 'America/Los_Angeles'
            },
            'recurrence': [
              'RRULE:FREQ=WEEKLY;' + recurrence
            ],
            'reminders': {
              'useDefault': true
            }
          })
        });
      }

    }

    var url = new URL("https://www.googleapis.com/calendar/v3/calendars/calendarId/events");
    // var params = {calendarId: "fvd6tfre52bthv8sgtjs6hib78@group.calendar.google.com"};
    var params = {
      calendarId: "primary"
    };
    url.search = new URLSearchParams(params);

    let requests = jsons.map(json => fetch(url, json));
    Promise.all(requests).then(responses => {
      var requestsTexts = [];
      var errMessage = "";
      for (i = 0; i < requests.length; i++) {
        var cloneResponse = responses[i].text();
        requestsTexts.push(cloneResponse);
        console.log("cloneResponse = " + cloneResponse);
        // if(JSON.parse(cloneResponse).hasOwnProperty('error')) {
        //   errMessage += "Error " + JSON.parse(cloneResponse).error.code + ": " +
        //     JSON.parse(cloneResponse).error.errors[0].reason + "\n" + JSON.parse(cloneResponse).error.message + "\n"
        // }
      }
      if (errMessage != "") {
        window.alert("Something went wrong!\n" + errMessage);
      } else {
        window.alert("Added classes successfully!");
      }
      return requestsTexts;
    });

  });

}

var tempButton = document.createElement("input");
tempButton.id = "calendarButton";
tempButton.align = "middle";
tempButton.setAttribute("type", "button");
tempButton.value = "Add to Google Calendar";
tempButton.className = "button secondary";
tempButton.addEventListener("click", openDateSelector);

var scheduleBar = document.getElementById("schedule-addevent-div");
if (scheduleBar != null) {
  scheduleBar.insertAdjacentElement("beforeEnd", tempButton);
}
