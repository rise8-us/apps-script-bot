import { isActiveEvent, isCancelledEvent, isNewEvent } from "../Code";

describe("utils", () => {
  describe("isCancelledEvent", () => {
    it("should return true if event is cancelled", () => {
      expect(isCancelledEvent({ status: "cancelled" })).toBe(true);
    });

    it("should return false if event is not cancelled", () => {
      expect(isCancelledEvent({ status: "pending" })).toBe(false);
    });
  });

  describe("isActiveEvent", () => {
    it("should return true if event is active", () => {
      expect(
        isActiveEvent({
          end: { dateTime: new Date(Date.now() + 600000).toISOString() },
        })
      ).toBe(true);
    });

    it("should return false if event is not active", () => {
      expect(
        isActiveEvent({
          end: { dateTime: new Date(Date.now() - 600000).toISOString() },
        })
      ).toBe(false);
    });
  });

  describe("isNewEvent", () => {
    it("should return true if event is new", () => {
      const mockDate = Date.now();
      expect(
        isNewEvent({
          created: new Date(mockDate).toISOString(),
          updated: new Date(mockDate + 4999).toISOString(),
        })
      ).toBe(true);
    });

    it("should return false if event is not new", () => {
      const mockDate = Date.now();
      expect(
        isNewEvent({
          created: new Date(mockDate).toISOString(),
          updated: new Date(mockDate + 5000).toISOString(),
        })
      ).toBe(false);
    });
  });
});
