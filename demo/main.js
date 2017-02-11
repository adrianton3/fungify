// Generated by CoffeeScript 1.12.3
(function() {
  'use strict';
  var Parser, Tokenizer, buildAst, convert, execute, main, parse, sample, setupEditors, setupExecute, setupSamples;

  Tokenizer = espace.Tokenizer, Parser = espace.Parser;

  buildAst = fungify.buildAst, convert = fungify.convert;

  setupEditors = function() {
    var inSource, outBefunge, output;
    inSource = ace.edit('in-source-editor');
    inSource.setTheme('ace/theme/monokai');
    inSource.setFontSize(14);
    outBefunge = ace.edit('out-befunge-editor');
    outBefunge.setTheme('ace/theme/monokai');
    outBefunge.getSession().setUseWrapMode(true);
    outBefunge.setReadOnly(true);
    outBefunge.setFontSize(14);
    output = ace.edit('output-editor');
    output.setTheme('ace/theme/monokai');
    output.getSession().setUseWrapMode(true);
    output.setReadOnly(true);
    output.setFontSize(14);
    return {
      inSource: inSource,
      outBefunge: outBefunge,
      output: output
    };
  };

  setupSamples = function(samples, inSource) {
    var select;
    select = document.getElementById('sample');
    (Object.keys(samples)).forEach(function(sampleName) {
      var option;
      option = document.createElement('option');
      option.textContent = sampleName;
      select.appendChild(option);
    });
    return select.addEventListener('change', function() {
      inSource.setValue(samples[this.value], 1);
    });
  };

  setupExecute = function(outputBefunge, output) {
    var button;
    button = document.getElementById('execute');
    button.addEventListener('click', function() {
      var result, source;
      source = outputBefunge.getValue();
      result = execute(source);
      output.setValue(result, 1);
    });
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
    var errorLine, inSource, onError, onSuccess, outBefunge, output, parseWrap, ref, tryParse;
    ref = setupEditors(), inSource = ref.inSource, outBefunge = ref.outBefunge, output = ref.output;
    setupSamples(window.samples, inSource);
    setupExecute(outBefunge, output);
    errorLine = null;
    parseWrap = function(source) {
      if (source) {
        return convert(parse(source));
      } else {
        return '';
      }
    };
    onSuccess = function(convertedText) {
      outBefunge.setValue(convertedText, 1);
      if (errorLine !== null) {
        inSource.getSession().setAnnotations([]);
        errorLine = null;
      }
    };
    onError = function(exception) {
      if (exception.coords != null) {
        errorLine = exception.coords.line;
        inSource.getSession().setAnnotations([
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
    inSource.getSession().on('change', function() {
      tryParse(inSource.getValue());
    });
    inSource.setValue(initialSource, 1);
  };

  execute = function(source) {
    var playfield, runtime;
    playfield = new bef.Playfield(source);
    runtime = new bef.EagerRuntime();
    runtime.execute(playfield, {
      jumpLimit: 1000
    }, []);
    return runtime.programState.outRecord.join(' ');
  };

  sample = '(do\n	(set! p 1)\n	(set! i 1)\n	(while (< i 5)\n		(do\n			(set! p (* p i))\n			(set! i (+ i 1))))\n	(print-int p))';

  main(sample);

}).call(this);
