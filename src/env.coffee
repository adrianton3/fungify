'use strict'


makeEnv = ->
	count = 0
	mapping = new Map


	resolve = (name) ->
		if mapping.has name
			mapping.get name
		else
			prevCount = count
			mapping.set name, count
			count++
			prevCount


	{ resolve }


window.fungify ?= {}
Object.assign window.fungify, {
	makeEnv
}