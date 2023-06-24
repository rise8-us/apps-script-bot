function createCalendarEventTrigger() {
  ScriptApp.newTrigger("onCreateCalendarEvent")
    .forUserCalendar(Session.getActiveUser().getEmail())
    .onEventUpdated()
    .create();
}

function createCalendarCronJobTrigger() {
  ScriptApp.newTrigger("processNextFifteenMinutesOfEvents")
    .timeBased()
    .everyMinutes(5)
    .create();
}
