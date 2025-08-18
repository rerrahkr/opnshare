export class InstrumentFormatError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class DataCorruptionError extends InstrumentFormatError {
  constructor(message?: string) {
    super(`File corruption error${message ? `: ${message}` : ""}`);
  }
}

export class UnsupportedFormatError extends InstrumentFormatError {
  constructor(message?: string) {
    super(`Unsupported file${message ? `: ${message}` : ""}`);
  }
}

export class InvalidFormatError extends InstrumentFormatError {
  constructor(message?: string) {
    super(`Invalid file format${message ? `: ${message}` : ""}`);
  }
}

export class UnsupportedInstrumentTypeError extends InstrumentFormatError {
  constructor(message?: string) {
    super(`Unsupported instrument type${message ? `: ${message}` : ""}`);
  }
}

export class TextParseError extends InstrumentFormatError {
  constructor(message?: string) {
    super(`Text parse error${message ? `: ${message}` : ""}`);
  }
}
