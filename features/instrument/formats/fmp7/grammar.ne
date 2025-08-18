@{%
const moo = require("moo");

const lexer = moo.compile({
  space: /[ \t]+/,
  comment: /;[^\n]*/,
  comma: ",",
  number: /[0-9]+/,
  line_head: /'@/,
  id_fa: /FA/,
  id_f: /F(?!A)/,
  eol: { match: /\r?\n/, lineBreaks: true },
});

function parseBool(n) { return n === 1; }
%}

@lexer lexer

instrument ->
  instrument_fa {% d => d[0] %}  | instrument_f {% d => d[0] %}

instrument_fa ->
  header_line_fa %eol
  operator_line_fa %eol
  operator_line_fa %eol
  operator_line_fa %eol
  operator_line_fa %eol
  al_fb_line %eol:? {%
  d => ({
    op: [d[2], d[4], d[6], d[8]],
    al: d[10].al,
    fb: d[10].fb,
    lfoFreq: 0,
    ams: 0,
    pms: 0,
  })
%}

instrument_f ->
  header_line_f %eol
  operator_line_f %eol
  operator_line_f %eol
  operator_line_f %eol
  operator_line_f %eol
  al_fb_line %eol:? {%
  d => ({
    op: [d[2], d[4], d[6], d[8]],
    al: d[10].al,
    fb: d[10].fb,
    lfoFreq: 0,
    ams: 0,
    pms: 0,
  })
%}

# Header
header_line_fa -> %line_head %space:? %id_fa %space:? number %space:? %comment:?

header_line_f -> %line_head %space:? %id_f %space:? number %space:? %comment:?

# Operator lines
operator_line_fa -> %line_head %space:? operator_params_fa %space:? %comment:? {%
  d => {
    const [ar, dr, sr, rr, sl, tl, ks, ml, dt, am] = d[2];
    return { ar, dr, sr, rr, sl, tl, ks, ml, dt, am: parseBool(am), ssgEg: 0 };
  }
%}

operator_line_f -> %line_head %space:? operator_params_f %space:? %comment:? {%
  d => {
    const [ar, dr, sr, rr, sl, tl, ks, ml, dt] = d[2];
    return { ar, dr, sr, rr, sl, tl, ks, ml, dt, am: false, ssgEg: 0 };
  }
%}

# AL/FB line
al_fb_line -> %line_head %space:? al_fb_params %space:? %comment:? {%
  d => ({ al: d[2][0], fb: d[2][1] })
%}

# Operator parameters
operator_params_fa ->
  number comma number comma number comma number comma number comma number comma number comma number comma number comma number {%
  d => {
    const numbers = [];
    for (let i = 0; i < 10; i++) {
      numbers.push(d[i * 2]);
    }
    return numbers;
  }
%}

operator_params_f ->
  number comma number comma number comma number comma number comma number comma number comma number comma number {%
  d => {
    const numbers = [];
    for (let i = 0; i < 9; i++) {
      numbers.push(d[i * 2]);
    }
    return numbers;
  }
%}

# AL/FB parameters
al_fb_params -> number comma number {%
  d => [d[0], d[2]]
%}

# Additional tokens
comma -> %space:? %comma %space:?
number -> %number {% d => parseInt(d, 10) %}
