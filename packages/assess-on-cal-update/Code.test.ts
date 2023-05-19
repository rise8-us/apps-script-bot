import {forEachEvent} from "./Code";

describe('Code', () => {
  beforeAll(() => {
    // @ts-ignore
    global.PropertiesService = {
      getScriptProperties: jest.fn().mockReturnValue({
        getProperty: jest.fn(),
        setProperty: jest.fn(),
      })
    };

    // @ts-ignore
    global.Calendar = {
      // @ts-ignore
      Events: {
        list: jest.fn(),
      }
    }
  });
  describe('forEachEvent', () => {
    it('should run callback for each event and update syncToken', () => {
      const mockCallback = jest.fn();

      const mockEvents = [
        {summary: 'Event 1'},
        {summary: 'Event 2'},
        {summary: 'Event 3'},
      ];

      // @ts-ignore
      PropertiesService.getScriptProperties().getProperty.mockReturnValueOnce('syncToken1');

      // @ts-ignore
      Calendar.Events.list.mockReturnValueOnce({
        items: mockEvents,
        nextPageToken: 'pageToken1',
      }).mockReturnValueOnce({
        items: [],
        nextSyncToken: 'syncToken2',
      });

      forEachEvent('calendarId1', mockCallback);

      expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('syncToken');
      expect(PropertiesService.getScriptProperties().setProperty).toHaveBeenCalledWith('syncToken', 'syncToken2');

      expect(mockCallback).toHaveBeenCalledTimes(mockEvents.length);
    });

    it('should work correctly when syncToken is not present', () => {
      const mockCallback = jest.fn();

      // @ts-ignore
      PropertiesService.getScriptProperties().getProperty.mockReturnValueOnce(null);

      // @ts-ignore
      Calendar.Events.list.mockReturnValueOnce({
        items: [],
        nextSyncToken: 'syncToken1',
      });

      forEachEvent('calendarId1', mockCallback);

      expect(PropertiesService.getScriptProperties().getProperty).toHaveBeenCalledWith('syncToken');
      expect(Calendar.Events.list).toHaveBeenCalledWith('calendarId1', {maxResults: 2500});
      expect(PropertiesService.getScriptProperties().setProperty).toHaveBeenCalledWith('syncToken', 'syncToken1');

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
});
