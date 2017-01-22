'use strict'


makeEnv = ->
	count = 0
	mapping = new Map

	resolve = (name) ->
		mapping.set name count
		count++

	{ resolve }


makePlayfield = ->
	playfield = new Map

	max = {
		line: 0
		column: 0
	}


	place = (line, column, char) ->
		max.line = Math.max max.line, line
		max.column = Math.max max.column, column

		(
			if playfield.has line
				playfield.get line
			else
				chars = new Map
				playfield.set line, chars
				chars
		).set column, char

		return


	stringify = ->
		lines = for i in [0..max.line]
			if not playfield.has i
				' '.repeat max.column
			else
				line = playfield.get i
				chars = for j in [0..max.column]
					if line.has j
						line.get j
					else
						' '

				chars.join ''

		lines.join '\n'


	{
		place
		stringify
	}


{ handlers } = fungify


convert = (root) ->
	playfield = makePlayfield()
	env = makeEnv()

	recurse = (node, line, column) ->
		handler = handlers.get node.type
		handler recurse, node, playfield.place, env.resolve, line, column

	recurse root, 0, 0

	playfield.stringify()


{ sample1 } = fungify.samples


console.log convert sample1