@{%
const moo = require("moo");

const lexer = moo.compile({
  space: /[ \t]+/,
  number: /[0-9]+/,
  command_sig: /@/,
  eol: { match: /\r?\n/, lineBreaks: true },
});

function parseBool(n) { return n === 1; }
%}

@lexer lexer

instrument ->
  command_header spaces al_fb
  spaces operator
  spaces operator
  spaces operator
  spaces operator {%
  d => ({
    ...(d[2]),
    op: [d[4], d[6], d[8], d[10]],
    lfoFreq: 0,
    ams: 0,
    pms: 0,
  })
%}

command_header -> %command_sig %space:? number

al_fb -> number spaces number {%
  d => ({ al: d[0], fb: d[2] })
%}

operator ->
  number spaces number spaces number spaces number spaces number spaces number spaces number spaces number spaces number spaces number {%
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

spaces -> %space | (%space:? %eol %space:?)
number -> %number {% d => parseInt(d, 10) %}
