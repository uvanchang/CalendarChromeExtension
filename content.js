function addToCalander() {

  // if(!window.location.pathname.includes("tabs-1")) {
  //   window.alert(window.location.pathname);
  //   window.alert("You must be in the calendar tab.");
  //   return;
  // }

/*
  var events = document.getElementsByClassName("fc-event-inner");

  for(i = 0; i < events.length; i++) {
    var eventTitle = events[i].getElementsByClassName("fc-event-title")[0];
    var eventTime = events[i].getElementsByClassName("fc-event-time")[0];

    var eventName = eventTitle.getElementsByTagName("span")[0].innerHTML;
    var LectureOrDiscussion = eventTitle.getElementsByClassName("calendar-type-location")[0].getElementsByTagName("span")[0].innerHTML;
    if(LectureOrDiscussion === "DI" ) {
      eventName += " Section";
    } else {
      eventName += " Lecture";
    }
    var spanSplit = eventTime.getElementsByTagName("span")[0].innerHTML.trim().split(" ");
    var eventStart = spanSplit[0];
    var eventEnd = spanSplit[2];
    //var eventLocation =

    // connect to Google Calendar API
    var request = new XMLHttpRequest();
    request.open("POST", "https://www.googleapis.com/calendar/v3/calendars/calendarId/events");
    request.send("calendarId=primary");

*/

  var headers = new Headers({
    "Authorization": "Bearer " + localStorage.getItem("token"),
    "Content-Type": "application/json"
  });

  var url = new URL("https://www.googleapis.com/calendar/v3/calendars/calendarId/events");
  var params = {calendarId: "primary"};
  url.search = new URLSearchParams(params);

  fetch(url, {
    method : "POST",
    headers: headers,
    body: JSON.stringify({
      'summary': 'test event',
      'start': {
        'dateTime': '2018-10-28T09:00:00Z',
        'timeZone': 'America/Los_Angeles'
      },
      'end': {
        'dateTime': '2018-10-28T17:00:00Z',
        'timeZone': 'America/Los_Angeles'
      },
      'recurrence': [
        'RRULE:FREQ=WEEKLY;COUNT=1'
      ],
      'reminders': {
        'useDefault': true
      }
    })
  }).then(
    response => response.text()
  ).then(
    function(responseText) {
      if(JSON.parse(responseText).hasOwnProperty('error')) {
        window.alert("Something went wrong!\nError: " + JSON.parse(responseText).error.errors.reason);
      }
      return responseText;
    }
  ).then(
      html => console.log(html)
  );

}


var tempButton = document.createElement("input");
tempButton.id = "calendarButton";
tempButton.align = "middle";
tempButton.setAttribute("type", "button");
tempButton.value = "Add to Google Calendar";
tempButton.className = "button secondary";
tempButton.addEventListener("click", addToCalander);

var scheduleBar = document.getElementById("schedule-addevent-div");
scheduleBar.insertAdjacentElement("beforeEnd", tempButton);
