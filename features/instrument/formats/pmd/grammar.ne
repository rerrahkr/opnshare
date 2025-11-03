@{%
const moo = require("moo");

const lexer = moo.compile({
  separators: /[, \t]+/,
  number: /[0-9]+/,
  command_sig: /@/,
  eol: { match: /\r?\n/, lineBreaks: true },
});

function parseBool(n) { return n === 1; }
%}

@lexer lexer

instrument ->
  command_header separators al_fb
  separators operator
  separators operator
  separators operator
  separators operator {%
  d => ({
    ...(d[2]),
    op: [d[4], d[6], d[8], d[10]],
    lfoFreq: 0,
    ams: 0,
    pms: 0,
  })
%}

command_header -> %command_sig %separators:? number

al_fb -> number separators number {%
  d => ({ al: d[0], fb: d[2] })
%}

operator ->
  number separators number separators number separators number separators number separators
  number separators number separators number separators number separators number {%
  d => {
    return {
      ar: d[0],
      dr: d[2],
      sr: d[4],
      rr: d[6],
      sl: d[8],
      tl: d[10],
      ks: d[12],
      ml: d[14],
      dt: d[16],
      am: parseBool(d[18]),
      ssgEg: 0,
    };
  }
%}

separators -> %separators | (%separators:? %eol %separators:?)
number -> %number {% d => parseInt(d, 10) %}
