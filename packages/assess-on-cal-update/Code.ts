export function onCreateCalendarEvent(e: GoogleAppsScript.Events.CalendarEventUpdated) {
  forEachEvent(e.calendarId, (event: GoogleAppsScript.Calendar.Schema.Event) => {
    if (event.status === 'cancelled') {
      return;
    }
    /**
     * TODO: Implement this function
     */
  });
}

export function forEachEvent(calendarId: string, callback: (event: GoogleAppsScript.Calendar.Schema.Event) => void) {
  let options: { maxResults: number, syncToken?: string, pageToken?: string } = {maxResults: 2500}

  const syncToken = PropertiesService.getScriptProperties().getProperty('syncToken');

  if (syncToken) {
    options.syncToken = syncToken;
  }

  let eventList;
  let pageToken;

  do {
    if (pageToken) {
      options.pageToken = pageToken;
    }

    eventList = Calendar.Events.list(calendarId, options);

    eventList.items.forEach(callback);

    pageToken = eventList.nextPageToken;
  } while (pageToken);

  PropertiesService.getScriptProperties().setProperty('syncToken', eventList.nextSyncToken);
}
