'use strict'


{ nodes } = fungify


raise = (coords, message) ->
	error = new Error message
	error.coords = coords
	throw error
	return


mapping = new Map

register = Map.prototype.set.bind mapping


register 'not', (e) ->
	nodes.makeUnary buildAst e


register 'print-char', (e) ->
	nodes.makeSub 'print-char', buildAst e


register 'print-int', (e) ->
	nodes.makeSub 'print-int', buildAst e


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


do ->
	doHandler = (statements...) ->
		nodes.makeBlock statements.map buildAst

	doHandler.anyArity = true

	register 'do', doHandler


register 'set!', (name, expression) ->
	nodes.makeAssignment(
		name.token.value
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
			raise form.token.coords, "Unrecognised form: #{name}"

		handler = mapping.get name

		if not handler.anyArity and handler.length != args.length
			raise form.token.coords, """
					#{name} takes #{handler.length} arguments
					but was given #{args.length} arguments
				"""

		handler args...


window.fungify ?= {}
Object.assign window.fungify, {
	buildAst
}