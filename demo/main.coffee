'use strict'


{ Tokenizer, Parser } = espace
{ buildAst, convert } = fungify


parse = (source) ->
	tokens = Tokenizer() source
	rawTree = Parser.parse tokens
	buildAst rawTree


source = '''
	(while
		(< 1 2)
		(printInt (+ 3 4)))
'''

ast = parse source
bef = convert ast

console.log bef