'use strict'


{ Tokenizer, Parser } = espace
{ buildAst, convert } = fungify


setupEditors = ->
	inSource = ace.edit 'in-source-editor'
	inSource.setTheme 'ace/theme/monokai'
	inSource.setFontSize 14

	outBefunge = ace.edit 'out-befunge-editor'
	outBefunge.setTheme 'ace/theme/monokai'
	outBefunge.getSession().setUseWrapMode true
	outBefunge.setReadOnly true
	outBefunge.setFontSize 14

	output = ace.edit 'output-editor'
	output.setTheme 'ace/theme/monokai'
	output.getSession().setUseWrapMode true
	output.setReadOnly true
	output.setFontSize 14

	{
		inSource
		outBefunge
		output
	}


setupSamples = (samples, inSource) ->
	select = document.getElementById 'sample'

	(Object.keys samples).forEach (sampleName) ->
		option = document.createElement 'option'
		option.textContent = sampleName
		select.appendChild option
		return

	select.addEventListener 'change', ->
		inSource.setValue samples[@value], 1
		return


setupExecute = (outputBefunge, output) ->
	button = document.getElementById 'execute'
	button.addEventListener 'click', ->
		source = outputBefunge.getValue()
		result = execute source
		output.setValue result, 1
		return

	return


parse = (source) ->
	options = { coords: true }
	tokens = (Tokenizer options) source
	rawTree = Parser.parse tokens
	buildAst rawTree


main = (initialSource) ->
	{ inSource, outBefunge, output } = setupEditors()
	setupSamples window.samples, inSource
	setupExecute outBefunge, output

	errorLine = null


	parseWrap = (source) ->
		if source
			convert parse source
		else
			''


	onSuccess = (convertedText) ->
		outBefunge.setValue convertedText, 1

		if errorLine != null
			inSource.getSession().setAnnotations []
			errorLine = null

		return


	onError = (exception) ->
		if exception.coords?
			errorLine = exception.coords.line
			inSource.getSession().setAnnotations([
				row: errorLine - 1
				text: exception.message
				type: 'error'
			])

		return


	tryParse = (source) ->
		try
			onSuccess parseWrap source
		catch exception
			onError exception

		return


	inSource.getSession().on 'change', () ->
		tryParse inSource.getValue()

		return


	inSource.setValue initialSource, 1

	return


execute = (source) ->
	playfield = new bef.Playfield source

	runtime = new bef.EagerRuntime()
	runtime.execute(
		playfield
		{ jumpLimit: 1000 }
		[]
	)

	runtime.programState.outRecord.join ' '


sample = '''
	(do
		(set! p 1)
		(set! i 1)
		(while (< i 5)
			(do
				(set! p (* p i))
				(set! i (+ i 1))))
		(print-int p))
'''

main sample