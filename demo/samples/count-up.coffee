window.samples ?= {}
window.samples['count-up'] = '''
	(do
		(set! i 0)
		(while (< i 99)
			(do
				(print-int i)
				(set! i (+ i 1)))))
'''