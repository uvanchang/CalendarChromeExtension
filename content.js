function addToCalander() {

  chrome.storage.sync.get(["token"], function(result) {
    var date = prompt("Enter the Monday of Week 1 date that follows the format.", "11/05/1955");

    if(date != null) {
      try {
        // if not correct format
        if(date.length != 10) {
          window.alert("The format must be in the form ##/##/####.");
          return;
        }
        var split = date.split("/");
        var month = split[0];
        var day = split[1];
        var year = split[2];

        // to test if it is a real date
        (new Date(year + "-" + month + "-" + day + 'T01:00:00')).toISOString();
      } catch (err) {
        window.alert("The format must be in the form ##/##/####.");
        return;
      }
    } else {
      window.alert("The format must be in the form ##/##/####.");
      return;
    }

    var dayTracker = -1;
    var dayCount = -1;
    var jsons = [];
    var dayVals = {
      "M": 0,
      "Tu": 1,
      "W": 2,
      "Th": 3,
      "F": 4
    }

    var rows = document.getElementsByClassName("ui-widget-content jqgrow ui-row-ltr wr-grid-en");

    for(i = 0; i < rows.length; i++) {

      var cols = rows[i].getElementsByTagName("td");

      // to find out what type of row it is
      switch(cols[1].innerHTML) {
        case "Final Exam": // final exam row
          continue;
          break;
        case " ": // section row
          var eventName = rows[i - 1].getElementsByTagName("td")[0].innerHTML + " Section";
          break;
        default: // lecture row
          var eventName = cols[0].innerHTML + " Lecture";
      }

      var spanSplit = cols[8].innerHTML.trim().split("-");
      var eventStart = spanSplit[0];
      var eventEnd = spanSplit[1];

      // TBA cell or Additional Sessions & Meetings
      if(eventStart == null || eventEnd == null) {
        continue;
      }

      // change to 24 hr format
      if(eventStart.includes("p")) {
        eventStart = eventStart.slice(0, -1);
        var hr = parseInt(eventStart.split(":")[0]) + 12;
        // if at 12 PM
        if(hr == 24) {
          hr -= 12;
        }
        eventStart = hr + ":" + eventStart.split(":")[1];
      } else {
        eventStart = eventStart.slice(0, -1);
        if(eventStart.length == 4) {
          eventStart = "0" + eventStart;
        }
      }
      if(eventEnd.includes("p")) {
        eventEnd = eventEnd.slice(0, -1);
        var hr = parseInt(eventEnd.split(":")[0]) + 12;
        // if at 12 PM
        if(hr == 24) {
          hr -= 12;
        }
        eventEnd = hr + ":" + eventEnd.split(":")[1];
      } else {
        eventEnd = eventEnd.slice(0, -1);
        if(eventEnd.length == 4) {
          eventEnd = "0" + eventEnd;
        }
      }

      var days = cols[7].innerHTML.split(/(?=[A-Z])/);

      for(j = 0; j < days.length; j++) {

        var dateFormatStart = new Date(year + "-" + month + "-" + day + 'T' + eventStart + ':00');
        var dateFormatEnd = new Date(year + "-" + month + "-" + day + 'T' + eventEnd + ':00');

        dateFormatStart.setDate(dateFormatStart.getDate() + dayVals[days[j]]);
        dateFormatEnd.setDate(dateFormatEnd.getDate() + dayVals[days[j]]);

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
              'RRULE:FREQ=WEEKLY;COUNT=10'
            ],
            'reminders': {
              'useDefault': true
            }
          })
        });

      }

    }

    var url = new URL("https://www.googleapis.com/calendar/v3/calendars/calendarId/events");
    //var params = {calendarId: "fvd6tfre52bthv8sgtjs6hib78@group.calendar.google.com"}; // TODO change to primary
    var params = {calendarId: "primary"};
    url.search = new URLSearchParams(params);

    let requests = jsons.map(json => fetch(url, json));
    Promise.all(requests).then(responses => {
      var requestsTexts = [];
      var errMessage = "";
      for(i = 0; i < requests.length; i++) {
        var cloneResponse = responses[i].text();
        requestsTexts.push(cloneResponse);
        console.log("cloneResponse = " + cloneResponse);
        // if(JSON.parse(cloneResponse).hasOwnProperty('error')) {
        //   errMessage += "Error " + JSON.parse(cloneResponse).error.code + ": " +
        //     JSON.parse(cloneResponse).error.errors[0].reason + "\n" + JSON.parse(cloneResponse).error.message + "\n"
        // }
      }
      if(errMessage != "") {
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
tempButton.addEventListener("click", addToCalander);

var scheduleBar = document.getElementById("schedule-addevent-div");
if(scheduleBar != null) {
  scheduleBar.insertAdjacentElement("beforeEnd", tempButton);
}
