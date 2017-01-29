'use strict'


{ handlers, makePlayfield, makeEnv } = fungify


convert = (root) ->
	playfield = makePlayfield()
	env = makeEnv()

	recurse = (node, line, column) ->
		handler = handlers.get node.type
		handler recurse, node, playfield.place, env.resolve, line, column

	playfield.place 0, 1, 'v'

	programLoc = recurse root, 1, 1

	playfield.place programLoc.line, 1, '@'

	playfield.stringify()


window.fungify ?= {}
Object.assign window.fungify, {
	convert
}