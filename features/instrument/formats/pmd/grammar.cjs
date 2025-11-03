// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
  function id(x) {
    return x[0];
  }

  const moo = require("moo");

  const lexer = moo.compile({
    separators: /[, \t]+/,
    number: /[0-9]+/,
    command_sig: /@/,
    eol: { match: /\r?\n/, lineBreaks: true },
  });

  function parseBool(n) {
    return n === 1;
  }
  var grammar = {
    Lexer: lexer,
    ParserRules: [
      {
        name: "instrument",
        symbols: [
          "command_header",
          "separators",
          "al_fb",
          "separators",
          "operator",
          "separators",
          "operator",
          "separators",
          "operator",
          "separators",
          "operator",
        ],
        postprocess: (d) => ({
          ...d[2],
          op: [d[4], d[6], d[8], d[10]],
          lfoFreq: 0,
          ams: 0,
          pms: 0,
        }),
      },
      {
        name: "command_header$ebnf$1",
        symbols: [
          lexer.has("separators") ? { type: "separators" } : separators,
        ],
        postprocess: id,
      },
      {
        name: "command_header$ebnf$1",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "command_header",
        symbols: [
          lexer.has("command_sig") ? { type: "command_sig" } : command_sig,
          "command_header$ebnf$1",
          "number",
        ],
      },
      {
        name: "al_fb",
        symbols: ["number", "separators", "number"],
        postprocess: (d) => ({ al: d[0], fb: d[2] }),
      },
      {
        name: "operator",
        symbols: [
          "number",
          "separators",
          "number",
          "separators",
          "number",
          "separators",
          "number",
          "separators",
          "number",
          "separators",
          "number",
          "separators",
          "number",
          "separators",
          "number",
          "separators",
          "number",
          "separators",
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
            am: parseBool(d[18]),
            ssgEg: 0,
          };
        },
      },
      {
        name: "separators",
        symbols: [
          lexer.has("separators") ? { type: "separators" } : separators,
        ],
      },
      {
        name: "separators$subexpression$1$ebnf$1",
        symbols: [
          lexer.has("separators") ? { type: "separators" } : separators,
        ],
        postprocess: id,
      },
      {
        name: "separators$subexpression$1$ebnf$1",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "separators$subexpression$1$ebnf$2",
        symbols: [
          lexer.has("separators") ? { type: "separators" } : separators,
        ],
        postprocess: id,
      },
      {
        name: "separators$subexpression$1$ebnf$2",
        symbols: [],
        postprocess: function (d) {
          return null;
        },
      },
      {
        name: "separators$subexpression$1",
        symbols: [
          "separators$subexpression$1$ebnf$1",
          lexer.has("eol") ? { type: "eol" } : eol,
          "separators$subexpression$1$ebnf$2",
        ],
      },
      { name: "separators", symbols: ["separators$subexpression$1"] },
      {
        name: "number",
        symbols: [lexer.has("number") ? { type: "number" } : number],
        postprocess: (d) => parseInt(d, 10),
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
