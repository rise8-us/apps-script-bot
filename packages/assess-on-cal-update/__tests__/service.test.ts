import {
  findOrCreateProjectFolder,
  findOrCreateSheet,
  findProjectFolder,
  findSheet,
} from "../Code";

describe("Code", () => {
  describe("findProjectFolder", () => {
    it("should return null if folder not found", () => {
      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        next: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      });

      expect(findProjectFolder()).toBe(null);
    });

    it("should return folder if found", () => {
      const mockFolder = { id: "folderId1" };

      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        // @ts-ignore
        next: jest.fn().mockReturnValueOnce(mockFolder),
      });

      expect(findProjectFolder()).toBe(mockFolder);
    });
  });

  describe("findOrCreateProjectFolder", () => {
    it("should return existing folder if found", () => {
      const mockFolder = { id: "folderId1" };

      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        next: jest.fn().mockReturnValueOnce(mockFolder),
      });

      expect(findOrCreateProjectFolder()).toBe(mockFolder);
    });

    it("should create folder if not found", () => {
      const mockFolder = { id: "folderId1" };

      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        next: jest.fn().mockImplementationOnce(() => {
          throw new Error();
        }),
      });

      // @ts-ignore
      DriveApp.getRootFolder().createFolder.mockReturnValueOnce(mockFolder);

      expect(findOrCreateProjectFolder()).toBe(mockFolder);
    });
  });

  describe("findSheet", () => {
    it("should return null if root folder not found", () => {
      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        next: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      });

      expect(findSheet("name1")).toBe(null);
    });

    it("should return null if file not found", () => {
      const mockFolder = {
        id: "folderId1",
        getFilesByName: jest.fn(),
      };

      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        next: jest.fn().mockReturnValueOnce(mockFolder),
      });

      // @ts-ignore
      mockFolder.getFilesByName.mockReturnValueOnce({
        next: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      });

      expect(findSheet("name1")).toBe(null);
    });

    it("should return sheet if found", () => {
      const mockFolder = {
        id: "folderId1",
        getFilesByName: jest.fn(),
      };
      const mockFile = {
        id: "fileId1",
      };
      const mockSheet = {
        id: "sheetId1",
      };

      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        next: jest.fn().mockReturnValueOnce(mockFolder),
      });

      // @ts-ignore
      mockFolder.getFilesByName.mockReturnValueOnce({
        next: jest.fn().mockReturnValueOnce(mockFile),
      });

      // @ts-ignore
      SpreadsheetApp.open.mockReturnValueOnce(mockSheet);

      expect(findSheet("name1")).toBe(mockSheet);
    });
  });

  describe("findOrCreateSheet", () => {
    it("should return existing sheet if found", () => {
      const mockFolder = {
        id: "folderId1",
        getFilesByName: jest.fn(),
        addFile: jest.fn(),
      };
      const mockFile = {
        id: "fileId1",
      };
      const mockSheet = {
        id: "sheetId1",
      };

      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        next: jest.fn().mockReturnValueOnce(mockFolder),
      });

      // @ts-ignore
      mockFolder.getFilesByName.mockReturnValueOnce({
        next: jest.fn().mockReturnValueOnce(mockFile),
      });

      // @ts-ignore
      SpreadsheetApp.open.mockReturnValueOnce(mockSheet);

      expect(findOrCreateSheet("name1", [])).toBe(mockSheet);
    });

    it("should create sheet if not found", () => {
      const mockFolder = {
        id: "folderId1",
        getFilesByName: jest.fn(),
        addFile: jest.fn(),
      };
      const mockFile = {
        id: "fileId1",
      };
      const mockSheet = {
        id: "sheetId1",
        getId: jest.fn().mockImplementation(() => "sheetId1"),
        appendRow: jest.fn(),
      };

      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        next: jest.fn().mockReturnValueOnce(mockFolder),
      });

      // @ts-ignore
      mockFolder.getFilesByName.mockReturnValueOnce({
        next: jest.fn().mockImplementation(() => {
          throw new Error();
        }),
      });

      // @ts-ignore
      DriveApp.getRootFolder().getFoldersByName.mockReturnValueOnce({
        next: jest.fn().mockReturnValueOnce(mockFolder),
      });

      // @ts-ignore
      SpreadsheetApp.create.mockImplementationOnce(() => mockSheet);

      // @ts-ignore
      DriveApp.getFileById.mockReturnValueOnce(mockFile);

      // @ts-ignore
      mockFolder.addFile.mockReturnValueOnce(mockFolder);

      expect(findOrCreateSheet("name1", [])).toBe(mockSheet);
    });
  });
});
