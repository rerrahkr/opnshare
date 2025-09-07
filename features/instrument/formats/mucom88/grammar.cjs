// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
  function id(x) {
    return x[0];
  }

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
  var grammar = {
    Lexer: lexer,
    ParserRules: [
      { name: "instrument$subexpression$1", symbols: ["format1"] },
      { name: "instrument$subexpression$1", symbols: ["format2"] },
      {
        name: "instrument",
        symbols: ["command_header", "instrument$subexpression$1"],
        postprocess: (d) => d[1][0],
      },
      { name: "format1$ebnf$1", symbols: ["ex_number"], postprocess: id },
      {
        name: "format1$ebnf$1",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "format1$ebnf$2", symbols: ["ex_number"], postprocess: id },
      {
        name: "format1$ebnf$2",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "format1$ebnf$3",
        symbols: [lexer.has("eol") ? { type: "eol" } : eol],
        postprocess: id,
      },
      {
        name: "format1$ebnf$3",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "format1",
        symbols: [
          "format1$ebnf$1",
          lexer.has("eol") ? { type: "eol" } : eol,
          "params",
          "format1$ebnf$2",
          "format1$ebnf$3",
        ],
        postprocess: (d) => d[2],
      },
      { name: "format2$ebnf$1", symbols: ["ex_number"], postprocess: id },
      {
        name: "format2$ebnf$1",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "format2$ebnf$2",
        symbols: ["ex_number_double_quote"],
        postprocess: id,
      },
      {
        name: "format2$ebnf$2",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "format2$ebnf$3", symbols: ["ex_number"], postprocess: id },
      {
        name: "format2$ebnf$3",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "format2$ebnf$4", symbols: ["ex_number"], postprocess: id },
      {
        name: "format2$ebnf$4",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "format2$ebnf$5",
        symbols: [lexer.has("eol") ? { type: "eol" } : eol],
        postprocess: id,
      },
      {
        name: "format2$ebnf$5",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "format2",
        symbols: [
          lexer.has("colon") ? { type: "colon" } : colon,
          lexer.has("left_brace") ? { type: "left_brace" } : left_brace,
          "format2$ebnf$1",
          lexer.has("eol") ? { type: "eol" } : eol,
          "params",
          "format2$ebnf$2",
          "desc",
          "format2$ebnf$3",
          lexer.has("right_brace") ? { type: "right_brace" } : right_brace,
          "format2$ebnf$4",
          "format2$ebnf$5",
        ],
        postprocess: (d) => d[4],
      },
      {
        name: "command_header",
        symbols: [
          lexer.has("whitespace") ? { type: "whitespace" } : whitespace,
          lexer.has("whitespace") ? { type: "whitespace" } : whitespace,
          lexer.has("command_sig") ? { type: "command_sig" } : command_sig,
          "number",
        ],
      },
      { name: "params$ebnf$1", symbols: ["ex_number"], postprocess: id },
      {
        name: "params$ebnf$1",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "params$ebnf$2", symbols: ["ex_number"], postprocess: id },
      {
        name: "params$ebnf$2",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "params$ebnf$3", symbols: ["ex_number"], postprocess: id },
      {
        name: "params$ebnf$3",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "params$ebnf$4", symbols: ["ex_number"], postprocess: id },
      {
        name: "params$ebnf$4",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "params$ebnf$5", symbols: ["ex_number"], postprocess: id },
      {
        name: "params$ebnf$5",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "params$ebnf$6", symbols: ["ex_number"], postprocess: id },
      {
        name: "params$ebnf$6",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "params$ebnf$7", symbols: ["ex_number"], postprocess: id },
      {
        name: "params$ebnf$7",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "params$ebnf$8", symbols: ["ex_number"], postprocess: id },
      {
        name: "params$ebnf$8",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      { name: "params$ebnf$9", symbols: ["ex_number"], postprocess: id },
      {
        name: "params$ebnf$9",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "params",
        symbols: [
          "params$ebnf$1",
          "fb_al",
          "params$ebnf$2",
          lexer.has("eol") ? { type: "eol" } : eol,
          "params$ebnf$3",
          "operator",
          "params$ebnf$4",
          lexer.has("eol") ? { type: "eol" } : eol,
          "params$ebnf$5",
          "operator",
          "params$ebnf$6",
          lexer.has("eol") ? { type: "eol" } : eol,
          "params$ebnf$7",
          "operator",
          "params$ebnf$8",
          lexer.has("eol") ? { type: "eol" } : eol,
          "params$ebnf$9",
          "operator",
        ],
        postprocess: (d) => ({
          ...d[1],
          op: [d[5], d[9], d[13], d[17]],
          lfoFreq: 0,
          ams: 0,
          pms: 0,
        }),
      },
      {
        name: "fb_al",
        symbols: ["number", "ex_number", "number"],
        postprocess: (d) => ({ al: d[2], fb: d[0] }),
      },
      {
        name: "operator",
        symbols: [
          "number",
          "ex_number",
          "number",
          "ex_number",
          "number",
          "ex_number",
          "number",
          "ex_number",
          "number",
          "ex_number",
          "number",
          "ex_number",
          "number",
          "ex_number",
          "number",
          "ex_number",
          "number",
        ],
        postprocess: (d) => {
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
        },
      },
      { name: "desc$ebnf$1", symbols: [] },
      {
        name: "desc$ebnf$1$subexpression$1",
        symbols: ["ex_digit_double_quote"],
      },
      {
        name: "desc$ebnf$1$subexpression$1",
        symbols: [lexer.has("digit") ? { type: "digit" } : digit],
      },
      {
        name: "desc$ebnf$1",
        symbols: ["desc$ebnf$1", "desc$ebnf$1$subexpression$1"],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "desc",
        symbols: [
          lexer.has("double_quote") ? { type: "double_quote" } : double_quote,
          "desc$ebnf$1",
          lexer.has("double_quote") ? { type: "double_quote" } : double_quote,
        ],
      },
      {
        name: "number$ebnf$1",
        symbols: [lexer.has("digit") ? { type: "digit" } : digit],
      },
      {
        name: "number$ebnf$1",
        symbols: [
          "number$ebnf$1",
          lexer.has("digit") ? { type: "digit" } : digit,
        ],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "number",
        symbols: ["number$ebnf$1"],
        postprocess: (d) => parseInt(d[0].join(""), 10),
      },
      {
        name: "ex_number$ebnf$1$subexpression$1",
        symbols: ["ex_digit_double_quote"],
      },
      {
        name: "ex_number$ebnf$1$subexpression$1",
        symbols: [
          lexer.has("double_quote") ? { type: "double_quote" } : double_quote,
        ],
      },
      {
        name: "ex_number$ebnf$1",
        symbols: ["ex_number$ebnf$1$subexpression$1"],
      },
      {
        name: "ex_number$ebnf$1$subexpression$2",
        symbols: ["ex_digit_double_quote"],
      },
      {
        name: "ex_number$ebnf$1$subexpression$2",
        symbols: [
          lexer.has("double_quote") ? { type: "double_quote" } : double_quote,
        ],
      },
      {
        name: "ex_number$ebnf$1",
        symbols: ["ex_number$ebnf$1", "ex_number$ebnf$1$subexpression$2"],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      { name: "ex_number", symbols: ["ex_number$ebnf$1"] },
      {
        name: "ex_number_double_quote$ebnf$1",
        symbols: ["ex_digit_double_quote"],
      },
      {
        name: "ex_number_double_quote$ebnf$1",
        symbols: ["ex_number_double_quote$ebnf$1", "ex_digit_double_quote"],
        postprocess: function arrpush(d) {
          return d[0].concat([d[1]]);
        },
      },
      {
        name: "ex_number_double_quote",
        symbols: ["ex_number_double_quote$ebnf$1"],
      },
      {
        name: "ex_digit_double_quote",
        symbols: [
          lexer.has("other_character")
            ? { type: "other_character" }
            : other_character,
        ],
      },
      {
        name: "ex_digit_double_quote",
        symbols: [
          lexer.has("whitespace") ? { type: "whitespace" } : whitespace,
        ],
      },
    ],
    ParserStart: "instrument",
  };
  if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = grammar;
  } else {
    window.grammar = grammar;
  }
})();
