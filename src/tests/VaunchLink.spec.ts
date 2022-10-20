import { test, describe, expect, beforeEach } from "vitest";
import { VaunchFolder } from "../models/VaunchFolder";
import { VaunchLink } from "../models/VaunchLink";
import { ResponseType } from "../models/VaunchResponse";

const parent = new VaunchFolder("test");
let file: VaunchLink;

beforeEach(() => {
  file = new VaunchLink(
    "test_file",
    "http://example.com",
    parent,
    "vuejs",
    "brands",
    100,
    "Test File",
    1
  );
});

describe("file", () => {
  test("file is defined", () => {
    expect(file).toBeDefined();
  });

  describe("given a valid URL", () => {
    test("file execution", () => {
      file.execute(["_blank"]);
      const response = file.execute([]);
      expect(response.type).toBe(ResponseType.Success);
      expect(response.message).toBe("Navigating to: http://example.com/");
    });
  });

  describe("given an invalid URL", () => {
    test("file execution", () => {
      const badLink = "badLink";
      file.edit([badLink]);
      file.execute(["_blank"]);
      const response = file.execute([]);
      expect(response.type).toBe(ResponseType.Error);
      expect(response.message).toBe(
        `Failed to execute file. Attempted URL was: ${badLink}`
      );
    });
  });

  test("file name", () => {
    expect(file.fileName).toBeTruthy();
    expect(file.fileName).toBe("test_file.lnk");
    file.setName("bar");
    file.setName("new name");
    expect(file.fileName).toBe("new_name.lnk");
  });

  test("file description", () => {
    expect(file.getDescription()).toBe("Test File");
    file.description = "";
    expect(file.getDescription()).toBe("Navigate to: http://example.com/");

    file.edit(["https://longdomainname.tld/longpathname#longanchorname"]);
    expect(file.getDescription()).toBe(
      "Navigate to: https://longdomainname.tld/longpathname#longanchor..."
    );
  });

  test("title case conversion", () => {
    expect(file.titleCase()).toBe("Test File");
    file.setName("new-name.lnk");
    expect(file.titleCase()).toBe("New Name");
  });
});
