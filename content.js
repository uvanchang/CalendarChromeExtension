function addToCalander() {

  chrome.storage.sync.get(["token"], function(result) {

    var date = prompt("Enter the Monday of Week 1 date that follows the format.", "11/05/1955");
    var dayTracker = -1;
    var dayCount = -1;
    var jsons = [];

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

    var events = document.getElementsByClassName("fc-event fc-event-vert fc-event-start fc-event-end wr-grid-en");

    console.log(events.length);
    for(i = 0; i < events.length; i++) {
      console.log(i + " " + events.length);

      var eventTitle = events[i].getElementsByClassName("fc-event-inner")[0].getElementsByClassName("fc-event-title")[0];
      var eventTime = events[i].getElementsByClassName("fc-event-inner")[0].getElementsByClassName("fc-event-time")[0];

      // if final schedule
      if(eventTitle.getElementsByTagName("span").length == 0) {
        console.log("final schedule");
        continue;
      }
      var eventName = eventTitle.getElementsByTagName("span")[0].innerHTML;
      var lectureOrDiscussion = eventTitle.getElementsByClassName("calendar-type-location")[0].getElementsByTagName("span")[0].innerHTML;
      if(lectureOrDiscussion === "DI" ) {
        eventName += " Section";
      } else {
        eventName += " Lecture";
      }
      var spanSplit = eventTime.getElementsByTagName("span")[0].innerHTML.trim().split(" ");
      var eventStart = spanSplit[0];
      var eventEnd = spanSplit[2];
      var dayLeftVal = events[i].style.left;
      console.log(dayLeftVal);

      if(eventStart.length == 4) {
        eventStart = "0" + eventStart;
      }
      if(eventEnd.length == 4) {
        eventEnd = "0" + eventEnd;
      }

      var dateFormatStart = new Date(year + "-" + month + "-" + day + 'T' + eventStart + ':00');
      var dateFormatEnd = new Date(year + "-" + month + "-" + day + 'T' + eventEnd + ':00');

      console.log(dayTracker + " " + dayLeftVal);
      if(dayTracker != dayLeftVal) {
        dayTracker = dayLeftVal;
        dayCount++;
        console.log(dayCount);
      }

      dateFormatStart.setDate(dateFormatStart.getDate() + dayCount);
      dateFormatEnd.setDate(dateFormatEnd.getDate() + dayCount);

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
          // 'recurrence': [
          //   'RRULE:FREQ=WEEKLY;COUNT=1'
          // ],
          'reminders': {
            'useDefault': true
          }
        })
      });
      console.log(jsons.length);

      // fetch(url, {
      //   method: "POST",
      //   headers: {
      //     "Authorization": "Bearer " + result.token,
      //     "Content-Type": "application/json"
      //   },
      //   body: JSON.stringify({
      //     'summary': eventName,
      //     'start': {
      //       'dateTime': dateFormatStart.toISOString(),
      //       'timeZone': 'America/Los_Angeles'
      //     },
      //     'end': {
      //       'dateTime': dateFormatEnd.toISOString(),
      //       'timeZone': 'America/Los_Angeles'
      //     },
      //     // 'recurrence': [
      //     //   'RRULE:FREQ=WEEKLY;COUNT=1'
      //     // ],
      //     'reminders': {
      //       'useDefault': true
      //     }
      //   })
      // }).then(
      //   response => response.text()
      // ).then(
      //   function(responseText) {
      //     if(JSON.parse(responseText).hasOwnProperty('error')) {
      //       window.alert("Something went wrong!\nError " + JSON.parse(responseText).error.code
      //         + ": " + JSON.parse(responseText).error.errors[0].reason + "\n" + JSON.parse(responseText).error.message);
      //     }
      //     return responseText;
      //   }
      // ).then(
      //     html => console.log(html)
      // );
    }

    console.log("fetching");

    var url = new URL("https://www.googleapis.com/calendar/v3/calendars/calendarId/events");
    var params = {calendarId: "fvd6tfre52bthv8sgtjs6hib78@group.calendar.google.com"}; // TODO change to primary
    url.search = new URLSearchParams(params);

    let requests = jsons.map(json => fetch(url, json));
    Promise.all(requests).then(
      response => response.text()
    ).then(
      function(responseText) {
        if(JSON.parse(responseText).hasOwnProperty('error')) {
          window.alert("Something went wrong!\nError " + JSON.parse(responseText).error.code
            + ": " + JSON.parse(responseText).error.errors[0].reason + "\n" + JSON.parse(responseText).error.message);
        }
        return responseText;
      }
    ).then(
        html => console.log(html)
    );

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
