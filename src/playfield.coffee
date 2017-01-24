'use strict'


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


window.fungify ?= {}
Object.assign window.fungify, {
	makePlayfield
}
