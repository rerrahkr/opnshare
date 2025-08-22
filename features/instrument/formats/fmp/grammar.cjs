// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }

const moo = require("moo");

const lexer = moo.compile({
  space: /[ \t]+/,
  comment: /;[^\n]*/,
  comma: ",",
  number: /[0-9]+/,
  line_head: /'@/,
  eol: { match: /\r?\n/, lineBreaks: true },
});

function parseBool(n) { return n === 1; }
var grammar = {
    Lexer: lexer,
    ParserRules: [
    {"name": "instrument$ebnf$1", "symbols": [(lexer.has("eol") ? {type: "eol"} : eol)], "postprocess": id},
    {"name": "instrument$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "instrument", "symbols": ["header_line", (lexer.has("eol") ? {type: "eol"} : eol), "operator_line", (lexer.has("eol") ? {type: "eol"} : eol), "operator_line", (lexer.has("eol") ? {type: "eol"} : eol), "operator_line", (lexer.has("eol") ? {type: "eol"} : eol), "operator_line", (lexer.has("eol") ? {type: "eol"} : eol), "al_fb_line", "instrument$ebnf$1"], "postprocess": 
        d => ({
          op: [d[2], d[4], d[6], d[8]],
          al: d[10].al,
          fb: d[10].fb,
          lfoFreq: 0,
          ams: 0,
          pms: 0,
        })
        },
    {"name": "header_line$ebnf$1", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": id},
    {"name": "header_line$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "header_line$ebnf$2", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": id},
    {"name": "header_line$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "header_line$ebnf$3", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": id},
    {"name": "header_line$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "header_line", "symbols": [(lexer.has("line_head") ? {type: "line_head"} : line_head), "header_line$ebnf$1", "number", "header_line$ebnf$2", "header_line$ebnf$3"]},
    {"name": "operator_line$ebnf$1", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": id},
    {"name": "operator_line$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "operator_line$ebnf$2", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": id},
    {"name": "operator_line$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "operator_line$ebnf$3", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": id},
    {"name": "operator_line$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "operator_line", "symbols": [(lexer.has("line_head") ? {type: "line_head"} : line_head), "operator_line$ebnf$1", "operator_params", "operator_line$ebnf$2", "operator_line$ebnf$3"], "postprocess": 
        d => {
          const [ar, dr, sr, rr, sl, tl, ks, ml, dt] = d[2];
          return { ar, dr, sr, rr, sl, tl, ks, ml, dt, am: false, ssgEg: 0 };
        }
        },
    {"name": "al_fb_line$ebnf$1", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": id},
    {"name": "al_fb_line$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "al_fb_line$ebnf$2", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": id},
    {"name": "al_fb_line$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "al_fb_line$ebnf$3", "symbols": [(lexer.has("comment") ? {type: "comment"} : comment)], "postprocess": id},
    {"name": "al_fb_line$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "al_fb_line", "symbols": [(lexer.has("line_head") ? {type: "line_head"} : line_head), "al_fb_line$ebnf$1", "al_fb_params", "al_fb_line$ebnf$2", "al_fb_line$ebnf$3"], "postprocess": 
        d => ({ al: d[2][0], fb: d[2][1] })
        },
    {"name": "operator_params", "symbols": ["number", "comma", "number", "comma", "number", "comma", "number", "comma", "number", "comma", "number", "comma", "number", "comma", "number", "comma", "number"], "postprocess": 
        d => {
          const numbers = [];
          for (let i = 0; i < 9; i++) {
            numbers.push(d[i * 2]);
          }
          return numbers;
        }
        },
    {"name": "al_fb_params", "symbols": ["number", "comma", "number"], "postprocess": 
        d => [d[0], d[2]]
        },
    {"name": "comma$ebnf$1", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": id},
    {"name": "comma$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "comma$ebnf$2", "symbols": [(lexer.has("space") ? {type: "space"} : space)], "postprocess": id},
    {"name": "comma$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "comma", "symbols": ["comma$ebnf$1", (lexer.has("comma") ? {type: "comma"} : comma), "comma$ebnf$2"]},
    {"name": "number", "symbols": [(lexer.has("number") ? {type: "number"} : number)], "postprocess": d => parseInt(d, 10)}
]
  , ParserStart: "instrument"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
