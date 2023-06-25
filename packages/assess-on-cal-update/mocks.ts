// @ts-ignore
global.PropertiesService = {
  getScriptProperties: jest.fn().mockReturnValue({
    getProperty: jest.fn(),
    setProperty: jest.fn(),
  }),
};

// @ts-ignore
global.Calendar = {
  // @ts-ignore
  Events: {
    list: jest.fn(),
  },
};

// @ts-ignore
global.DriveApp = {
  getFileById: jest.fn(),
  getRootFolder: jest.fn().mockReturnValue({
    createFolder: jest.fn(),
    getFilesByName: jest.fn(),
    getFoldersByName: jest.fn(),
  }),
};

// @ts-ignore
global.SpreadsheetApp = {
  open: jest.fn(),
  create: jest.fn(),
};
