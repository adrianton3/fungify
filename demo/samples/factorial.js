// Generated by CoffeeScript 1.12.3
(function() {
  if (window.samples == null) {
    window.samples = {};
  }

  window.samples['factorial'] = '(do\n	(set! p 1)\n	(set! i 1)\n	(while (< i 5)\n		(do\n			(set! p (* p i))\n			(set! i (+ i 1))))\n	(print-int p))';

}).call(this);
