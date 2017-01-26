'use strict'


{ nodes } = fungify


mapping = new Map

register = Map.prototype.set.bind mapping


register 'not', (e) ->
	nodes.makeUnary buildAst e


register 'printChar', (e) ->
	nodes.makeSub 'printChar', buildAst e


register 'printInt', (e) ->
	nodes.makeSub 'printInt', buildAst e


registerBinary = (name, encoded, constructor) ->
	register(
		name
		(e1, e2) ->
			constructor	encoded, buildAst(e1), buildAst(e2)
	)


registerBinary '+', '+', nodes.makeBinary
registerBinary '-', '-', nodes.makeBinary
registerBinary '*', '*', nodes.makeBinary
registerBinary '/', '/', nodes.makeBinary
registerBinary '%', '%', nodes.makeBinary

registerBinary '<', '`', nodes.makeBinary


register 'while', (test, body) ->
	nodes.makeWhile(
		buildAst test
		buildAst body
	)


register 'if', (test, consequent, alternate) ->
	nodes.makeIf(
		buildAst test
		buildAst consequent
		buildAst alternate
	)


register 'do', (statements...) ->
	nodes.makeBlock statements.map buildAst


register 'set!', (name, expression) ->
	nodes.makeAssignment(
		name
		buildAst expression
	)


buildAst = (tree) ->
	{ type, value } = tree.token

	if type == 'number'
		nodes.makeNumber value
	else if type == 'identifier'
		nodes.makeVar value
	else if type == '('
		[form, args...] = tree.children

		name = form.token.value

		if not mapping.has name
			throw 'Invalid syntax'

		handler = mapping.get name

		handler args...


window.fungify ?= {}
Object.assign window.fungify, {
	buildAst
}