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


  equals: function(otherTree) {
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
              if (this.children[i].equals(otherChildren[j])) {
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
            for (var j = 0; j < otherTree.children.length; j++) {
              if (!this.children[i].equals(otherTree.children[j])) {
                return false; 
              }
            }
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
    },

    "add": {
      validate: function(children) { return children.length >=  2; },
      evalOp: function(values) { 
        return _.reduce(values, function(accum, val) {
          return accum + val; 
        });      
      },
    },

    "frac": {
      validate: function(children) { return children.length == 2; }, 
      evalOp: function(accum, val) { 
        // Eval to decimal? 
        // Simplify numbers? 
        // Cancel vars/constants/numbers? 
      },
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


//})();


