function onCreateCalendarEvent(e) {
    forEachEvent(e.calendarId, (event) => {
        if (event.status === 'cancelled') {
            return;
        }
        /**
         * TODO: Implement this function
         */
    });
}
function forEachEvent(calendarId, callback) {
    let options = { maxResults: 2500 };
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
