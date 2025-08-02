export function isoStringToLocaleString(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US");
}
