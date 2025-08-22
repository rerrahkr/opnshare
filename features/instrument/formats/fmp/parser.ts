import nearley from "nearley";
import type { FmInstrument } from "../../types";
import { TextParseError } from "../errors";
import grammar from "./grammar.cjs";

export function parse(text: string): FmInstrument {
  // Remove comment lines
  const modified = text
    .split("\n")
    .filter((line) => line.startsWith("'"))
    .join("\n");

  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

  try {
    parser.feed(modified);
    const results = parser.results;
    if (results.length === 0) {
      throw new Error();
    } else {
      return results[0];
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new TextParseError(error.message);
    } else {
      throw new TextParseError(error as string);
    }
  }
}
