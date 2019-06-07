$(document).ready(function() {
  $("#calendar").datepicker({
    format: 'mm/dd/yyyy',
    todayHighlight: true,
    autoclose: true
  });
  $('#calendar').on('changeDate', function(e) {
    $("#my_hidden_input").val(e.format("mm/dd/yyyy"));
  });
  chrome.storage.sync.get(["calendars"], function(calendars) {
    calendars.calendars.forEach((calendarPair) => {
      var sel = document.getElementById("calendars");
      var opt = document.createElement('option');
      opt.appendChild( document.createTextNode(calendarPair[0]));
      opt.value = calendarPair[1];
      sel.appendChild(opt);
    });
  });
});

document.getElementById("button").addEventListener("click", function() {
  if(document.getElementById("my_hidden_input").value == "") {
    window.alert("You have not selected a date. Click on the first Monday of Week 1 date.");
  } else {
    chrome.storage.sync.set({
      "date": document.getElementById("my_hidden_input").value,
      "calendar": document.getElementById("calendars").value
    });
    window.close();
  }
});
