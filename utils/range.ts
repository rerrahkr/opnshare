export function* range(begin: number, end: number, step: number = 1) {
  if (step === 0) {
    throw new Error("Step is 0");
  }

  if (begin === end) {
    return;
  } else if (begin < end) {
    if (step < 0) {
      throw new Error(
        `Invalid step ${step} against begin ${begin} and end ${end}`
      );
    }

    for (let i = begin; i < end; i += step) {
      yield i;
    }
  } else {
    if (step > 0) {
      throw new Error(
        `Invalid step ${step} against begin ${begin} and end ${end}`
      );
    }

    for (let i = begin; i > end; i += step) {
      yield i;
    }
  }
}

export function iota(end: number) {
  return range(0, end);
}
