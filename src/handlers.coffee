ifHandler = (recurse, node, place, resolve, line, column) ->
	{ test, consequent, alternate } = node

	testLoc = recurse test, line, column
	place (testLoc.line + 0), column, '#'
	place (testLoc.line + 1), column, '>'
	place (testLoc.line + 2), column, '|'

	consequentLoc = recurse consequent, (testLoc.line + 3), column
	place (testLoc.line + 1), consequentLoc.column, 'v'

	alternateLoc = recurse alternate, (testLoc.line + 3), consequentLoc.column

	jointLine = Math.max consequentLoc.line, alternateLoc.line
	place jointLine, column, 'v'
	place jointLine, consequentLoc.column, '<'

	{
		line: jointLine + 1
		column: alternateLoc.column
	}


whileHandler = (recurse, node, place, resolve, line, column) ->
	{ test, body } = node

	test1Loc = recurse test, line, column
	place (test1Loc.line + 0), column, '#'
	place (test1Loc.line + 1), column, '>'
	place (test1Loc.line + 3), column, '|'

	bodyLoc = recurse body, (test1Loc.line + 4), column
	jointColumn = Math.max test1Loc.column, bodyLoc.column

	place (test1Loc.line + 1), jointColumn, 'v'
	place (test1Loc.line + 2), jointColumn, '#'
	place (test1Loc.line + 3), jointColumn, '<'

	test2Loc = recurse test, body.line, column

	place (test2Loc.line + 0), column, '>'
	place (test2Loc.line + 1), column, 'v'

	place (test2Loc.line - 1), jointColumn, '#'
	place (test2Loc.line + 0), jointColumn, '^'
	place (test2Loc.line + 1), jointColumn, '<'

	{
		line: test2Loc.line + 2
		column: jointColumn + 1
	}


varHandler = (recurse, node, place, resolve, line, column) ->
	{ name } = node

	address = resolve name

	place (line + 0), column, '0'
	place (line + 1), column, (String address)
	place (line + 2), column, 'g'

	{
		line: line + 3
		column: column + 1
	}


numberHandler = (recurse, node, place, resolve, line, column) ->
	{ value } = node

	digits = Array.from value.toString 9

	currentLine = line
	place currentLine, column, (String digits[0])
	currentLine++

	for index in [1...digits.length]
		place (currentLine + 0), column, '9'
		place (currentLine + 1), column, '*'
		place (currentLine + 2), column, (String digits[index])
		place (currentLine + 3), column, '+'
		currentLine += 4

	{
		line: currentLine
		column: column + 1
	}


opHandler = (recurse, node, place, resolve, line, column) ->
	{ left, operator, right } = node

	leftLoc = recurse left, line, column
	rightLoc = recurse right, leftLoc.line, column
	place rightLoc.line, column, operator

	jointColumn = Math.max leftLoc.column, rightLoc.column

	{
		line: rightLoc.line + 1
		column: jointColumn + 1
	}


blockHandler = (recurse, node, place, resolve, line, column) ->
	{ statements } = node

	blockLoc = statements.reduce(
		({ currentLine, maxColumn }, statement) ->
			statementLoc = recurse statement, currentLine, column

			{
				currentLine: statementLoc.line
				maxColumn: Math.max maxColumn, statementLoc.column
			}

		{ currentLine: line, maxColumn: 0 }
	)

	{
		line: blockLoc.currentLine
		column: blockLoc.maxColumn
	}


assignmentHandler = (recurse, node, place, resolve, line, column) ->
	{ name, expression } = node

	address = resolve name

	place (line + 0), column, '0'
	place (line + 1), column, (String address)
	expressionLoc = recurse expression, (line + 2), column
	place expressionLoc.line, column, 'p'

	{
		line: expressionLoc.line + 2
		column: expressionLoc.column
	}


subHandler = (recurse, node, place, resolve, line, column) ->
	{ name, expression } = node

	expressionLoc = recurse expression, line, column

	instruction = if name == 'printChar' then ',' else '.'
	place expressionLoc.line, column, instruction

	{
		line: expressionLoc.line + 1
		column: expressionLoc.column
	}


handlers = new Map [
	['block', blockHandler]
	['if', ifHandler]
	['while', whileHandler]
	['assignment', assignmentHandler]
	['op', opHandler]
	['number', numberHandler]
	['var', varHandler]
	['sub', subHandler]
]


window.fungify ?= {}
Object.assign fungify, {
	handlers
}