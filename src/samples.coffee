'use strict'


{
	makeIf
	makeOp
	makeNumber
	makeSub
	makeAssignment
	makeWhile
	makeBlock
	makeVar
} = fungify.nodes


sample1 = makeIf(
	(makeOp '`', (makeNumber 3), (makeNumber 8))
	(makeSub 'printInt', (makeNumber 4))
	(makeSub 'printInt', (makeNumber 5))
)


sample2 = makeSub 'printInt', (makeNumber 200)


sample3 = makeAssignment 'a', (makeNumber 30)


sample4 = makeWhile(
	(makeOp '`', (makeVar 'count'), (makeNumber 5))
	makeBlock([
		(makeSub 'printInt', (makeVar 'count'))
		makeAssignment(
			'count',
			(makeOp '+', (makeVar 'count'), (makeNumber 1))
		)
	])
)


window.fungify ?= {}
window.fungify.samples ?= {}
Object.assign window.fungify.samples, {
	sample1
	sample2
	sample3
	sample4
}