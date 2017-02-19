// Generated by CoffeeScript 1.12.3
(function() {
  'use strict';
  var makePlayfield;

  makePlayfield = function() {
    var max, place, playfield, stringify;
    playfield = new Map;
    max = {
      line: 0,
      column: 0
    };
    place = function(line, column, char) {
      var chars;
      max.line = Math.max(max.line, line);
      max.column = Math.max(max.column, column);
      (playfield.has(line) ? playfield.get(line) : (chars = new Map, playfield.set(line, chars), chars)).set(column, char);
    };
    stringify = function() {
      var chars, i, j, line, lines;
      lines = (function() {
        var k, ref, results;
        results = [];
        for (i = k = 0, ref = max.line; 0 <= ref ? k <= ref : k >= ref; i = 0 <= ref ? ++k : --k) {
          if (!playfield.has(i)) {
            results.push(' '.repeat(max.column));
          } else {
            line = playfield.get(i);
            chars = (function() {
              var l, ref1, results1;
              results1 = [];
              for (j = l = 0, ref1 = max.column; 0 <= ref1 ? l <= ref1 : l >= ref1; j = 0 <= ref1 ? ++l : --l) {
                if (line.has(j)) {
                  results1.push(line.get(j));
                } else {
                  results1.push(' ');
                }
              }
              return results1;
            })();
            results.push(chars.join(''));
          }
        }
        return results;
      })();
      return lines.join('\n');
    };
    return {
      place: place,
      stringify: stringify
    };
  };

  if (window.fungify == null) {
    window.fungify = {};
  }

  Object.assign(window.fungify, {
    makePlayfield: makePlayfield
  });

}).call(this);