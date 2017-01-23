'use strict'


{
	makeIf
	makeOp
	makeNumber
	makeSub
	makeAssignment
} = fungify.nodes


sample1 = makeIf(
	(makeOp '`', (makeNumber 3), (makeNumber 8))
	(makeSub 'printInt', (makeNumber 4))
	(makeSub 'printInt', (makeNumber 5))
)


sample2 = makeSub 'printInt', (makeNumber 200)


sample3 = makeAssignment 'a', (makeNumber 30)


window.fungify ?= {}
window.fungify.samples ?= {}
Object.assign window.fungify.samples, {
	sample1
	sample2
	sample3
}