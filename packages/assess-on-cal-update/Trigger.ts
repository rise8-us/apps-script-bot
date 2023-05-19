function createCalendarEventTrigger() {
  ScriptApp.newTrigger('onCreateCalendarEvent')
  .forUserCalendar(Session.getActiveUser().getEmail())
  .onEventUpdated()
  .create();
}
