// Generated by CoffeeScript 1.12.3
(function() {
  'use strict';
  var Parser, Tokenizer, buildAst, convert, execute, main, parse, sample, setupEditors;

  Tokenizer = espace.Tokenizer, Parser = espace.Parser;

  buildAst = fungify.buildAst, convert = fungify.convert;

  setupEditors = function() {
    var input, output;
    input = ace.edit('input-editor');
    input.setTheme('ace/theme/monokai');
    input.setFontSize(14);
    output = ace.edit('output-editor');
    output.setTheme('ace/theme/monokai');
    output.getSession().setUseWrapMode(true);
    output.setReadOnly(true);
    output.setFontSize(14);
    return {
      input: input,
      output: output
    };
  };

  parse = function(source) {
    var options, rawTree, tokens;
    options = {
      coords: true
    };
    tokens = (Tokenizer(options))(source);
    rawTree = Parser.parse(tokens);
    return buildAst(rawTree);
  };

  main = function(initialSource) {
    var errorLine, input, onError, onSuccess, output, parseWrap, ref, tryParse;
    ref = setupEditors(), input = ref.input, output = ref.output;
    errorLine = null;
    parseWrap = function(source) {
      if (source) {
        return convert(parse(source));
      } else {
        return '';
      }
    };
    onSuccess = function(convertedText) {
      output.setValue(convertedText, 1);
      if (errorLine !== null) {
        input.getSession().setAnnotations([]);
        errorLine = null;
      }
    };
    onError = function(exception) {
      if (exception.coords != null) {
        errorLine = exception.coords.line;
        input.getSession().setAnnotations([
          {
            row: errorLine - 1,
            text: exception.message,
            type: 'error'
          }
        ]);
      }
    };
    tryParse = function(source) {
      var exception;
      try {
        onSuccess(parseWrap(source));
      } catch (error) {
        exception = error;
        onError(exception);
      }
    };
    input.getSession().on('change', function() {
      tryParse(input.getValue());
    });
    input.setValue(initialSource, 1);
  };

  execute = function(source) {
    var playfield, runtime;
    playfield = new bef.Playfield();
    playfield.fromString(source);
    runtime = new bef.EagerRuntime();
    runtime.execute(playfield, {
      jumpLimit: 1000
    }, []);
    return runtime.programState.outRecord.join(' ');
  };

  sample = '(do\n	(set! p 1)\n	(set! i 1)\n	(while (< i 5)\n		(do\n			(set! p (* p i))\n			(set! i (+ i 1))))\n	(print-int p))';

  main(sample);

}).call(this);
