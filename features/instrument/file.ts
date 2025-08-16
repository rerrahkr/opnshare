export function getFileExtensionFromName(
  fileName: string,
  withoutDot: boolean = false
): string {
  const trail = fileName.replace(/^\.+/, "");
  const match = trail.match(/\.([^.]+)$/);
  return match ? (withoutDot ? match[1] : `.${match[1]}`) : "";
}

export function getFileExtension(
  file: File,
  withoutDot: boolean = false
): string {
  return getFileExtensionFromName(file.name, withoutDot);
}
