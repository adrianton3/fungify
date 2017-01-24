'use strict'


{ handlers, makePlayfield, makeEnv } = fungify


convert = (root) ->
	playfield = makePlayfield()
	env = makeEnv()

	recurse = (node, line, column) ->
		handler = handlers.get node.type
		handler recurse, node, playfield.place, env.resolve, line, column

	recurse root, 0, 0

	playfield.stringify()


{ sample1, sample2, sample3, sample4 } = fungify.samples


console.log convert sample4