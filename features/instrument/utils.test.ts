import { getFileExtension, getFileExtensionFromName } from "./utils";

test("getFileExtensionFromName", () => {
  expect(getFileExtensionFromName("example.txt")).toBe(".txt");
  expect(getFileExtensionFromName("example.tar.gz")).toBe(".gz");
  expect(getFileExtensionFromName("example")).toBe("");
  expect(getFileExtensionFromName(".hiddenfile")).toBe("");
  expect(getFileExtensionFromName("example.without.dot", true)).toBe("dot");
});

test("getFileExtension", () => {
  expect(getFileExtension(new File(["dummy"], "dummy.wav"))).toBe(".wav");
  expect(getFileExtension(new File(["dummy"], "dummy.tar.xz"))).toBe(".xz");
  expect(getFileExtension(new File(["dummy"], "dummy"))).toBe("");
  expect(getFileExtension(new File(["dummy"], ".ignore"))).toBe("");
  expect(getFileExtension(new File(["dummy"], "dummy.without.dot"), true)).toBe(
    "dot"
  );
});
