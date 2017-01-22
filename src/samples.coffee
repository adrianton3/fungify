'use strict'


{
	makeIf
	makeOp
	makeNumber
	makeSub
} = fungify.nodes


sample1 = makeIf(
	(makeOp '`', (makeNumber 3), (makeNumber 8))
	(makeSub 'printInt', (makeNumber 4))
	(makeSub 'printInt', (makeNumber 5))
)


window.fungify ?= {}
window.fungify.samples ?= {}
Object.assign window.fungify.samples, {
	sample1
}