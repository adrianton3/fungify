'use strict'


makeNode = (type, props) ->
	->
		node = { type }
		args = arguments
		props.forEach (prop, index) ->
			node[prop] = args[index]
			return

		node


nodes = {
	makeBlock: makeNode 'block', ['statements']
	makeIf: makeNode 'if', ['test', 'consequent', 'alternate']
	makeWhile: makeNode 'while', ['test', 'body']
	makeAssignment: makeNode 'assignment', ['name', 'expression']
	makeUnary: makeNode 'unary', ['operator', 'expression']
	makeBinary: makeNode 'binary', ['operator', 'left', 'right']
	makeNumber: makeNode 'number', ['value']
	makeVar: makeNode 'var', ['name']
	makeSub: makeNode 'sub', ['name', 'expression']
}


window.fungify ?= {}
Object.assign window.fungify, {
	nodes
}