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

export const createSpacedNumberFormatter = (space: number) => (n: number) =>
  String(n).padStart(space, " ");
export const formatNumber2 = createSpacedNumberFormatter(2);
export const formatNumber3 = createSpacedNumberFormatter(3);
