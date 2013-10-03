//module.exports = (function() {

function Expression(type, val, children) {
  this.initExpression(type, val, children);
}

_.extend(Expression.prototype, {
  
  initExpression: function(type, val, children) {
    this.type = type;
    this.val = val;
    this.children = children;
    if (children) {
      for (var i = 0; i < children.length; i ++) {
        children[i].parent = this;
      }
    }
  },

  clone: function(setHistory) {
    var children = null;

    if (this.children) {
      children = new Array(this.children.length);
      for (var i = 0; i < this.children.length; i++) {
        var child = this.children[i].clone(false);
        children[i] = child;
      }
    }

    var clone = new this.constructor(this.val, children);
    if (setHistory)
      clone.history = this;

    return clone;
  },

//do we want to return an array of matches?
  searchForTreeMatches: function(otherTree) {
    var matches = new Array();

    var traverseTree = function(baseTree, searchingFor, matchesArr, index) {
      if (baseTree.equals(searchingFor)) {
        var matchInfo = {match: baseTree, childArrIndex: index};
        matchesArr.push(matchInfo);
      } else if (baseTree.children) {
        for (var i = 0; i < baseTree.children.length; i++) {
          var currChild = baseTree.children[i];
          traverseTree(currChild, searchingFor, matchesArr, i);

        }
      }
    }

    traverseTree(this, otherTree, matches, null);

    return matches;
  },

  getTopMostParent: function() {
    var master = this;
    while (master.parent) {
      master = master.parent;
    }
    return master;
  },


  equals: function(otherTree, symbolTable) {
    if (otherTree.type === "META") {
      if (symbolTable) {
        if (symbolTable[otherTree.val])
          return this.equals(symbolTable[otherTree.val], symbolTable);
        else {
          symbolTable[otherTree.val] = this;
          return true;
        }
      }
    }
    if (this.type == otherTree.type && this.val == otherTree.val) {
      if (this.children == null && otherTree.children == null) 
        return true; 

      if ((this.children && otherTree.children) && this.children.length == otherTree.children.length) {

        // Commutative equals
        if (this.val === "add" || this.val === "mult" || this.type === "EQUAL") {
          var otherChildren = new Array(); 
          for (var i = 0; i < otherTree.children.length; i++) {
            otherChildren.push(otherTree.children[i]); 
          }

          for (var i = 0; i < this.children.length; i++) {
            var match = false; 

            for (var j = 0; j < otherChildren.length; j++) {
              if (this.children[i].equals(otherChildren[j], symbolTable)) {
                match = true; 
                otherChildren.splice(j, 1);
                break; 
              }
            }

            if (match == false) 
              return false; 
          }

          return true; 

        // Non-commutative equals
        } else {
          for (var i = 0; i < this.children.length; i++) {
            if (!this.children[i].equals(otherTree.children[i], symbolTable))
              return false;
          }
          return true; 
        }
      } else {
        return false; 
      }
    } else {
      return false; 
    }
  }


});

//**********************************************
// META
//**********************************************
function Meta(val) {
  //think about what checks I want to put on this
  this.initExpression("META", val, null)
}

_.extend(Expression.prototype, {
  isMeta: function() {
    return this.type === "META";
  }
})

_.extend(Meta.prototype, Expression.prototype);

//**********************************************
// NUM
//**********************************************
function Num(val) {
  var integer = parseInt(val); 
  var intRegex = /^\d+$/;
  if(!intRegex.test(val)) {
    throw "Number values must be nonnegative integers."; 
  }
  this.initExpression("NUM", integer, null);
}

_.extend(Expression.prototype, {
  isNum: function() {
    return this.type === "NUM";
  }
})

_.extend(Num.prototype, Expression.prototype, {
  eval: function() {
    return this.val;
  }
});


//**********************************************
// VAR
//**********************************************
function Var(val) {
  this.initExpression("VAR", val, null);
}

_.extend(Expression.prototype, {
  isVar: function() {
    return this.type === "VAR";
  }
})

_.extend(Var.prototype, Expression.prototype, {
  eval: function(bound_vars) {
    return bound_vars[this.val];
  }
});


//**********************************************
// CONST
//**********************************************
function Const(val) {
  if (!this.validConsts[val]) {
    throw "Attempted to create constant with unrecognized val:" + val;
  }
  this.initExpression("CONST", val, null);
}

_.extend(Expression.prototype, {
  isConst: function() {
    return this.type === "CONST"
  }
})

_.extend(Const.prototype, Expression.prototype, {
  eval: function(bound_vars) {
    return this.validConsts[this.val];
  },

  validConsts: {
    "pi": Math.PI,
    "e" : Math.E
    // NEED TO ADD TEX SYMBOLS?>>  i.e. "//pi"
  }
});



//**********************************************
// EQUAL
//**********************************************
function Equal(val, children) {
  if (children.length != 2) {
    throw "Equality operator requires exactly 2 operands";
  } 
  this.initExpression("EQUAL", val, children);
}

_.extend(Expression.prototype, {
  isEqual: function() {
    return this.type === "EQUAL"
  }
})

_.extend(Equal.prototype, Expression.prototype, {
  eval: function(bound_vars) {
    return this.children[0].eval(bound_vars) === this.children[1].eval(bound_vars);
  }
});


//**********************************************
// OPER
//**********************************************
function Oper(val, children) {

  //TODO: Do a data-driven validation
  
  if (!this.validOpers[val])
    throw "Unknown operator " + val;

  if (!this.validOpers[val].validate(children))
    throw "Could not validate operator " + val + " with children " + children;

  this.initExpression("OPER", val, children);
}

_.extend(Expression.prototype, {
  isOper: function() {
    return this.type === "OPER"
  }
})

_.extend(Oper.prototype, Expression.prototype, {

  validOpers: {
    
    "mult": {
      validate: function(children) { return children.length >= 2; },
      evalOp: function(values) { 
        return _.reduce(values, function(accum, val) {
          return accum * val; 
        });
      },
      simpOp: function(exp) {
        var child1 = splitExp(exp.children[0]);
        var child2 = splitExp(exp.children[1]);
        var children = new Array();
        var product = child1.num * child2.num;
        var numChild = new Num(Math.abs(product));
        if (product < 0) numChild = new Oper("neg", [numChild]);
        if (product === 0) {
          numChild = Mutations.replaceExp(exp, numChild);
          return numChild;
        }

        if(child1.notNum) fillMultArray(children, child1.notNum);
        if(child2.notNum) fillMultArray(children, child2.notNum);

        if (children.length === 0) {
          numChild = Mutations.replaceExp(exp, numChild);
          return numChild;
        }

        var newChild = null;
        if (numChild.val !== 1) {
          for (var j = 0; j < children.length; j++) {
            var match = false;
            var multChild = null;
            if (children.length > 1)
              multChild = new Oper("mult", children);
            else
              multChild = children[0];
            var withNum = new Oper("mult", [numChild, multChild])
            for (var m in multTemplates) {
              var symTable = {};
              if(withNum.equals(multTemplates[m].template(), symTable)) {
                var rewrite = multTemplates[m].rewrite(symTable);
                if (rewrite.val === "mult")
                  children = rewrite.children;
                else
                  children = [rewrite];
                match = true;
                break;
              } else
                symTable = {};
            }
            if (match) break;
          }
        }
        if (children.length > 1) {
          exp.children = children;
          for (var i = 0; i < children.length; i++)
            children[i].parent = exp;
          return exp;
        } else {
          newChild = children[0];
          newChild = Mutations.replaceExp(exp, newChild);
          return newChild;
        }
      }
    },

    "add": {
      validate: function(children) { return children.length >=  2; },
      evalOp: function(values) { 
        return _.reduce(values, function(accum, val) {
          return accum + val; 
        });      
      },

      //adapt for negative numbers
      simpOp: function(exp) {

        var child1 = exp.children[0];
        var child2 = exp.children[1];

        var splitChild1 = splitExp(child1);
        var splitChild2 = splitExp(child2);

        var newChild = null;
        var numChild = null;

        if (splitChild1.notNum && splitChild2.notNum && splitChild1.notNum.val === "frac" && splitChild2.notNum.val === "frac") {
          if (splitChild1.notNum.children[1].equals(splitChild2.notNum.children[1])) {
            var addChildren = new Array(2);
            addChildren[0] = new Oper("mult", [new Num(Math.abs(splitChild1.num)), splitChild1.notNum.children[0]]);
            if (splitChild1.num < 0) addChildren[0] = new Oper("neg", [addChildren[0]]);
            addChildren[1] = new Oper("mult", [new Num(Math.abs(splitChild2.num)), splitChild2.notNum.children[0]]);
            if (splitChild2.num < 0) addChildren[1] = new Oper("neg", [addChildren[1]]);

            var fracNumer = new Oper("add", addChildren);
            newChild = new Oper("frac", [fracNumer, splitChild1.notNum.children[1]]);
          }
        }

        if (splitChild1.notNum === splitChild2.notNum || (splitChild1.notNum && splitChild1.notNum.equals(splitChild2.notNum))) {

          var numVal = splitChild1.num + splitChild2.num;
          numChild = new Num(Math.abs(numVal));
          if (numVal < 0)
            numChild = new Oper("neg", [numChild]);

          if (numVal === 0 || !splitChild1.notNum) {
            newChild = numChild;
          } else {
            var children = new Array(2);
            children[0] = numChild;
            children[1] = splitChild1.notNum;
            newChild = new Oper("mult", children);
          }
        }

        if (newChild) {
          newChild = Mutations.replaceExp(exp, newChild);
          return newChild;
        } else
          return exp;
      }
    },

    "frac": {
      validate: function(children) {
        var denominator = children[1].clone()
        if (denominator.type === "OPER")
          denominator = denominator.simplify();
        return children.length == 2 && denominator.val !== 0; 
      }, 
      evalOp: function(accum, val) {
        // Eval to decimal? 
        // Simplify numbers? 
        // Cancel vars/constants/numbers? 
      },
      simpOp: function(exp) {
        var splitNumer = splitExp(exp.children[0]);
        var splitDenom = splitExp(exp.children[1]);
        var numericNumerator = splitNumer.num;
        var numericDenominator = splitDenom.num;
        var symbolicNumerator = splitNumer.notNum;
        var symbolicDenominator = splitDenom.notNum;

        var simplifiedNumeric = null;

        var numerQuotient = numericNumerator/numericDenominator;
        if (numerQuotient===+numerQuotient && numerQuotient===(numerQuotient|0)) {
          simplifiedNumeric = new Num(Math.abs(numerQuotient));
        }  else {
          simplifiedNumeric = new Oper("frac", [new Num(Math.abs(numericNumerator)), new Num(Math.abs(numericDenominator))]);
        }

        if (numerQuotient < 0) {
          simplifiedNumeric = new Oper("neg", [simplifiedNumeric]);
        }

        if (!symbolicNumerator && !symbolicDenominator) {
          exp = Mutations.replaceExp(exp, simplifiedNumeric);
          return exp;
        }
        
        if (symbolicNumerator && symbolicDenominator) {
          var simplifiedSymbolic = new Oper("frac", [symbolicNumerator, symbolicDenominator]);
          if (symbolicNumerator.val === "mult" || symbolicDenominator.val === "mult") {
            var simplifiedChildren = compChildrenArrays(simplifiedSymbolic);
            if (simplifiedChildren.length > 1) {
              simplifiedSymbolic = new Oper("mult", simplifiedChildren);
              simplifiedSymbolic = simplifiedSymbolic.getTopMostParent().simplify();
              Mutations.flattenTree(simplifiedSymbolic);
              if (simplifiedSymbolic.val === "frac" || simplifiedSymbolic.val ==="mult")
                simplifiedSymbolic = simplifiedSymbolic.getTopMostParent().simplify();

            } else {
              simplifiedSymbolic = simplifiedChildren[0];
            }            
          } else {
            var canDivide = divide(simplifiedSymbolic);
            if (canDivide)
              simplifiedSymbolic = canDivide;
          }
        }

        if (!symbolicNumerator)
          simplifiedSymbolic = new Oper("frac", [new Num(1), symbolicDenominator]);
        if (!symbolicDenominator)
          simplifiedSymbolic = symbolicNumerator;

        var mult = new Oper("mult", [simplifiedNumeric, simplifiedSymbolic]);
        mult.simplify();
        mult = Mutations.replaceExp(exp, mult);          
        return mult;      
      }
    }, 

    "neg" : {
      validate: function(children) { return children.length == 1; }, 
      evalOp: function(values) { 
        return -1 * values[0]; 
      }, 
    }
  },

  eval: function(bound_vars) {
    var values = new Array(this.children.length);
    for (var i = 0; i < this.children.length; i++) {
      values[i] = this.children[i].eval(bound_vars);
    }

    return this.validOpers[this.val].evalOp(values); 
  },

  simplify: function() {
    return this.validOpers[this.val].simpOp(this);
  }
});



//**********************************************
// FUNC
//**********************************************
function Func(val, children) {

  if (!this.validFuncs[val])
    throw "Unknown function " + val;

  if (!this.validFuncs[val].validate(children))
    throw "Could not validate function " + val + " with children " + children;

  this.initExpression("FUNC", val, children);
}

_.extend(Expression.prototype, {
  isFunc: function() {
    return this.type === "FUNC"
  }
})

_.extend(Func.prototype, Expression.prototype, {

  validFuncs: {
    "log": {
      validate: function(children) { return children.length == 2; },
      evalFunc: function(values) { return (Math.log(values[1]) / Math.log(values[0])); }
    }, 

    "ln": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return Math.log(values[0]); }
    }, 

    "sin": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return Math.sin(values[0]); }
    }, 

    "cos": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return Math.cos(values[0]); }
    }, 

    "tan": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return Math.tan(values[0]); }
    }, 

    "sec": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return (1 / Math.cos(values[0]));  }
    }, 

    "csc": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return (1 / Math.sin(values[0])); }
    }, 

    "cot": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return (1 / Math.tan(values[0])); }
    }, 

    "arcsin": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return (Math.asin(values[0])); }
    }, 

    "arccos": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return (Math.acos(values[0])); }
    }, 

    "arctan": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return (Math.atan(values[0])); }
    }, 

    "pow": {
      validate: function(children) { return children.length == 2; },
      evalFunc: function(values) { return Math.pow(values[0], values[1]); }
    }, 

    "exp": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return Math.exp(values[0]); }
    }, 

    "abs": {
      validate: function(children) { return children.length == 1; },
      evalFunc: function(values) { return Math.abs(values[0]); }
    }
  }, 

  eval: function(bound_vars) {
    var values = new Array(this.children.length);
    for (var i = 0; i < this.children.length; i++) {
      values[i] = this.children[i].eval(bound_vars);
    }

    return this.validFuncs[this.val].evalFunc(values); 
  }
});



//**********************************************
// PAREN
//**********************************************
function Paren(val, children) {
  if (children.length != 1) {
    throw "Parentheses operator requires exactly 1 operand";
  } 
  this.initExpression("PAREN", val, children);
}

_.extend(Expression.prototype, {
  isParen: function() {
    return this.type === "PAREN"
  }
})

_.extend(Paren.prototype, Expression.prototype, {
  eval: function() {

  }
});


function CloneForest(exprForest, setHistory) {
  var forestClone = new Array(exprForest.length);
  for (var i = 0; i < exprForest.length; i++) {
    var currExpr = exprForest[i];
    var treeClone = currExpr.clone(setHistory);
    forestClone[i] = treeClone;
  } 
  return forestClone;
}


function SimplifyTree(expTree) {
  if (expTree.type == "mult") {
    var evalChildren = []; 
    for (var i = 0; i < expTree.children.length; i++) {
      if (expTree.children[i].type == "NUM") {
        evalChildren.push(expTree.children[i]); 
      }
    }
    if (evalChildren.length > 1) {
      var total = 1; 
      for (var i = 0; i < evalChildren.length; i++) {
        total *= evalChildren[i]; 
      }
    }
    
  } else if (expTree.type == "add") {

  }
}

function splitExp(exp) {
  var num = 1;
  var notNum = null;
  if (exp.val === "neg") {
    var split = splitExp(exp.children[0]);
    split.num *= -1;
    return split;
  }
  if (exp.val === "mult") {
    var clone = exp.clone(false)

    var i = 0;
    while (i < clone.children.length)
    {
      var currChild = clone.children[i];
      if (currChild.type === "NUM") {
        num *= currChild.val;
        clone.children.splice(i, 1);
      } else if (currChild.val ==="neg" && currChild.children[0].type === "NUM") {
        num *= -1 * currChild.children[0].val;
        clone.children.splice(i, 1);
      } else 
        i++;
    }

    if (clone.validOpers[clone.val].validate(clone.children)) {
      notNum = clone;
    } else {
      clone.children.length > 0 ? notNum = clone.children[0] : notNum = null;
    }
  } else if (exp.type == "NUM") {
    num *= exp.val;
  } else {
    notNum = exp.clone(false);
  }
  var splitObj = {num: num, notNum: notNum};
  return splitObj;

}

function fillMultArray(children, exp) {
  if (exp.val === "mult") {
    for (var i = 0; i < exp.children.length; i++) {
      fillMultArray(children, exp.children[i]);
    }
  } else {
      insertIntoMultChildren(exp, children);
  }
}

function insertIntoMultChildren(exp, multChildren) {
  if (exp.val !== 1){
    var matchFound = false;
    for (var i = 0; i < multChildren.length; i++) {
      var currChild = multChildren[i];
      var mult = new Oper("mult", [currChild, exp]);
      for (var m in multTemplates) {
        var symTable = {};
        if (mult.equals(multTemplates[m].template(), symTable)) {
          var rewrite = multTemplates[m].rewrite(symTable);
          if (!rewrite.equals(mult)) {
            multChildren[i] = rewrite;
            matchFound = true;
            break;
          }
        } else
          symTable = {};
      }
      if (matchFound) break;
    }

    if (!matchFound)
      multChildren.push(exp);
  }
}

function divide(exp) {
  for (var pattern in fracTemplate) {
    var symTable = {};
    if (exp.equals(fracTemplate[pattern].template(), symTable)) {
      return fracTemplate[pattern].rewrite(symTable);
    } else 
      symTable = {};
  }
  return null;
}

//requires a clone
function compChildrenArrays(exp) {

  var numerArr = null;
  var denomArr = null;

  exp.children[0].val === "mult" ? numerArr = exp.children[0].children : numerArr = [exp.children[0]];
  exp.children[1].val === "mult" ? denomArr = exp.children[1].children : denomArr = [exp.children[1]];

  var resultChildren = new Array();
  var i = 0; 

  while (i < numerArr.length) {
    var currNumer = numerArr[i];
    var j = 0;
    i++;
    while (j < denomArr.length) {
      var currDenom = denomArr[j];
      var currFrac = new Oper("frac", [currNumer, currDenom]);
      var simplified = divide(currFrac);
      if (simplified) {
        numerArr.splice(i-1, 1);
        denomArr.splice(j, 1);
        resultChildren.push(simplified);
        i--;
        break;
      }
      j++;
    }
  }

  for(var n = 0; n < numerArr.length; n++) 
    resultChildren.push(numerArr[n]);
  
  for(var d = 0; d < denomArr.length; d++)
    resultChildren.push(new Oper("frac", [new Num(1), denomArr[d]]));

  return resultChildren;
}

//})();


