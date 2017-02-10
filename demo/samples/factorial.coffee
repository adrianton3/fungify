window.samples ?= {}
window.samples['factorial'] = '''
	(do
		(set! p 1)
		(set! i 1)
		(while (< i 5)
			(do
				(set! p (* p i))
				(set! i (+ i 1))))
		(print-int p))
'''