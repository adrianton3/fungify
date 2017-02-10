'use strict'


{ Tokenizer, Parser } = espace
{ buildAst, convert } = fungify


setupEditors = ->
	input = ace.edit 'input-editor'
	input.setTheme 'ace/theme/monokai'
	input.setFontSize 14

	output = ace.edit 'output-editor'
	output.setTheme 'ace/theme/monokai'
	output.getSession().setUseWrapMode true
	output.setReadOnly true
	output.setFontSize 14

	{
		input
		output
	}


setupSamples = (samples, input) ->
	select = document.getElementById 'sample'

	(Object.keys samples).forEach (sampleName) ->
		option = document.createElement 'option'
		option.textContent = sampleName
		select.appendChild option
		return

	select.addEventListener 'change', ->
		input.setValue samples[@value], 1
		return


parse = (source) ->
	options = { coords: true }
	tokens = (Tokenizer options) source
	rawTree = Parser.parse tokens
	buildAst rawTree


main = (initialSource) ->
	{ input, output } = setupEditors()
	setupSamples window.samples, input

	errorLine = null


	parseWrap = (source) ->
		if source
			convert parse source
		else
			''


	onSuccess = (convertedText) ->
		output.setValue convertedText, 1

		if errorLine != null
			input.getSession().setAnnotations []
			errorLine = null

		return


	onError = (exception) ->
		if exception.coords?
			errorLine = exception.coords.line
			input.getSession().setAnnotations([
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


	input.getSession().on 'change', () ->
		tryParse input.getValue()

		return


	input.setValue initialSource, 1

	return


execute = (source) ->
	playfield = new bef.Playfield()
	playfield.fromString source

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