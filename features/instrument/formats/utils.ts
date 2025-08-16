export function readNullTerminatedString(
  view: DataView,
  offset: number
): { text: string; length: number } {
  let text = "";
  let i = 0;
  while (true) {
    const charCode = view.getUint8(offset + i);
    i++;
    if (charCode === 0) {
      break;
    }
    text += String.fromCharCode(charCode);
  }
  return { text, length: i };
}
