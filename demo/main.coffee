'use strict'


{ Tokenizer, Parser } = espace
{ buildAst, convert } = fungify


parse = (source) ->
	tokens = Tokenizer() source
	rawTree = Parser.parse tokens
	buildAst rawTree


source = '''
	(do
		(set! p 1)
		(set! i 1)
		(while (< i 5)
			(do
				(set! p (* p i))
				(set! i (+ i 1))))
		(printInt p))
'''

ast = parse source
befSource = convert ast

playfield = new bef.Playfield()
playfield.fromString befSource

runtime = new bef.EagerRuntime()
runtime.execute(
	playfield
	{ jumpLimit: 1000 }
	[]
)

console.log runtime.programState.outRecord.join ' '