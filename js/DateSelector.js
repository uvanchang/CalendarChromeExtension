$(document).ready(function() {
  $("#calendar").datepicker({
    format: 'mm/dd/yyyy',
    todayHighlight: true,
    autoclose: true
  });
  $('#calendar').on('changeDate', function(e) {
    $("#my_hidden_input").val(e.format("mm/dd/yyyy"));
  });
});

document.getElementById("button").addEventListener("click", function() {
  chrome.storage.sync.set({
    "date": document.getElementById("my_hidden_input").value
  });
  window.close();
});
