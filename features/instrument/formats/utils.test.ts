import { readNullTerminatedString } from "./utils";

describe("readNullTerminatedString", () => {
  it("should match a text", () => {
    // "Hello, world\0"
    const helloWorld = [
      0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x2c, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64,
      0x00,
    ];

    const buffer = new ArrayBuffer(20);
    const view = new Uint8Array(buffer);
    view.set(helloWorld);
    expect(readNullTerminatedString(new DataView(buffer), 0)).toEqual({
      text: "Hello, world",
      length: 13,
    });
  });

  it("should handle empty text correctly", () => {
    const buffer = new ArrayBuffer(20);
    const view = new DataView(buffer);
    view.setUint8(4, 0x00); // "\0"
    expect(readNullTerminatedString(view, 4)).toEqual({
      text: "",
      length: 1,
    });
  });
});
