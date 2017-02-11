(function() {
  'use strict';
  var PathMetrics, consumeCount, consumePair, getDepth;

  consumePair = function(consume, delta) {
    return {
      consume: consume,
      delta: delta
    };
  };

  consumeCount = new Map([[' ', consumePair(0, 0)], ['0', consumePair(0, 1)], ['1', consumePair(0, 1)], ['2', consumePair(0, 1)], ['3', consumePair(0, 1)], ['4', consumePair(0, 1)], ['5', consumePair(0, 1)], ['6', consumePair(0, 1)], ['7', consumePair(0, 1)], ['8', consumePair(0, 1)], ['9', consumePair(0, 1)], ['+', consumePair(2, -1)], ['-', consumePair(2, -1)], ['*', consumePair(2, -1)], ['/', consumePair(2, -1)], ['%', consumePair(2, -1)], ['!', consumePair(1, 0)], ['`', consumePair(2, -1)], ['^', consumePair(0, 0)], ['<', consumePair(0, 0)], ['v', consumePair(0, 0)], ['>', consumePair(0, 0)], ['?', consumePair(0, 0)], ['_', consumePair(1, -1)], ['|', consumePair(1, -1)], ['"', consumePair(0, 0)], [':', consumePair(0, 1)], ['\\', consumePair(2, 0)], ['$', consumePair(1, -1)], ['.', consumePair(1, -1)], [',', consumePair(1, -1)], ['#', consumePair(0, 0)], ['p', consumePair(3, -3)], ['g', consumePair(2, -1)], ['&', consumePair(0, 1)], ['~', consumePair(0, 1)], ['@', consumePair(0, 0)]]);

  getDepth = function(path) {
    var max, ref, sum;
    ref = path.getAsList().reduce(function(arg, arg1) {
      var char, consume, delta, max, ref, string, sum;
      max = arg.max, sum = arg.sum;
      char = arg1.char, string = arg1.string;
      ref = string ? {
        consume: 0,
        delta: 1
      } : consumeCount.has(char) ? consumeCount.get(char) : {
        consume: 0,
        delta: 0
      }, consume = ref.consume, delta = ref.delta;
      return {
        sum: sum + delta,
        max: Math.min(max, sum - consume)
      };
    }, {
      max: 0,
      sum: 0
    }), max = ref.max, sum = ref.sum;
    return {
      max: -max,
      sum: sum
    };
  };

  PathMetrics = function() {};

  Object.assign(PathMetrics, {
    getDepth: getDepth
  });

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.PathMetrics = PathMetrics;

}).call(this);

(function() {
  'use strict';
  var BasicCompiler, codeMap;

  codeMap = {
    ' ': '/*   */',
    '0': '/* 0 */  programState.push(0)',
    '1': '/* 1 */  programState.push(1)',
    '2': '/* 2 */  programState.push(2)',
    '3': '/* 3 */  programState.push(3)',
    '4': '/* 4 */  programState.push(4)',
    '5': '/* 5 */  programState.push(5)',
    '6': '/* 6 */  programState.push(6)',
    '7': '/* 7 */  programState.push(7)',
    '8': '/* 8 */  programState.push(8)',
    '9': '/* 9 */  programState.push(9)',
    '+': '/* + */  programState.push(programState.pop() + programState.pop())',
    '-': '/* - */  programState.push(-programState.pop() + programState.pop())',
    '*': '/* * */  programState.push(programState.pop() * programState.pop())',
    '/': '/* / */  programState.div(programState.pop(), programState.pop())',
    '%': '/* % */  programState.mod(programState.pop(), programState.pop())',
    '!': '/* ! */  programState.push(+!programState.pop())',
    '`': '/* ` */  programState.push(+(programState.pop() < programState.pop()))',
    '^': '/* ^ */',
    '<': '/* < */',
    'v': '/* v */',
    '>': '/* > */',
    '?': '/* ? */  /*return;*/',
    '_': '/* _ */  /*return;*/',
    '|': '/* | */  /*return;*/',
    '"': '/* " */',
    ':': '/* : */  programState.duplicate()',
    '\\': '/* \\ */  programState.swap()',
    '$': '/* $ */  programState.pop()',
    '.': '/* . */  programState.out(programState.pop())',
    ',': '/* , */  programState.out(String.fromCharCode(programState.pop()))',
    '#': '/* # */',
    'p': '/* p */  /*return;*/',
    'g': '/* g */  programState.push(programState.get(programState.pop(), programState.pop()))',
    '&': '/* & */  programState.push(programState.next())',
    '~': '/* ~ */  programState.push(programState.nextChar())',
    '@': '/* @ */  programState.exit() /*return;*/'
  };

  BasicCompiler = function() {};

  BasicCompiler.assemble = function(path, options) {
    var charList, lines, ref, ref1;
    if (options == null) {
      options = {};
    }
    charList = path.getAsList();
    lines = charList.map(function(arg) {
      var char, string;
      char = arg.char, string = arg.string;
      if (string) {
        return "/* '" + char + "' */  programState.push(" + (char.charCodeAt(0)) + ")";
      } else if (codeMap[char] != null) {
        return codeMap[char];
      } else if ((' ' <= char && char <= '~')) {
        return "/* '" + char + "' */";
      } else {
        return "/* #" + (char.charCodeAt(0)) + " */";
      }
    });
    if ((ref = (ref1 = path.ending) != null ? ref1.char : void 0) === '|' || ref === '_') {
      return (lines.join('\n')) + "\nbranchFlag = programState.pop()";
    } else {
      return lines.join('\n');
    }
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.BasicCompiler = BasicCompiler;

}).call(this);

(function() {
  'use strict';
  var BinaryCompiler, assemble, generateCode, generateTree, getDepth;

  getDepth = bef.PathMetrics.getDepth;

  generateTree = function(codes, id) {
    var generate;
    generate = function(from, to) {
      var mid;
      if (from >= to) {
        return codes[from];
      } else {
        mid = Math.floor((from + to) / 2);
        return "if (length_" + id + " < " + (mid + 1) + ") {\n	" + (generate(from, mid)) + "\n} else {\n	" + (generate(mid + 1, to)) + "\n}";
      }
    };
    if (codes.length === 0) {
      return '';
    } else if (codes.length === 1) {
      return codes[0];
    } else {
      return "const length_" + id + " = programState.getLength()\nif (length_" + id + " < " + (codes.length - 1) + ") {\n	" + (generate(0, codes.length - 2)) + "\n} else {\n	" + codes[codes.length - 1] + "\n}";
    }
  };

  generateCode = function(path, maxDepth, options) {
    var charList, codeMap, makeStack, ref, stack;
    ref = window.bef.StackingCompiler, makeStack = ref.makeStack, codeMap = ref.codeMap;
    charList = path.getAsList();
    stack = makeStack(path.id + "_" + maxDepth, path.ending, Object.assign({
      popMethod: 'popUnsafe',
      freePops: maxDepth
    }, options));
    charList.forEach(function(entry, i) {
      var codeGenerator;
      if (entry.string) {
        stack.push(entry.char.charCodeAt(0));
      } else {
        codeGenerator = codeMap[entry.char];
        if (codeGenerator != null) {
          codeGenerator(stack);
        }
      }
    });
    return stack.stringify();
  };

  assemble = function(path, options) {
    var codes, depth, max;
    if (options == null) {
      options = {};
    }
    max = getDepth(path).max;
    codes = (function() {
      var j, ref, results;
      results = [];
      for (depth = j = 0, ref = max; 0 <= ref ? j <= ref : j >= ref; depth = 0 <= ref ? ++j : --j) {
        results.push(generateCode(path, depth, options));
      }
      return results;
    })();
    return generateTree(codes, path.id);
  };

  BinaryCompiler = function() {};

  Object.assign(BinaryCompiler, {
    generateTree: generateTree,
    assemble: assemble
  });

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.BinaryCompiler = BinaryCompiler;

}).call(this);

(function() {
  'use strict';
  var OptimizingCompiler, binaryOperator, codeMap, digitPusher, isNumber;

  isNumber = function(obj) {
    return typeof obj === 'number';
  };

  digitPusher = function(digit) {
    return function(stack) {
      stack.push(digit);
      return "/* " + digit + " */";
    };
  };

  binaryOperator = function(operatorFunction, operatorChar, stringFunction) {
    return function(stack) {
      var operand1, operand2;
      operand1 = stack.length ? stack.pop() : 'programState.pop()';
      operand2 = stack.length ? stack.pop() : 'programState.pop()';
      if ((isNumber(operand1)) && (isNumber(operand2))) {
        stack.push(operatorFunction(operand1, operand2));
        return "/* " + operatorChar + " */";
      } else {
        return "/* " + operatorChar + " */  " + (stringFunction(operand1, operand2));
      }
    };
  };

  codeMap = {
    ' ': function() {
      return '/*   */';
    },
    '0': digitPusher(0),
    '1': digitPusher(1),
    '2': digitPusher(2),
    '3': digitPusher(3),
    '4': digitPusher(4),
    '5': digitPusher(5),
    '6': digitPusher(6),
    '7': digitPusher(7),
    '8': digitPusher(8),
    '9': digitPusher(9),
    '+': binaryOperator((function(o1, o2) {
      return o1 + o2;
    }), '+', function(o1, o2) {
      return "programState.push(" + o1 + " + " + o2 + ")";
    }),
    '-': binaryOperator((function(o1, o2) {
      return o2 - o1;
    }), '-', function(o1, o2) {
      return "programState.push(- " + o1 + " + " + o2 + ")";
    }),
    '*': binaryOperator((function(o1, o2) {
      return o1 * o2;
    }), '*', function(o1, o2) {
      return "programState.push(" + o1 + " * " + o2 + ")";
    }),
    '/': binaryOperator((function(o1, o2) {
      return Math.floor(o2 / o1);
    }), '/', function(o1, o2) {
      return "programState.div(" + o1 + ", " + o2 + ")";
    }),
    '%': binaryOperator((function(o1, o2) {
      return o2 % o1;
    }), '%', function(o1, o2) {
      return "programState.mod(" + o1 + ", " + o2 + ")";
    }),
    '!': function(stack) {
      if (stack.length) {
        stack.push(+(!stack.pop()));
        return '/* ! */';
      } else {
        return '/* ! */  programState.push(+!programState.pop())';
      }
    },
    '`': binaryOperator((function(o1, o2) {
      return +(o1 < o2);
    }), '`', function(o1, o2) {
      return "programState.push(+(" + o1 + " < " + o2 + "))";
    }),
    '^': function() {
      return '/* ^ */';
    },
    '<': function() {
      return '/* < */';
    },
    'v': function() {
      return '/* v */';
    },
    '>': function() {
      return '/* > */';
    },
    '?': function() {
      return '/* ? */  /*return;*/';
    },
    '_': function() {
      return '/* _ */  /*return;*/';
    },
    '|': function() {
      return '/* | */  /*return;*/';
    },
    '"': function() {
      return '/* " */';
    },
    ':': function(stack) {
      if (stack.length) {
        stack.push(stack[stack.length - 1]);
        return '/* : */';
      } else {
        return '/* : */  programState.duplicate()';
      }
    },
    '\\': function(stack) {
      var e1, e2;
      if (stack.length > 1) {
        e1 = stack[stack.length - 1];
        e2 = stack[stack.length - 2];
        stack[stack.length - 1] = e2;
        stack[stack.length - 2] = e1;
        return '/* \\ */';
      } else if (stack.length > 0) {
        return "/* \\ */  programState.push(" + (stack.pop()) + ", programState.pop())";
      } else {
        return '/* \\ */  programState.swap()';
      }
    },
    '$': function(stack) {
      if (stack.length) {
        stack.pop();
        return '/* $ */';
      } else {
        return '/* $ */  programState.pop()';
      }
    },
    '.': function(stack) {
      if (stack.length) {
        return "/* . */  programState.out(" + (stack.pop()) + ")";
      } else {
        return '/* . */  programState.out(programState.pop())';
      }
    },
    ',': function(stack) {
      if (stack.length > 0) {
        return "/* , */  programState.out(String.fromCharCode(" + (stack.pop()) + "))";
      } else {
        return '/* , */  programState.out(String.fromCharCode(programState.pop()))';
      }
    },
    '#': function() {
      return '/* # */';
    },
    'p': function() {
      return '';
    },
    'g': function(stack) {
      var operand1, operand2, stringedStack;
      operand1 = stack.length ? stack.pop() : 'programState.pop()';
      operand2 = stack.length ? stack.pop() : 'programState.pop()';
      if (stack.length) {
        stringedStack = stack.join(', ');
        stack.length = 0;
        return "/* g */\nprogramState.push(" + stringedStack + ");\nprogramState.push(programState.get(" + operand1 + ", " + operand2 + "));";
      } else {
        return "/* g */  programState.push(programState.get(" + operand1 + ", " + operand2 + "));";
      }
    },
    '&': function() {
      return '/* & */  programState.push(programState.next())';
    },
    '~': function() {
      return '/* ~ */  programState.push(programState.nextChar())';
    },
    '@': function() {
      return '/* @ */  programState.exit(); /*return;*/';
    }
  };

  OptimizingCompiler = function() {};

  OptimizingCompiler.assemble = function(path, options) {
    var charList, last, lines, ref, ref1, stack;
    if (options == null) {
      options = {};
    }
    charList = path.getAsList();
    stack = [];
    lines = charList.map(function(arg) {
      var char, codeGenerator, ret, string;
      char = arg.char, string = arg.string;
      if (string) {
        stack.push(char.charCodeAt(0));
        return "/* '" + char + "' */";
      } else {
        codeGenerator = codeMap[char];
        if (codeGenerator != null) {
          ret = '';
          if (char === '&' || char === '~') {
            if (stack.length) {
              ret += "programState.push(" + (stack.join(', ')) + ");\n";
            }
            stack = [];
          }
          ret += codeGenerator(stack);
          return ret;
        } else if ((' ' <= char && char <= '~')) {
          return "/* '" + char + "' */";
        } else {
          return "/* #" + (char.charCodeAt(0)) + " */";
        }
      }
    });
    if ((ref = (ref1 = path.ending) != null ? ref1.char : void 0) === '|' || ref === '_') {
      if (stack.length === 0) {
        lines.push("branchFlag = programState.pop()");
      } else if (stack.length === 1) {
        lines.push("branchFlag = " + stack[0]);
      } else {
        last = stack.pop();
        lines.push("programState.push(" + (stack.join(', ')) + ")", "branchFlag = " + last);
      }
    } else {
      if (stack.length > 0) {
        lines.push("programState.push(" + (stack.join(', ')) + ")");
      }
    }
    return lines.join('\n');
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.OptimizingCompiler = OptimizingCompiler;

}).call(this);

(function() {
  'use strict';
  var StackingCompiler, assemble, assembleTight, binaryOperator, codeMap, digitPusher, getDepth, isNumber, makeStack, writeBack;

  getDepth = bef.PathMetrics.getDepth;

  isNumber = function(obj) {
    return typeof obj === 'number';
  };

  digitPusher = function(digit) {
    return function(stack) {
      stack.push(digit);
    };
  };

  binaryOperator = function(operatorFunction, operatorChar, stringFunction) {
    return function(stack) {
      var fun, operand1, operand2;
      operand1 = stack.pop();
      operand2 = stack.pop();
      fun = (isNumber(operand1)) && (isNumber(operand2)) ? operatorFunction : stringFunction;
      stack.push(fun(operand1, operand2));
    };
  };

  codeMap = {
    ' ': function() {},
    '0': digitPusher(0),
    '1': digitPusher(1),
    '2': digitPusher(2),
    '3': digitPusher(3),
    '4': digitPusher(4),
    '5': digitPusher(5),
    '6': digitPusher(6),
    '7': digitPusher(7),
    '8': digitPusher(8),
    '9': digitPusher(9),
    '+': binaryOperator((function(o1, o2) {
      return o2 + o1;
    }), '+', function(o1, o2) {
      return "(" + o2 + " + " + o1 + ")";
    }),
    '-': binaryOperator((function(o1, o2) {
      return o2 - o1;
    }), '-', function(o1, o2) {
      return "(" + o2 + " - " + o1 + ")";
    }),
    '*': binaryOperator((function(o1, o2) {
      return o2 * o1;
    }), '*', function(o1, o2) {
      return "(" + o2 + " * " + o1 + ")";
    }),
    '/': binaryOperator((function(o1, o2) {
      return Math.floor(o2 / o1);
    }), '/', function(o1, o2) {
      return "Math.floor(" + o2 + " / " + o1 + ")";
    }),
    '%': binaryOperator((function(o1, o2) {
      return o2 % o1;
    }), '%', function(o1, o2) {
      return "(" + o2 + " % " + o1 + ")";
    }),
    '!': function(stack) {
      var operand;
      operand = stack.pop();
      stack.push(isNumber(operand) ? +(!operand) : "(+!" + operand + ")");
    },
    '`': binaryOperator((function(o1, o2) {
      return +(o1 < o2);
    }), '`', function(o1, o2) {
      return "(+(" + o1 + " < " + o2 + "))";
    }),
    '^': function() {},
    '<': function() {},
    'v': function() {},
    '>': function() {},
    '?': function() {},
    '_': function() {},
    '|': function() {},
    '"': function() {},
    ':': function(stack) {
      var top;
      top = stack.peek();
      stack.push(top);
    },
    '\\': function(stack) {
      var e1, e2;
      e1 = stack.pop();
      e2 = stack.pop();
      stack.push(e1, e2);
    },
    '$': function(stack) {
      stack.pop();
    },
    '.': function(stack) {
      stack.out("programState.out(" + (stack.pop()) + ")");
    },
    ',': function(stack) {
      stack.out("programState.out(String.fromCharCode(" + (stack.pop()) + "))");
    },
    '#': function() {},
    'p': function() {
      return '';
    },
    'g': function(stack) {
      stack.push("programState.get(" + (stack.pop()) + ", " + (stack.pop()) + ")");
    },
    '&': function(stack) {
      stack.push(stack.next());
    },
    '~': function(stack) {
      stack.push(stack.nextChar());
    },
    '@': function(stack) {
      stack.exit();
    }
  };

  makeStack = function(uid, ending, options) {
    var declarations, exitRequest, freePops, makeNext, popCount, popMethod, pushBack, pushCount, reads, ref, ref1, ref2, ref3, stack, stackObj, writes;
    if (options == null) {
      options = {};
    }
    popMethod = (ref = options.popMethod) != null ? ref : 'pop';
    freePops = (ref1 = options.freePops) != null ? ref1 : Infinity;
    popCount = (ref2 = options.popCount) != null ? ref2 : 0;
    pushCount = (ref3 = options.pushCount) != null ? ref3 : 0;
    stack = [];
    declarations = [];
    reads = [];
    writes = [];
    exitRequest = false;
    stackObj = {};
    stackObj.push = function() {
      Array.prototype.push.apply(stack, arguments);
    };
    stackObj.pop = function() {
      var name;
      if (stack.length > 0) {
        return stack.pop();
      } else if (freePops <= 0) {
        return 0;
      } else {
        freePops--;
        name = "p" + uid + "_" + declarations.length;
        declarations.push(popCount > 0 ? "var " + name + " = t" + uid + "_" + (popCount - 1) : "var " + name + " = programState." + popMethod + "()");
        popCount = Math.max(0, popCount - 1);
        return name;
      }
    };
    stackObj.peek = function() {
      var name;
      if (stack.length > 0) {
        return stack[stack.length - 1];
      } else {
        name = "p" + uid + "_" + declarations.length;
        declarations.push(popCount > 0 ? "var " + name + " = t" + uid + "_" + (popCount - 1) : "var " + name + " = programState.peek()");
        return name;
      }
    };
    makeNext = function(methodName) {
      return function() {
        var name;
        name = "r" + uid + "_" + reads.length;
        reads.push("var " + name + " = programState." + methodName + "()");
        return name;
      };
    };
    stackObj.next = makeNext('next');
    stackObj.nextChar = makeNext('nextChar');
    stackObj.out = function(entry) {
      writes.push(entry);
    };
    pushBack = function(stack, pushCount) {
      var copies, i, pushes;
      copies = (function() {
        var j, ref4, results;
        results = [];
        for (i = j = 0, ref4 = pushCount; 0 <= ref4 ? j < ref4 : j > ref4; i = 0 <= ref4 ? ++j : --j) {
          results.push("t" + uid + "_" + i + " = " + stack[i]);
        }
        return results;
      })();
      if (pushCount < stack.length) {
        pushes = stack.slice(pushCount);
        return (copies.join('\n')) + "\nstack.push(" + (pushes.join(', ')) + ")";
      } else {
        return copies.join('\n');
      }
    };
    stackObj.stringify = function() {
      var last, ref4, stackChunk;
      stackChunk = (ref4 = ending != null ? ending.char : void 0) === '|' || ref4 === '_' ? stack.length === 0 ? "branchFlag = " + (this.pop()) + ";" : stack.length === 1 ? "branchFlag = " + stack[0] + ";" : (last = stack.pop(), (pushBack(stack, pushCount)) + "\nbranchFlag = " + last) : stack.length === 0 ? '' : pushBack(stack, pushCount);
      return (declarations.join('\n')) + "\n" + (reads.join('\n')) + "\n" + stackChunk + "\n" + (writes.join('\n')) + "\n" + (exitRequest ? 'programState.exit()' : '');
    };
    stackObj.exit = function() {
      return exitRequest = true;
    };
    return stackObj;
  };

  assemble = function(path, options) {
    var charList, stack;
    charList = path.getAsList();
    stack = makeStack(path.id, path.ending, options);
    charList.forEach(function(entry) {
      var codeGenerator;
      if (entry.string) {
        stack.push(entry.char.charCodeAt(0));
      } else {
        codeGenerator = codeMap[entry.char];
        if (codeGenerator != null) {
          codeGenerator(stack);
        }
      }
    });
    return stack.stringify();
  };

  writeBack = function(count, uid) {
    var i, temps;
    temps = (function() {
      var j, ref, results;
      results = [];
      for (i = j = 0, ref = count; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
        results.push("t" + uid + "_" + i);
      }
      return results;
    })();
    return "stack.push(" + (temps.join(', ')) + ")";
  };

  assembleTight = function(path, options) {
    var max, popCount, pushCount, ref, sum, tempCount;
    ref = getDepth(path), max = ref.max, sum = ref.sum;
    tempCount = Math.min(max, max + sum);
    if (tempCount <= 0) {
      return assemble(path, options);
    } else {
      pushCount = tempCount;
      popCount = tempCount;
      return {
        pre: assemble(path, Object.assign({
          pushCount: pushCount
        }, options)),
        body: assemble(path, Object.assign({
          popCount: popCount,
          pushCount: pushCount
        }, options)),
        post: writeBack(tempCount, path.id)
      };
    }
  };

  StackingCompiler = function() {};

  Object.assign(StackingCompiler, {
    codeMap: codeMap,
    makeStack: makeStack,
    assemble: assemble,
    assembleTight: assembleTight
  });

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.StackingCompiler = StackingCompiler;

}).call(this);

(function() {
  'use strict';
  var EMPTY, List;

  EMPTY = {
    find: function() {
      return null;
    },
    con: function(value) {
      return new List(value, EMPTY);
    }
  };

  List = function(value1, next) {
    this.value = value1;
    this.next = next != null ? next : EMPTY;
  };

  List.prototype.find = function(value) {
    if (this.value === value) {
      return this;
    } else {
      return this.next.find(value);
    }
  };

  List.prototype.con = function(value) {
    return new List(value, this);
  };

  List.EMPTY = EMPTY;

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.List = List;

}).call(this);

(function() {
  'use strict';
  var Path, getHash, getId, idCounter;

  idCounter = 0;

  getId = function() {
    return idCounter++;
  };

  getHash = function(x, y, dir, string) {
    return x + "_" + y + "_" + dir + (string ? '_s' : '');
  };

  Path = function(list) {
    if (list == null) {
      list = [];
    }
    this.id = getId();
    this.entries = {};
    this.list = [];
    this.looping = false;
    list.forEach((function(_this) {
      return function(entry) {
        return _this.push(entry.x, entry.y, entry.dir, entry.char, entry.string);
      };
    })(this));
  };

  Path.prototype.push = function(x, y, dir, char, string) {
    var hash;
    if (string == null) {
      string = false;
    }
    hash = getHash(x, y, dir, string);
    this.entries[hash] = {
      char: char,
      index: this.list.length,
      string: string
    };
    return this.list.push({
      x: x,
      y: y,
      dir: dir,
      char: char,
      string: string
    });
  };

  Path.prototype.prefix = function(length) {
    var prefixList;
    prefixList = this.list.slice(0, length);
    return new Path(prefixList);
  };

  Path.prototype.suffix = function(length) {
    var suffixList;
    suffixList = this.list.slice(length);
    return new Path(suffixList);
  };

  Path.prototype.has = function(x, y, dir) {
    var hash1, hash2;
    hash1 = getHash(x, y, dir);
    hash2 = getHash(x, y, dir, true);
    return (this.entries[hash1] != null) || (this.entries[hash2] != null);
  };

  Path.prototype.hasNonString = function(x, y, dir) {
    var hash;
    hash = getHash(x, y, dir);
    return this.entries[hash] != null;
  };

  Path.prototype.getEntryAt = function(x, y, dir) {
    var hash;
    hash = getHash(x, y, dir);
    return this.entries[hash];
  };

  Path.prototype.getLastEntryThrough = function(x, y) {
    var lastEntry, max, possibleEntries;
    possibleEntries = [getHash(x, y, '^'), getHash(x, y, '<'), getHash(x, y, 'V'), getHash(x, y, '>'), getHash(x, y, '^', true), getHash(x, y, '<', true), getHash(x, y, 'V', true), getHash(x, y, '>', true)];
    max = -1;
    lastEntry = null;
    possibleEntries.forEach((function(_this) {
      return function(hash) {
        var entry;
        entry = _this.entries[hash];
        if ((entry != null ? entry.index : void 0) > max) {
          max = entry.index;
          return lastEntry = entry;
        }
      };
    })(this));
    return lastEntry;
  };

  Path.prototype.getAsList = function() {
    return this.list.slice(0);
  };

  Path.prototype.getEndPoint = function() {
    var lastEntry;
    lastEntry = this.list[this.list.length - 1];
    return {
      x: lastEntry.x,
      y: lastEntry.y,
      dir: lastEntry.dir
    };
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.Path = Path;

}).call(this);

(function() {
  'use strict';
  var PathFinder, findPath;

  findPath = function(playfield, start) {
    var currentChar, initialPath, loopingPath, path, pointer, splitPosition;
    path = new bef.Path();
    pointer = start.clone();
    while (true) {
      currentChar = playfield.getAt(pointer.x, pointer.y);
      if (currentChar === '"') {
        path.push(pointer.x, pointer.y, pointer.dir, currentChar);
        while (true) {
          pointer.advance();
          currentChar = playfield.getAt(pointer.x, pointer.y);
          if (currentChar === '"') {
            path.push(pointer.x, pointer.y, pointer.dir, currentChar);
            break;
          }
          path.push(pointer.x, pointer.y, pointer.dir, currentChar, true);
        }
        pointer.advance();
        continue;
      }
      pointer.turn(currentChar);
      if (path.hasNonString(pointer.x, pointer.y, pointer.dir)) {
        splitPosition = (path.getEntryAt(pointer.x, pointer.y, pointer.dir)).index;
        if (splitPosition > 0) {
          initialPath = path.prefix(splitPosition);
          loopingPath = path.suffix(splitPosition);
          loopingPath.looping = true;
          return {
            type: 'composed',
            initialPath: initialPath,
            loopingPath: loopingPath
          };
        } else {
          path.looping = true;
          return {
            type: 'looping',
            loopingPath: path
          };
        }
      }
      path.push(pointer.x, pointer.y, pointer.dir, currentChar);
      if (currentChar === '|' || currentChar === '_' || currentChar === '?' || currentChar === '@' || currentChar === 'p') {
        path.ending = {
          x: pointer.x,
          y: pointer.y,
          dir: pointer.dir,
          char: currentChar
        };
        return {
          type: 'simple',
          path: path
        };
      }
      if (currentChar === '#') {
        pointer.advance();
      }
      pointer.advance();
    }
  };

  PathFinder = function() {};

  Object.assign(PathFinder, {
    findPath: findPath
  });

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.PathFinder = PathFinder;

}).call(this);

(function() {
  'use strict';
  var PathSet, getHashAny, getHashDir;

  getHashAny = function(x, y) {
    return x + "_" + y;
  };

  getHashDir = function(x, y, dir) {
    return x + "_" + y + "_" + dir;
  };

  PathSet = function() {
    this.map = new Map;
  };

  PathSet.prototype.add = function(path) {
    var hash, head, ref;
    head = path.list[0];
    hash = (ref = head.char) === '^' || ref === '<' || ref === 'v' || ref === '>' ? getHashAny(head.x, head.y) : getHashDir(head.x, head.y, head.dir);
    this.map.set(hash, path);
    return this;
  };

  PathSet.prototype.getStartingFrom = function(x, y, dir) {
    var hashAny, hashDir;
    hashDir = getHashDir(x, y, dir);
    if (this.map.has(hashDir)) {
      return this.map.get(hashDir);
    } else {
      hashAny = getHashAny(x, y);
      return this.map.get(hashAny);
    }
  };

  PathSet.prototype.remove = function(path) {
    var hash, head, ref;
    head = path.list[0];
    hash = (ref = head.char) === '^' || ref === '<' || ref === 'v' || ref === '>' ? getHashAny(head.x, head.y) : getHashDir(head.x, head.y, head.dir);
    this.map["delete"](hash);
    return this;
  };

  PathSet.prototype.clear = function() {
    this.map.clear();
    return this;
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.PathSet = PathSet;

}).call(this);

(function() {
  'use strict';
  var Playfield, initField, initPathPlane, initSize;

  Playfield = function(string, size) {
    var lines, ref;
    lines = string.split('\n');
    ref = initSize(lines, size), this.width = ref[0], this.height = ref[1];
    this.field = initField(lines, this.width, this.height);
    this.pathPlane = initPathPlane(this.width, this.height);
  };

  initSize = function(lines, size) {
    if (size != null) {
      return [size.width, size.height];
    } else {
      return [
        Math.max.apply(Math, lines.map(function(line) {
          return line.length;
        })), lines.length
      ];
    }
  };

  initField = function(lines, width, height) {
    var chars, field, i, iLimit, j, k, l, line, ref, ref1, ref2;
    field = [];
    i = 0;
    iLimit = Math.min(lines.length, height);
    while (i < iLimit) {
      line = lines[i];
      chars = line.split('');
      chars.splice(width, chars.length);
      for (j = k = ref = chars.length, ref1 = width; ref <= ref1 ? k < ref1 : k > ref1; j = ref <= ref1 ? ++k : --k) {
        chars.push(' ');
      }
      field.push(chars);
      i++;
    }
    i = lines.length;
    iLimit = height;
    while (i < iLimit) {
      line = [];
      for (j = l = 0, ref2 = width; 0 <= ref2 ? l < ref2 : l > ref2; j = 0 <= ref2 ? ++l : --l) {
        line.push(' ');
      }
      field.push(line);
      i++;
    }
    return field;
  };

  initPathPlane = function(width, height) {
    var i, j, k, l, line, pathPlane, ref, ref1;
    pathPlane = [];
    for (i = k = 1, ref = height; 1 <= ref ? k <= ref : k >= ref; i = 1 <= ref ? ++k : --k) {
      line = [];
      for (j = l = 1, ref1 = width; 1 <= ref1 ? l <= ref1 : l >= ref1; j = 1 <= ref1 ? ++l : --l) {
        line.push(new Map);
      }
      pathPlane.push(line);
    }
    return pathPlane;
  };

  Playfield.prototype.getAt = function(x, y) {
    return this.field[y][x];
  };

  Playfield.prototype.setAt = function(x, y, char) {
    this.field[y][x] = char;
    return this;
  };

  Playfield.prototype.addPath = function(path) {
    path.list.forEach(function(entry) {
      var cell;
      cell = this.pathPlane[entry.y][entry.x];
      cell.set(path.id, path);
    }, this);
    return this;
  };

  Playfield.prototype.isInside = function(x, y) {
    return (0 <= x && x < this.width) && (0 <= y && y < this.height);
  };

  Playfield.prototype.getPathsThrough = function(x, y) {
    return Array.from(this.pathPlane[y][x].values());
  };

  Playfield.prototype.removePath = function(path) {
    path.list.forEach((function(_this) {
      return function(entry) {
        var cell;
        cell = _this.pathPlane[entry.y][entry.x];
        cell["delete"](path.id);
      };
    })(this));
  };

  Playfield.prototype.getSize = function() {
    return {
      width: this.width,
      height: this.height
    };
  };

  Playfield.prototype.clearPaths = function() {
    var i, j, k, l, ref, ref1;
    for (i = k = 0, ref = this.height; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      for (j = l = 0, ref1 = this.width; 0 <= ref1 ? l < ref1 : l > ref1; j = 0 <= ref1 ? ++l : --l) {
        this.pathPlane[i][j] = new Map;
      }
    }
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.Playfield = Playfield;

}).call(this);

(function() {
  'use strict';
  var Pointer, dirTable;

  dirTable = new Map([
    [
      '^', {
        x: 0,
        y: -1
      }
    ], [
      '<', {
        x: -1,
        y: 0
      }
    ], [
      'v', {
        x: 0,
        y: 1
      }
    ], [
      '>', {
        x: 1,
        y: 0
      }
    ]
  ]);

  Pointer = function(x, y, dir, space) {
    this.x = x;
    this.y = y;
    this.space = space;
    this._updateDir(dir);
  };

  Pointer.prototype.clone = function() {
    return new Pointer(this.x, this.y, this.dir, this.space);
  };

  Pointer.prototype._updateDir = function(dir) {
    var entry;
    this.dir = dir;
    entry = dirTable.get(dir);
    this.ax = entry.x;
    return this.ay = entry.y;
  };

  Pointer.prototype.turn = function(dir) {
    if ((dirTable.has(dir)) && (dir !== this.dir)) {
      this._updateDir(dir);
    }
    return this;
  };

  Pointer.prototype.advance = function() {
    this.x = (this.x + this.ax + this.space.width) % this.space.width;
    this.y = (this.y + this.ay + this.space.height) % this.space.height;
    return this;
  };

  Pointer.prototype.set = function(x, y, dir) {
    this.x = x;
    this.y = y;
    this._updateDir(dir);
    return this;
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.Pointer = Pointer;

}).call(this);

(function() {
  'use strict';
  var ProgramState;

  ProgramState = function(interpreter) {
    this.interpreter = interpreter;
    this.stack = [];
    this.flags = {
      pathInvalidatedAhead: false
    };
    this.inputPointer = 0;
    this.inputList = [];
    this.outRecord = [];
    this.checks = 0;
    this.maxChecks = Infinity;
  };

  ProgramState.prototype.getLength = function() {
    return this.stack.length;
  };

  ProgramState.prototype.push = function() {
    this.stack.push.apply(this.stack, arguments);
  };

  ProgramState.prototype.pop = function() {
    if (this.stack.length < 1) {
      return 0;
    }
    return this.stack.pop();
  };

  ProgramState.prototype.popUnsafe = function() {
    return this.stack.pop();
  };

  ProgramState.prototype.peek = function() {
    if (this.stack.length < 1) {
      return 0;
    }
    return this.stack[this.stack.length - 1];
  };

  ProgramState.prototype.out = function(e) {
    return this.outRecord.push(e);
  };

  ProgramState.prototype.setInput = function(values) {
    this.inputList = values.slice(0);
    return this.inputPointer = 0;
  };

  ProgramState.prototype.next = function() {
    var ret;
    if (this.inputPointer < this.inputList.length) {
      ret = parseInt(this.inputList[this.inputPointer], 10);
      this.inputPointer++;
      return ret;
    } else {
      return 0;
    }
  };

  ProgramState.prototype.nextChar = function() {
    var ret;
    if (this.inputPointer < this.inputList.length) {
      ret = this.inputList[this.inputPointer].charCodeAt(0);
      this.inputPointer++;
      return ret;
    } else {
      return 0;
    }
  };

  ProgramState.prototype.put = function(e, y, x, currentX, currentY, currentDir, index, from, to) {
    return this.interpreter.put(x, y, String.fromCharCode(e), currentX, currentY, currentDir, index, from, to);
  };

  ProgramState.prototype.get = function(y, x) {
    return this.interpreter.get(x, y);
  };

  ProgramState.prototype.div = function(a, b) {
    this.push(Math.floor(b / a));
  };

  ProgramState.prototype.mod = function(a, b) {
    this.push(b % a);
  };

  ProgramState.prototype.duplicate = function() {
    this.stack.push(this.peek());
  };

  ProgramState.prototype.swap = function() {
    var e1, e2;
    if (this.stack.length >= 2) {
      e1 = this.stack[this.stack.length - 1];
      e2 = this.stack[this.stack.length - 2];
      this.stack[this.stack.length - 1] = e2;
      this.stack[this.stack.length - 2] = e1;
    } else if (this.stack.length === 1) {
      this.stack.push(0);
    } else {
      this.stack.push(0, 0);
    }
  };

  ProgramState.prototype.randInt = function(max) {
    return Math.floor(Math.random() * max);
  };

  ProgramState.prototype.exit = function() {
    return this.flags.exitRequest = true;
  };

  ProgramState.prototype.isAlive = function() {
    if (this.flags.exitRequest) {
      return false;
    }
    this.checks++;
    return this.checks < this.maxChecks;
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.ProgramState = ProgramState;

}).call(this);

(function() {
  'use strict';
  var EagerRuntime, canReach, findPath, getHash, getPointer, registerGraph;

  findPath = bef.PathFinder.findPath;

  EagerRuntime = function() {
    this.playfield = null;
    this.pathSet = null;
    this.stats = {
      compileCalls: 0,
      jumpsPerformed: 0
    };
  };

  canReach = function(graph, start, targets) {
    var traverse, visited;
    visited = new Set;
    traverse = function(start) {
      if (targets.has(start)) {
        return true;
      }
      if (visited.has(start)) {
        return false;
      }
      visited.add(start);
      return graph[start].some(function(arg) {
        var to;
        to = arg.to;
        return traverse(to);
      });
    };
    return traverse(start);
  };

  EagerRuntime.prototype.put = function(x, y, e, currentX, currentY, currentDir, from, to) {
    var paths, targets;
    if (!this.playfield.isInside(x, y)) {
      return;
    }
    paths = this.playfield.getPathsThrough(x, y);
    paths.forEach((function(_this) {
      return function(path) {
        _this.pathSet.remove(path);
        _this.playfield.removePath(path);
      };
    })(this));
    this.playfield.setAt(x, y, e);
    if (paths.length > 0) {
      targets = paths.reduce(function(targets, path) {
        targets.add(path.from);
        return targets;
      }, new Set);
      if (canReach(this.graph, to, targets)) {
        this.programState.flags.pathInvalidatedAhead = true;
        this.programState.flags.exitPoint = {
          x: currentX,
          y: currentY,
          dir: currentDir
        };
      }
    }
  };

  EagerRuntime.prototype.get = function(x, y) {
    var char;
    if (!this.playfield.isInside(x, y)) {
      return 0;
    }
    char = this.playfield.getAt(x, y);
    return char.charCodeAt(0);
  };

  getHash = function(pointer) {
    return pointer.x + "_" + pointer.y;
  };

  getPointer = function(point, space, dir) {
    var pointer;
    pointer = new bef.Pointer(point.x, point.y, dir, space);
    return pointer.advance();
  };

  EagerRuntime.prototype.buildGraph = function(start) {
    var buildEdge, dispatch, graph, hash;
    graph = {};
    dispatch = (function(_this) {
      return function(hash, destination) {
        var currentChar, partial;
        currentChar = _this.playfield.getAt(destination.x, destination.y);
        partial = getPointer.bind(null, destination, _this.playfield.getSize());
        switch (currentChar) {
          case '_':
            buildEdge(hash, partial('<'));
            buildEdge(hash, partial('>'));
            break;
          case '|':
            buildEdge(hash, partial('^'));
            buildEdge(hash, partial('v'));
            break;
          case '?':
            buildEdge(hash, partial('^'));
            buildEdge(hash, partial('v'));
            buildEdge(hash, partial('<'));
            buildEdge(hash, partial('>'));
            break;
          case 'p':
            buildEdge(hash, partial(destination.dir));
        }
      };
    })(this);
    buildEdge = (function(_this) {
      return function(hash, pointer) {
        var destination, newHash, newPath, ref, ref1, ref2, ref3;
        newPath = findPath(_this.playfield, pointer);
        if ((ref = newPath.path) != null) {
          ref.from = hash;
        }
        if ((ref1 = newPath.initialPath) != null) {
          ref1.from = hash;
        }
        if ((ref2 = newPath.loopingPath) != null) {
          ref2.from = hash;
        }
        if ((ref3 = newPath.path) != null) {
          ref3.to = getHash(newPath.path.getEndPoint());
        }
        if (newPath.type !== 'simple') {
          graph[hash].push({
            path: newPath,
            to: null
          });
        } else {
          destination = newPath.path.getAsList().length > 0 ? newPath.path.getEndPoint() : pointer;
          newHash = getHash(destination);
          graph[hash].push({
            path: newPath,
            to: newHash
          });
          if (graph[newHash] != null) {
            return;
          }
          graph[newHash] = [];
          dispatch(newHash, destination);
        }
      };
    })(this);
    hash = 'start';
    graph[hash] = [];
    buildEdge(hash, start);
    return graph;
  };

  EagerRuntime.prototype.compile = function(graph, options) {
    var assemble, assembleTight, ref;
    ref = options.compiler, assemble = ref.assemble, assembleTight = ref.assembleTight;
    (Object.keys(graph)).forEach(function(nodeName) {
      var edges;
      edges = graph[nodeName];
      return edges.forEach(function(edge) {
        var path, ref1, type;
        path = edge.path, (ref1 = edge.path, type = ref1.type);
        switch (type) {
          case 'composed':
            return edge.assemble = function() {
              return (assemble(path.initialPath, options)) + "\nwhile (programState.isAlive()) {\n	" + (assemble(path.loopingPath, options)) + "\n}";
            };
          case 'looping':
            return edge.assemble = function() {
              return "while (programState.isAlive()) {\n	" + (assemble(path.loopingPath, options)) + "\n}";
            };
          case 'simple':
            edge.assemble = function() {
              return assemble(path.path, options);
            };
            if (assembleTight != null) {
              return edge.assembleTight = function() {
                return assembleTight(path.path, options);
              };
            }
        }
      });
    });
    this.code = bef.GraphCompiler.assemble({
      start: 'start',
      nodes: graph
    }, options);
    return new Function('programState', this.code);
  };

  registerGraph = function(graph, playfield, pathSet) {
    playfield.clearPaths();
    pathSet.clear();
    (Object.keys(graph)).forEach(function(node) {
      var edges;
      edges = graph[node];
      edges.forEach(function(arg) {
        var path;
        path = arg.path;
        if (path.type === 'simple') {
          pathSet.add(path.path);
          playfield.addPath(path.path);
        } else if (path.type === 'looping') {
          pathSet.add(path.loopingPath);
          playfield.addPath(path.loopingPath);
        } else if (path.type === 'composed') {
          pathSet.add(path.loopingPath);
          pathSet.add(path.initialPath);
          playfield.addPath(path.loopingPath);
          playfield.addPath(path.initialPath);
        }
      });
    });
  };

  EagerRuntime.prototype.execute = function(playfield1, options, input) {
    var dir, program, ref, start, x, y;
    this.playfield = playfield1;
    if (input == null) {
      input = [];
    }
    if (options == null) {
      options = {};
    }
    if (options.jumpLimit == null) {
      options.jumpLimit = -1;
    }
    if (options.compiler == null) {
      options.compiler = bef.OptimizingCompiler;
    }
    if (options.fastConditionals == null) {
      options.fastConditionals = false;
    }
    this.stats.compileCalls = 0;
    this.stats.jumpsPerformed = 0;
    this.pathSet = new bef.PathSet();
    this.programState = new bef.ProgramState(this);
    this.programState.setInput(input);
    this.programState.maxChecks = options.jumpLimit;
    start = new bef.Pointer(0, 0, '>', this.playfield.getSize());
    while (true) {
      this.stats.compileCalls++;
      this.graph = this.buildGraph(start);
      registerGraph(this.graph, this.playfield, this.pathSet);
      program = this.compile(this.graph, options);
      program(this.programState);
      if (this.programState.flags.pathInvalidatedAhead) {
        this.programState.flags.pathInvalidatedAhead = false;
        ref = this.programState.flags.exitPoint, x = ref.x, y = ref.y, dir = ref.dir;
        start.set(x, y, dir);
        start.advance();
      }
      if (this.programState.flags.exitRequest) {
        break;
      }
      this.stats.jumpsPerformed++;
      if (this.stats.jumpsPerformed > options.jumpLimit) {
        break;
      }
    }
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.EagerRuntime = EagerRuntime;

}).call(this);

(function() {
  'use strict';
  var GraphCompiler, List, assemble;

  List = bef.List;

  assemble = function(graph, options) {
    var cycledNodes, df, wrapIfLooping;
    if (options == null) {
      options = {};
    }
    cycledNodes = new Set;
    wrapIfLooping = function(node, code) {
      if (cycledNodes.has(node)) {
        return "while (programState.isAlive()) _" + node + ": {\n	" + code + "\n}";
      } else {
        return code;
      }
    };
    df = function(node, prev, stack) {
      var branch, branch0, branch1, branch2, branch3, edgeCode, ending, maybeTight, neighbours, newStack, pBit, path, randomCode, ref, ref1, ref2, ref3, selectCode;
      if (graph.nodes[node] == null) {
        return '';
      }
      if ((stack.find(node)) != null) {
        cycledNodes.add(node);
        return "break _" + node + ";";
      } else {
        neighbours = graph.nodes[node];
        newStack = stack.con(node);
        switch (neighbours.length) {
          case 4:
            branch0 = df(neighbours[0].to, neighbours[0], newStack);
            branch1 = df(neighbours[1].to, neighbours[1], newStack);
            branch2 = df(neighbours[2].to, neighbours[2], newStack);
            branch3 = df(neighbours[3].to, neighbours[3], newStack);
            randomCode = "var choice = programState.randInt(4);\nswitch (choice) {\n	case 0:\n		" + (neighbours[0].assemble()) + "\n		" + branch0 + "\n		break;\n	case 1:\n		" + (neighbours[1].assemble()) + "\n		" + branch1 + "\n		break;\n	case 2:\n		" + (neighbours[2].assemble()) + "\n		" + branch2 + "\n		break;\n	case 3:\n		" + (neighbours[3].assemble()) + "\n		" + branch3 + "\n		break;\n}";
            return wrapIfLooping(node, randomCode);
          case 2:
            if (node === neighbours[0].to) {
              branch1 = df(neighbours[1].to, neighbours[1], newStack);
              maybeTight = ((ref = neighbours[0].assembleTight) != null ? ref : neighbours[0].assemble)();
              selectCode = typeof maybeTight === 'string' ? "while (branchFlag) {\n	" + maybeTight + "\n}\n" + (neighbours[1].assemble()) + "\n" + branch1 : "if (branchFlag) {\n	" + maybeTight.pre + "\n	while (branchFlag) {\n		" + maybeTight.body + "\n	}\n	" + maybeTight.post + "\n}\n" + (neighbours[1].assemble()) + "\n" + branch1;
            } else if (node === neighbours[1].to) {
              branch0 = df(neighbours[0].to, neighbours[0], newStack);
              maybeTight = ((ref1 = neighbours[1].assembleTight) != null ? ref1 : neighbours[1].assemble)();
              selectCode = typeof maybeTight === 'string' ? "while (!branchFlag) {\n	" + (neighbours[1].assemble()) + "\n}\n" + (neighbours[0].assemble()) + "\n" + branch0 : "if (!branchFlag) {\n	" + maybeTight.pre + "\n	while (!branchFlag) {\n		" + maybeTight.body + "\n	}\n	" + maybeTight.post + "\n}\n" + (neighbours[0].assemble()) + "\n" + branch0;
            } else {
              branch0 = df(neighbours[0].to, neighbours[0], newStack);
              branch1 = df(neighbours[1].to, neighbours[1], newStack);
              selectCode = "if (branchFlag) {\n	" + (neighbours[0].assemble()) + "\n	" + branch0 + "\n} else {\n	" + (neighbours[1].assemble()) + "\n	" + branch1 + "\n}";
            }
            return wrapIfLooping(node, selectCode);
          case 1:
            branch = df(neighbours[0].to, neighbours[0], newStack);
            pBit = (prev != null ? (ref2 = prev.path.path) != null ? ref2.ending.char : void 0 : void 0) === 'p' ? ((ref3 = prev.path, path = ref3.path, ref3), (ending = path.ending, path), "var x = programState.pop();\nvar y = programState.pop();\nvar e = programState.pop();\nprogramState.put(x, y, e, " + ending.x + ", " + ending.y + ", '" + ending.dir + "', '" + path.from + "', '" + path.to + "');\nif (programState.flags.pathInvalidatedAhead) {\n	return;\n}") : '';
            edgeCode = pBit + "\n" + (neighbours[0].assemble()) + "\n" + branch;
            return wrapIfLooping(node, edgeCode);
          case 0:
            return 'return;';
        }
      }
    };
    return "var stack = programState.stack\nvar branchFlag = 0\n" + (df(graph.start, null, List.EMPTY));
  };

  GraphCompiler = {
    assemble: assemble
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.GraphCompiler = GraphCompiler;

}).call(this);

(function() {
  'use strict';
  var LazyRuntime, findPath;

  findPath = bef.PathFinder.findPath;

  LazyRuntime = function() {
    this.playfield = null;
    this.pathSet = null;
    this.stats = {
      compileCalls: 0,
      jumpsPerformed: 0
    };
  };

  LazyRuntime.prototype.put = function(x, y, e) {
    var paths;
    if (!this.playfield.isInside(x, y)) {
      return;
    }
    paths = this.playfield.getPathsThrough(x, y);
    paths.forEach((function(_this) {
      return function(path) {
        _this.pathSet.remove(path);
        _this.playfield.removePath(path);
      };
    })(this));
    this.playfield.setAt(x, y, e);
  };

  LazyRuntime.prototype.get = function(x, y) {
    var char;
    if (!this.playfield.isInside(x, y)) {
      return 0;
    }
    char = this.playfield.getAt(x, y);
    return char.charCodeAt(0);
  };

  LazyRuntime.prototype._registerPath = function(path, compiler) {
    var code;
    this.stats.compileCalls++;
    code = "stack = programState.stack;\n" + (compiler.assemble(path));
    path.code = code;
    path.body = new Function('programState', code);
    if (path.list.length > 0) {
      this.pathSet.add(path);
      this.playfield.addPath(path);
    }
  };

  LazyRuntime.prototype._getCurrentPath = function(start, compiler) {
    var newPath, path;
    path = this.pathSet.getStartingFrom(start.x, start.y, start.dir);
    if (path == null) {
      newPath = findPath(this.playfield, start);
      path = (function() {
        switch (newPath.type) {
          case 'simple':
            newPath.path.ending = null;
            this._registerPath(newPath.path, compiler);
            return newPath.path;
          case 'looping':
            newPath.loopingPath.ending = null;
            this._registerPath(newPath.loopingPath, compiler);
            return newPath.loopingPath;
          case 'composed':
            newPath.initialPath.ending = null;
            newPath.loopingPath.ending = null;
            this._registerPath(newPath.initialPath, compiler);
            this._registerPath(newPath.loopingPath, compiler);
            return newPath.initialPath;
        }
      }).call(this);
    }
    return path;
  };

  LazyRuntime.prototype._turn = function(pointer, char) {
    var dir;
    dir = (function() {
      switch (char) {
        case '|':
          if (this.programState.pop()) {
            return '^';
          } else {
            return 'v';
          }
          break;
        case '_':
          if (this.programState.pop()) {
            return '<';
          } else {
            return '>';
          }
          break;
        case '?':
          return '^<v>'[Math.random() * 4 | 0];
      }
    }).call(this);
    pointer.turn(dir);
    pointer.advance();
  };

  LazyRuntime.prototype.execute = function(playfield, options, input) {
    var currentChar, currentPath, e, pathEndPoint, pointer, x, y;
    this.playfield = playfield;
    if (input == null) {
      input = [];
    }
    if (options == null) {
      options = {};
    }
    if (options.jumpLimit == null) {
      options.jumpLimit = -1;
    }
    if (options.compiler == null) {
      options.compiler = bef.OptimizingCompiler;
    }
    this.stats.compileCalls = 0;
    this.stats.jumpsPerformed = 0;
    this.pathSet = new bef.PathSet();
    this.programState = new bef.ProgramState(this);
    this.programState.setInput(input);
    pointer = new bef.Pointer(0, 0, '>', this.playfield.getSize());
    while (true) {
      if (this.stats.jumpsPerformed === options.jumpLimit) {
        break;
      }
      this.stats.jumpsPerformed++;
      currentPath = this._getCurrentPath(pointer, options.compiler);
      currentPath.body(this.programState);
      if (currentPath.list.length) {
        pathEndPoint = currentPath.getEndPoint();
        pointer.set(pathEndPoint.x, pathEndPoint.y, pathEndPoint.dir);
        if (currentPath.looping) {
          pointer.advance();
          continue;
        }
      }
      currentChar = this.playfield.getAt(pointer.x, pointer.y);
      if (currentChar === '@') {
        break;
      }
      if (currentChar === 'p') {
        e = String.fromCharCode(this.programState.pop());
        y = this.programState.pop();
        x = this.programState.pop();
        this.put(x, y, e);
        pointer.advance();
      } else {
        this._turn(pointer, currentChar);
      }
    }
  };

  if (window.bef == null) {
    window.bef = {};
  }

  window.bef.LazyRuntime = LazyRuntime;

}).call(this);
