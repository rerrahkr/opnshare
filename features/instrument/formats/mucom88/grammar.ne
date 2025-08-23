@{%
const moo = require("moo");

const lexer = moo.compile({
  digit: /\d/,
  command_sig: /@/,
  colon: /:/,
  left_brace: /\{/,
  right_brace: /\}/,
  double_quote: /"/,
  whitespace: / /,
  eol: { match: /\r?\n/, lineBreaks: true },
  other_character: /[^\d\n\r "}]/,
});
%}

@lexer lexer

instrument -> command_header (format1 | format2) {% d => d[1][0] %}

format1 ->
  ex_number:? %eol
  params ex_number:? %eol:? {%
  d => d[2]
%}

format2 ->
  %colon %left_brace ex_number:? %eol
  params ex_number_double_quote:? desc ex_number:? %right_brace ex_number:? %eol:? {%
  d => d[4]
%}

command_header -> %whitespace %whitespace %command_sig number

params ->
  ex_number:? fb_al ex_number:? %eol
  ex_number:? operator ex_number:? %eol
  ex_number:? operator ex_number:? %eol
  ex_number:? operator ex_number:? %eol
  ex_number:? operator  {%
  d => ({
    ...(d[1]),
    op: [d[5], d[9], d[13], d[17]],
    lfoFreq: 0,
    ams: 0,
    pms: 0,
  })
%}

fb_al -> number ex_number number {%
  d => ({ al: d[2], fb: d[0] })
%}

operator ->
  number ex_number number ex_number number ex_number number ex_number number ex_number number ex_number number ex_number number ex_number number {%
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
      am: false,
      ssgEg: 0,
    };
  }
%}

desc -> %double_quote (ex_digit_double_quote | %digit):* %double_quote

number -> %digit:+ {% d => parseInt(d[0].join(""), 10) %}

ex_number -> (ex_digit_double_quote | %double_quote):+
ex_number_double_quote -> ex_digit_double_quote:+

ex_digit_double_quote -> %other_character | %whitespace
