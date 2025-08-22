@{%
const moo = require("moo");

const lexer = moo.compile({
  space: /[ \t]+/,
  comment: /;[^\n]*/,
  comma: ",",
  number: /[0-9]+/,
  line_head: /'@/,
  eol: { match: /\r?\n/, lineBreaks: true },
});
%}

@lexer lexer

instrument ->
  header_line %eol
  operator_line %eol
  operator_line %eol
  operator_line %eol
  operator_line %eol
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

header_line -> %line_head %space:? number %space:? %comment:?

operator_line -> %line_head %space:? operator_params %space:? %comment:? {%
  d => {
    const [ar, dr, sr, rr, sl, tl, ks, ml, dt] = d[2];
    return { ar, dr, sr, rr, sl, tl, ks, ml, dt, am: false, ssgEg: 0 };
  }
%}

al_fb_line -> %line_head %space:? al_fb_params %space:? %comment:? {%
  d => ({ al: d[2][0], fb: d[2][1] })
%}

operator_params ->
  number comma number comma number comma number comma number comma number comma number comma number comma number {%
  d => {
    const numbers = [];
    for (let i = 0; i < 9; i++) {
      numbers.push(d[i * 2]);
    }
    return numbers;
  }
%}

al_fb_params -> number comma number {%
  d => [d[0], d[2]]
%}

comma -> %space:? %comma %space:?
number -> %number {% d => parseInt(d, 10) %}
