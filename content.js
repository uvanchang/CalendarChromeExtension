function addToCalander() {

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
    //var request = new XMLHttpRequest();
    //request.open("POST", "https://www.googleapis.com/calendar/v3/calendars/calendarId/events");


  }

}


var tempButton = document.createElement("input");
tempButton.id = "calendarButton";
tempButton.align = "middle";
tempButton.setAttribute("type", "button");
tempButton.value = "Add to Google Calendar";
tempButton.className = "button secondary";
tempButton.addEventListener("click", addToCalander);

var scheduleBar = document.getElementById("schedule-addevent-div");
scheduleBar.insertAdjacentElement("beforeend", tempButton);
